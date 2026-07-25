import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { completeSprintSchema } from '@/lib/validation/schemas';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { logActivity } from '@/lib/activity-logger';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sprints/[id]/complete
 * ACTIVE → COMPLETED (terminal). The caller decides where unfinished items
 * go — 'backlog' or another sprint — and that decision is recorded on the
 * sprint row (rolloverTargetId). Completion snapshot is written once, here.
 *
 * Project ADMIN+ only (approved decision): completion writes permanent
 * historical snapshots and an org audit entry.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;
    const userId = auth.session.user.id;

    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { project: { select: { organizationId: true, name: true } } },
    });
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, userId, 'ADMIN');
    if (!access.authorized) return access.error;

    if (sprint.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot complete a ${sprint.status.toLowerCase()} sprint` },
        { status: 409 }
      );
    }

    const parsed = completeSprintSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'A rollover decision is required: { rolloverTo: "backlog" | sprintId }' },
        { status: 400 }
      );
    }

    const { rolloverTo } = parsed.data;
    let rolloverTargetId: string | null = null;

    if (rolloverTo !== 'backlog') {
      const target = await prisma.sprint.findFirst({
        where: { id: rolloverTo, deletedAt: null },
        select: { id: true, projectId: true, status: true },
      });
      if (
        !target ||
        target.projectId !== sprint.projectId ||
        target.id === sprint.id ||
        target.status === 'COMPLETED'
      ) {
        return NextResponse.json(
          { error: 'Rollover target must be a different, non-completed sprint in the same project' },
          { status: 400 }
        );
      }
      rolloverTargetId = target.id;
    }

    const settings = await resolveProjectSettings(sprint.projectId);
    const estimateField = settings?.estimationUnit === 'POINTS' ? 'storyPoints' : 'estimate';

    // Budget snapshots sum only the org's budget currency — mixing
    // currencies would produce a meaningless number (design §3.1)
    const orgSettings = await prisma.organizationSettings.findUnique({
      where: { organizationId: sprint.project.organizationId },
      select: { budgetCurrency: true },
    });
    const VALID_CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP', 'CNY'] as const;
    const budgetCurrency = (VALID_CURRENCIES as readonly string[]).includes(
      orgSettings?.budgetCurrency ?? ''
    )
      ? (orgSettings!.budgetCurrency as (typeof VALID_CURRENCIES)[number])
      : 'ETB';

    const result = await prisma.$transaction(async (tx) => {
      // Completion snapshot: what actually got DONE
      const [doneCount, doneSum, unfinished] = await Promise.all([
        tx.task.count({
          where: { sprintId: params.id, deletedAt: null, status: 'DONE' },
        }),
        tx.task.aggregate({
          where: { sprintId: params.id, deletedAt: null, status: 'DONE' },
          _sum: { estimate: true, storyPoints: true },
        }),
        tx.task.count({
          where: { sprintId: params.id, deletedAt: null, status: { not: 'DONE' } },
        }),
      ]);

      // Rollover: unfinished items move; DONE items stay for history
      await tx.task.updateMany({
        where: { sprintId: params.id, deletedAt: null, status: { not: 'DONE' } },
        data: { sprintId: rolloverTargetId, sprintOrder: null },
      });

      // Budget snapshot (Tier 2b): allocations of delivered issues (the ones
      // still in the sprint after rollover), org currency only, write-once
      const budgetAgg = await tx.taskBudget.aggregate({
        where: {
          currency: budgetCurrency,
          task: { sprintId: params.id, deletedAt: null },
        },
        _sum: { estimatedCost: true, actualCost: true },
      });

      const completed = await tx.sprint.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          completedCount: doneCount,
          completedEstimate: doneSum._sum[estimateField] ?? 0,
          rolloverTargetId,
          budgetPlanned: budgetAgg._sum.estimatedCost,
          budgetInvested: budgetAgg._sum.actualCost,
        },
      });

      return { completed, unfinished };
    });

    logActivity({
      organizationId: sprint.project.organizationId,
      userId,
      entityType: 'SPRINT',
      entityId: sprint.id,
      action: 'COMPLETED',
      metadata: {
        projectId: sprint.projectId,
        committedCount: sprint.committedCount,
        completedCount: result.completed.completedCount,
        rolledOver: result.unfinished,
        rolloverTargetId,
      },
    });

    logOrgAction({
      organizationId: sprint.project.organizationId,
      actorId: userId,
      actorEmail: auth.session.user.email || '',
      actorRole: access.membership?.role || 'MEMBER',
      action: OrgActions.SPRINT_COMPLETED,
      resource: 'sprint',
      resourceId: sprint.id,
      resourceName: sprint.name,
      before: { status: 'ACTIVE', committedCount: sprint.committedCount },
      after: {
        status: 'COMPLETED',
        completedCount: result.completed.completedCount,
        completedEstimate: result.completed.completedEstimate,
        rolledOver: result.unfinished,
        rolloverTargetId,
        budgetPlanned: result.completed.budgetPlanned?.toString() ?? null,
        budgetInvested: result.completed.budgetInvested?.toString() ?? null,
        budgetCurrency,
      },
      request: req,
    });

    return NextResponse.json({ sprint: result.completed, rolledOver: result.unfinished });
  } catch (error) {
    logger.error('Error completing sprint', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
