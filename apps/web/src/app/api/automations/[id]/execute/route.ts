import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { executeRule } from '@/lib/automation-engine';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/automations/[id]/execute
 *
 * Manually execute an automation rule against a specific entity.
 * Used by the UI "Run now" button. Automatic triggers fire via
 * triggerAutomations() in the entity lifecycle routes.
 */
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

    // Delegate to the shared engine
    const result = await executeRule({
      rule: {
        id: automation.id,
        name: automation.name,
        conditions: automation.conditions,
        actions: automation.actions,
      },
      entityType: entityType as any,
      entityId,
      userId: session.user.id,
    });

    const message =
      result.status === 'SUCCESS'
        ? 'Automation executed successfully'
        : result.status === 'SKIPPED'
        ? 'Automation skipped — conditions not met'
        : result.status === 'PARTIAL_SUCCESS'
        ? 'Automation partially executed — some actions failed'
        : 'Automation execution failed';

    return NextResponse.json({
      execution: {
        ruleId: result.ruleId,
        ruleName: result.ruleName,
        status: result.status,
        conditionsMatched: result.conditionsMatched,
        actionsExecuted: result.actionsExecuted,
        actionsFailed: result.actionsFailed,
        executionTimeMs: result.executionTimeMs,
        errors: result.errors,
        entityType,
        entityId,
      },
      message,
    });
  } catch (error) {
    logger.error('Error executing automation', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      { error: 'Failed to execute automation' },
      { status: 500 }
    );
  }
}
