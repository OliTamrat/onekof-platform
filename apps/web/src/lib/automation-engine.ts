/**
 * Automation Engine
 *
 * Evaluates automation rule conditions and dispatches actions. Used by
 * both the manual execute endpoint (/api/automations/[id]/execute) and
 * the automatic triggering hooks in task lifecycle routes.
 *
 * A rule is a JSON blob stored on AutomationRule with:
 * - conditions: array of { field, operator, value } objects (AND-joined)
 * - actions: array of { type, params } objects
 *
 * The engine is intentionally defensive: every error is caught so a
 * broken rule can never crash a user-facing API request.
 */

import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export type TriggerEvent =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | 'FIELD_CHANGED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'DUE_DATE_APPROACHING'
  | 'DUE_DATE_PASSED'
  | 'BLOCKED'
  | 'COMMENTED'
  | 'PROGRESS_THRESHOLD_REACHED'
  | 'BUDGET_THRESHOLD_REACHED';

export type EntityType = 'TASK' | 'PROJECT' | 'COMMENT' | 'MILESTONE' | 'GOAL';

export interface AutomationCondition {
  field: string;
  operator: string;
  value?: any;
}

export interface AutomationAction {
  type: string;
  params?: Record<string, any>;
}

export interface ExecutionResult {
  ruleId: string;
  ruleName: string;
  status: 'SUCCESS' | 'SKIPPED' | 'PARTIAL_SUCCESS' | 'FAILED';
  conditionsMatched: boolean;
  actionsExecuted: number;
  actionsFailed: number;
  executionTimeMs: number;
  errors: string[];
}

/**
 * Fetch an entity by type + id. Returns null if not found.
 * Only selects scalar fields — relations must be queried separately.
 */
async function fetchEntity(entityType: EntityType, entityId: string): Promise<any | null> {
  try {
    switch (entityType) {
      case 'TASK':
        return await prisma.task.findUnique({ where: { id: entityId } });
      case 'PROJECT':
        return await prisma.project.findUnique({ where: { id: entityId } });
      case 'GOAL':
        return await prisma.goal.findUnique({ where: { id: entityId } });
      case 'COMMENT':
        return await prisma.comment.findUnique({ where: { id: entityId } });
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Evaluate a single condition against an entity's scalar fields.
 * Supports:
 * - equals, not_equals
 * - contains (string), not_contains
 * - greater_than, less_than, greater_equal, less_equal
 * - is_set, is_not_set (aliases: is_empty, is_not_empty)
 * - in (value is array), not_in
 */
export function evaluateCondition(condition: AutomationCondition, entity: any): boolean {
  if (!entity || !condition || !condition.field) return false;

  const fieldValue = entity[condition.field];
  const targetValue = condition.value;
  const op = (condition.operator || '').toLowerCase();

  switch (op) {
    case 'equals':
    case '==':
      return fieldValue === targetValue;

    case 'not_equals':
    case '!=':
      return fieldValue !== targetValue;

    case 'contains':
      return String(fieldValue ?? '').includes(String(targetValue ?? ''));

    case 'not_contains':
      return !String(fieldValue ?? '').includes(String(targetValue ?? ''));

    case 'greater_than':
    case '>':
      return Number(fieldValue) > Number(targetValue);

    case 'less_than':
    case '<':
      return Number(fieldValue) < Number(targetValue);

    case 'greater_equal':
    case '>=':
      return Number(fieldValue) >= Number(targetValue);

    case 'less_equal':
    case '<=':
      return Number(fieldValue) <= Number(targetValue);

    case 'is_set':
    case 'is_not_empty':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';

    case 'is_not_set':
    case 'is_empty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';

    case 'in':
      return Array.isArray(targetValue) && targetValue.includes(fieldValue);

    case 'not_in':
      return Array.isArray(targetValue) && !targetValue.includes(fieldValue);

    default:
      logger.warn('Unknown automation operator', { operator: op });
      return false;
  }
}

/**
 * Evaluate ALL conditions for a rule (AND-logic). Returns true only if
 * every condition passes. An empty conditions array is treated as "match
 * everything" so rules can run unconditionally.
 */
export function evaluateConditions(conditions: AutomationCondition[], entity: any): boolean {
  if (!Array.isArray(conditions) || conditions.length === 0) return true;
  return conditions.every((c) => evaluateCondition(c, entity));
}

/**
 * Execute a single action. Throws on failure so the caller can track
 * per-action success/failure counts.
 *
 * Supported action types:
 * - assign_to_user / assign_to       : sets assigneeId on task
 * - change_status                     : sets status on task/project
 * - update_field                      : sets any scalar field (params.field + params.value)
 * - add_comment                       : adds a comment on a task
 * - add_label                         : appends to labels JSON array on task
 * - send_notification                 : fire-and-forget notification log
 */
async function executeAction(
  action: AutomationAction,
  entityType: EntityType,
  entityId: string,
  userId: string
): Promise<void> {
  const type = (action.type || '').toLowerCase();
  const params = action.params || {};

  switch (type) {
    case 'assign_to_user':
    case 'assign_to': {
      if (entityType !== 'TASK') {
        throw new Error('assign_to only supported for TASK entities');
      }
      await prisma.task.update({
        where: { id: entityId },
        data: { assigneeId: params.userId || params.assigneeId || null },
      });
      return;
    }

    case 'change_status': {
      if (entityType === 'TASK') {
        await prisma.task.update({
          where: { id: entityId },
          data: { status: params.status },
        });
      } else if (entityType === 'PROJECT') {
        await prisma.project.update({
          where: { id: entityId },
          data: { status: params.status },
        });
      } else {
        throw new Error(`change_status not supported for ${entityType}`);
      }
      return;
    }

    case 'update_field': {
      const updateData: any = { [params.field]: params.value };
      if (entityType === 'TASK') {
        await prisma.task.update({ where: { id: entityId }, data: updateData });
      } else if (entityType === 'PROJECT') {
        await prisma.project.update({ where: { id: entityId }, data: updateData });
      } else {
        throw new Error(`update_field not supported for ${entityType}`);
      }
      return;
    }

    case 'add_comment': {
      if (entityType !== 'TASK') {
        throw new Error('add_comment only supported for TASK entities');
      }
      await prisma.comment.create({
        data: {
          taskId: entityId,
          authorId: userId,
          content: params.comment || params.content || '(automated comment)',
        },
      });
      return;
    }

    case 'add_label': {
      if (entityType !== 'TASK') {
        throw new Error('add_label only supported for TASK entities');
      }
      const current = await prisma.task.findUnique({
        where: { id: entityId },
        select: { labels: true },
      });
      const existing: any[] = Array.isArray(current?.labels) ? (current!.labels as any[]) : [];
      const newLabel = params.label || params.value;
      if (newLabel && !existing.includes(newLabel)) {
        await prisma.task.update({
          where: { id: entityId },
          data: { labels: [...existing, newLabel] },
        });
      }
      return;
    }

    case 'send_notification': {
      // Placeholder — real notification dispatching hooks into the same
      // email helpers used by the task events. For now just log.
      logger.info('Automation send_notification', { params, entityType, entityId });
      return;
    }

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * Execute a single automation rule against an entity.
 * - Fetches the entity
 * - Evaluates conditions (skips if any fail)
 * - Dispatches actions sequentially, tracking success/failure per action
 * - Updates the rule's executionCount + lastExecutedAt
 */
export async function executeRule(params: {
  rule: { id: string; name: string; conditions: any; actions: any };
  entityType: EntityType;
  entityId: string;
  userId: string;
}): Promise<ExecutionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let conditionsMatched = true;
  let actionsExecuted = 0;
  let actionsFailed = 0;
  let status: ExecutionResult['status'] = 'SUCCESS';

  try {
    const entity = await fetchEntity(params.entityType, params.entityId);
    if (!entity) {
      return {
        ruleId: params.rule.id,
        ruleName: params.rule.name,
        status: 'FAILED',
        conditionsMatched: false,
        actionsExecuted: 0,
        actionsFailed: 0,
        executionTimeMs: Date.now() - startTime,
        errors: ['Entity not found'],
      };
    }

    const conditions = (params.rule.conditions || []) as AutomationCondition[];
    const actions = (params.rule.actions || []) as AutomationAction[];

    conditionsMatched = evaluateConditions(conditions, entity);

    if (!conditionsMatched) {
      status = 'SKIPPED';
    } else {
      for (const action of actions) {
        try {
          await executeAction(action, params.entityType, params.entityId, params.userId);
          actionsExecuted++;
        } catch (err) {
          actionsFailed++;
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }

      if (actionsFailed > 0) {
        status = actionsExecuted > 0 ? 'PARTIAL_SUCCESS' : 'FAILED';
      }
    }

    // Update rule statistics (non-blocking failure)
    try {
      await prisma.automationRule.update({
        where: { id: params.rule.id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });
    } catch {
      // stats update failure shouldn't affect the execution result
    }
  } catch (err) {
    status = 'FAILED';
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    ruleId: params.rule.id,
    ruleName: params.rule.name,
    status,
    conditionsMatched,
    actionsExecuted,
    actionsFailed,
    executionTimeMs: Date.now() - startTime,
    errors,
  };
}

/**
 * Find and run all enabled automation rules matching a trigger event
 * for an entity. This is the main entry point for automatic triggering
 * from task lifecycle routes.
 *
 * Fire-and-forget: errors are swallowed and logged so the API request
 * that triggered the automation is never affected.
 */
export async function triggerAutomations(params: {
  organizationId: string;
  trigger: TriggerEvent;
  entityType: EntityType;
  entityId: string;
  projectId?: string;
  userId: string;
}): Promise<ExecutionResult[]> {
  try {
    const rules = await prisma.automationRule.findMany({
      where: {
        organizationId: params.organizationId,
        isEnabled: true,
        isTemplate: false,
        deletedAt: null,
        triggerEvent: params.trigger as any,
        entityType: params.entityType as any,
        runMode: 'AUTOMATIC',
        OR: [
          { scope: 'ORGANIZATION' },
          ...(params.projectId ? [{ scope: 'PROJECT' as const, projectId: params.projectId }] : []),
        ],
      },
      orderBy: { executionOrder: 'asc' },
      select: {
        id: true,
        name: true,
        conditions: true,
        actions: true,
      },
    });

    if (rules.length === 0) return [];

    const results: ExecutionResult[] = [];
    for (const rule of rules) {
      const result = await executeRule({
        rule,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
      });
      results.push(result);
    }

    return results;
  } catch (err) {
    logger.error('triggerAutomations failed', {
      error: err instanceof Error ? err.message : err,
      trigger: params.trigger,
      entityType: params.entityType,
      entityId: params.entityId,
    });
    return [];
  }
}
