import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';

// POST /api/automations/[id]/execute - Manually execute automation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automation = await prisma.automationRule.findUnique({
      where: { id: params.id },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: automation.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { entityId, entityType } = body;

    if (!entityId || !entityType) {
      return NextResponse.json(
        { error: 'Entity ID and type required' },
        { status: 400 }
      );
    }

    // Start execution
    const startTime = Date.now();
    let status: any = 'SUCCESS';
    let conditionsMatched = true;
    let actionsExecuted = 0;
    let actionsFailed = 0;
    const executionLog: any = {
      conditions: [],
      actions: [],
      errors: [],
    };

    try {
      // Evaluate conditions
      const conditions = automation.conditions as any[];
      for (const condition of conditions) {
        const result = await evaluateCondition(condition, entityId, entityType);
        executionLog.conditions.push({
          condition,
          result,
        });
        if (!result) {
          conditionsMatched = false;
          break;
        }
      }

      // Execute actions if conditions matched
      if (conditionsMatched) {
        const actions = automation.actions as any[];
        for (const action of actions) {
          try {
            await executeAction(action, entityId, entityType, session.user.id);
            actionsExecuted++;
            executionLog.actions.push({
              action,
              status: 'success',
            });
          } catch (error: any) {
            actionsFailed++;
            executionLog.actions.push({
              action,
              status: 'failed',
              error: error.message,
            });
            executionLog.errors.push(error.message);
          }
        }

        if (actionsFailed > 0) {
          status = actionsExecuted > 0 ? 'PARTIAL_SUCCESS' : 'FAILED';
        }
      } else {
        status = 'SKIPPED';
      }
    } catch (error: any) {
      status = 'FAILED';
      executionLog.errors.push(error.message);
    }

    const executionTime = Date.now() - startTime;

    // Update automation statistics
    await prisma.automationRule.update({
      where: { id: automation.id },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date(),
      },
    });

    // Build execution result for response
    const executionResult = {
      ruleId: automation.id,
      status,
      entityType,
      entityId,
      executionTime,
      conditionsMatched,
      actionsExecuted,
      actionsFailed,
      executionLog,
    };

    return NextResponse.json({
      execution: executionResult,
      message:
        status === 'SUCCESS'
          ? 'Automation executed successfully'
          : status === 'SKIPPED'
          ? 'Automation skipped - conditions not met'
          : status === 'PARTIAL_SUCCESS'
          ? 'Automation partially executed - some actions failed'
          : 'Automation execution failed',
    });
  } catch (error) {
    console.error('Error executing automation:', error);
    return NextResponse.json(
      { error: 'Failed to execute automation' },
      { status: 500 }
    );
  }
}

// Helper function to evaluate conditions
async function evaluateCondition(
  condition: any,
  entityId: string,
  entityType: string
): Promise<boolean> {
  // TODO: Implement actual condition evaluation logic
  // This is a placeholder - you'll need to implement the actual logic
  // based on the entity type and condition parameters

  const { field, operator, value } = condition;

  // Fetch entity data based on type
  let entity: any;
  switch (entityType) {
    case 'PROJECT':
      entity = await prisma.project.findUnique({ where: { id: entityId } });
      break;
    case 'TASK':
      entity = await prisma.task.findUnique({ where: { id: entityId } });
      break;
    case 'GOAL':
      entity = await prisma.goal.findUnique({ where: { id: entityId } });
      break;
    case 'TEAM':
      entity = await prisma.team.findUnique({ where: { id: entityId } });
      break;
    default:
      return false;
  }

  if (!entity) return false;

  // Evaluate based on operator
  const fieldValue = (entity as any)[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not_equals':
      return fieldValue !== value;
    case 'contains':
      return String(fieldValue).includes(value);
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    case 'less_than':
      return Number(fieldValue) < Number(value);
    case 'is_empty':
      return !fieldValue;
    case 'is_not_empty':
      return !!fieldValue;
    default:
      return false;
  }
}

// Helper function to execute actions
async function executeAction(
  action: any,
  entityId: string,
  entityType: string,
  userId: string
): Promise<void> {
  // TODO: Implement actual action execution logic
  // This is a placeholder - you'll need to implement the actual logic
  // based on the action type and parameters

  const { type, params } = action;

  switch (type) {
    case 'assign_to_user':
      // Assign entity to a user
      if (entityType === 'TASK') {
        await prisma.task.update({
          where: { id: entityId },
          data: { assigneeId: params.userId },
        });
      } else if (entityType === 'PROJECT') {
        await prisma.projectMember.create({
          data: {
            projectId: entityId,
            userId: params.userId,
            role: 'MEMBER',
            addedBy: userId,
          },
        });
      }
      break;

    case 'change_status':
      // Change entity status
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
      }
      break;

    case 'add_comment':
      // Add a comment
      await prisma.comment.create({
        data: {
          taskId: entityType === 'TASK' ? entityId : undefined,
          authorId: userId,
          content: params.comment,
        },
      });
      break;

    case 'send_notification':
      // Send notification (placeholder - implement your notification logic)
      console.log('Sending notification:', params);
      break;

    case 'update_field':
      // Update a specific field
      const updateData = { [params.field]: params.value };
      if (entityType === 'TASK') {
        await prisma.task.update({
          where: { id: entityId },
          data: updateData,
        });
      } else if (entityType === 'PROJECT') {
        await prisma.project.update({
          where: { id: entityId },
          data: updateData,
        });
      }
      break;

    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}
