import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateStatusTransition, type TaskStatus } from '@/lib/workflow-engine';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bulkUpdateSchema = z.object({
  issueIds: z.array(z.string()).min(1, 'At least one issue ID required').max(100, 'Maximum 100 issues per batch'),
  action: z.enum(['updateStatus', 'updatePriority', 'updateAssignee', 'delete', 'moveToSprint']),
  value: z.string().optional(), // for moveToSprint: sprintId, or "null" = backlog
});

/**
 * POST /api/issues/bulk
 * Performs bulk operations on multiple issues at once.
 * Supports: status change, priority change, assignee change, soft delete.
 * Max 100 issues per request.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(request, 'dataMutation');
    if (rateLimitError) return rateLimitError;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await request.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { issueIds, action, value } = validation.data;

    const issues = await prisma.task.findMany({
      where: {
        id: { in: issueIds },
        deletedAt: null,
        project: { organizationId: ctx.organizationId },
      },
      select: { id: true, projectId: true, status: true, sprintId: true },
    });

    if (issues.length === 0) {
      return NextResponse.json(
        { error: 'No accessible issues found' },
        { status: 404 }
      );
    }

    const accessibleIds = issues.map(i => i.id);
    let updated = 0;
    let workflowBlocked = 0;

    switch (action) {
      case 'updateStatus': {
        if (!value) {
          return NextResponse.json({ error: 'Status value required' }, { status: 400 });
        }

        // Workflow enforcement (Phase 4): bulk changes obey the same
        // transition rules as single edits — no more bypass. Settings are
        // resolved once per project, invalid transitions are skipped and
        // counted rather than failing the whole batch.
        const projectIds = Array.from(new Set(issues.map(i => i.projectId)));
        const settingsByProject = new Map(
          await Promise.all(
            projectIds.map(async (pid) => [pid, await resolveProjectSettings(pid)] as const)
          )
        );
        const passing = issues.filter((i) => {
          const s = settingsByProject.get(i.projectId);
          return validateStatusTransition(i.status as TaskStatus, value as TaskStatus, {
            enforceWorkflow: s?.enforceWorkflow ?? false,
            transitions: s?.workflowTransitions ?? null,
          }).allowed;
        });
        workflowBlocked = issues.length - passing.length;

        // completedAt semantics: set only on the transition INTO DONE (so an
        // already-DONE task keeps its original completion date), cleared only
        // on the transition OUT of DONE.
        const alreadyDone = passing.filter(i => i.status === 'DONE').map(i => i.id);
        const notDone = passing.filter(i => i.status !== 'DONE').map(i => i.id);

        const [wasDone, wasNotDone] = await prisma.$transaction([
          prisma.task.updateMany({
            where: { id: { in: alreadyDone } },
            data: {
              status: value as any,
              ...(value !== 'DONE' && { completedAt: null }),
            },
          }),
          prisma.task.updateMany({
            where: { id: { in: notDone } },
            data: {
              status: value as any,
              ...(value === 'DONE' && { completedAt: new Date() }),
            },
          }),
        ]);
        updated = wasDone.count + wasNotDone.count;
        break;
      }

      case 'updatePriority': {
        if (!value) {
          return NextResponse.json({ error: 'Priority value required' }, { status: 400 });
        }
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { priority: value as any },
        });
        updated = result.count;
        break;
      }

      case 'updateAssignee': {
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { assigneeId: value || null },
        });
        updated = result.count;
        break;
      }

      case 'delete': {
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { deletedAt: new Date() },
        });
        updated = result.count;
        break;
      }

      case 'moveToSprint': {
        if (!value) {
          return NextResponse.json({ error: 'Sprint ID (or "null" for backlog) required' }, { status: 400 });
        }
        const targetSprintId = value === 'null' ? null : value;
        let movableIds = accessibleIds;

        if (targetSprintId) {
          // Sprints are project-scoped: only tasks in the sprint's project can move in
          const sprint = await prisma.sprint.findFirst({
            where: {
              id: targetSprintId,
              deletedAt: null,
              status: { not: 'COMPLETED' },
              project: { organizationId: ctx.organizationId },
            },
            select: { id: true, projectId: true },
          });
          if (!sprint) {
            return NextResponse.json(
              { error: 'Sprint not found or already completed' },
              { status: 404 }
            );
          }
          movableIds = issues
            .filter(i => i.projectId === sprint.projectId)
            .map(i => i.id);
        }

        const moved = issues.filter(
          i => movableIds.includes(i.id) && i.sprintId !== targetSprintId
        );

        const result = await prisma.task.updateMany({
          where: { id: { in: movableIds } },
          data: { sprintId: targetSprintId, sprintOrder: null },
        });
        updated = result.count;

        // Scope-churn signal: record every sprint membership change.
        // Direct createMany (not logActivity) — no per-task push notification
        // storm on a bulk move.
        if (moved.length > 0) {
          await prisma.userActivity.createMany({
            data: moved.map(i => ({
              organizationId: ctx.organizationId,
              userId: ctx.user.id,
              activityType: 'TASK_SPRINT_CHANGED' as any,
              entityType: 'TASK',
              entityId: i.id,
              action: 'SPRINT_CHANGED',
              metadata: { from: i.sprintId, to: targetSprintId, bulk: true },
            })),
          });
        }
        break;
      }
    }

    logger.info('Bulk operation completed', {
      action,
      requested: issueIds.length,
      accessible: accessibleIds.length,
      updated,
      userId: ctx.user.id,
      organizationId: ctx.organizationId,
    });

    return NextResponse.json({
      success: true,
      action,
      requested: issueIds.length,
      updated,
      skipped: issueIds.length - accessibleIds.length,
      workflowBlocked,
    });
  } catch (error) {
    logger.error('Bulk operation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
