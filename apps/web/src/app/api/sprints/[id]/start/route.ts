import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { Prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { logActivity } from '@/lib/activity-logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Default sprint length when no end date was planned: 2 weeks (approved decision). */
const DEFAULT_SPRINT_DAYS = 14;

/**
 * POST /api/sprints/[id]/start
 * PLANNED → ACTIVE. Writes the commitment snapshot (committedCount /
 * committedEstimate) from the tasks in the sprint at this moment — measured
 * at start so mid-sprint scope churn stays visible forever.
 *
 * The one-active-sprint guarantee is the database's: the partial unique
 * index turns a race into a clean 409, no TOCTOU window.
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
      include: { project: { select: { organizationId: true } } },
    });
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, userId, 'ADMIN');
    if (!access.authorized) return access.error;

    if (sprint.status !== 'PLANNED') {
      return NextResponse.json(
        { error: `Cannot start a ${sprint.status.toLowerCase()} sprint` },
        { status: 409 }
      );
    }

    const startDate = sprint.startDate ?? new Date();
    const endDate =
      sprint.endDate ??
      new Date(startDate.getTime() + DEFAULT_SPRINT_DAYS * 24 * 60 * 60 * 1000);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Sprint end date must be after the start date' },
        { status: 400 }
      );
    }

    const settings = await resolveProjectSettings(sprint.projectId);
    const estimateField = settings?.estimationUnit === 'POINTS' ? 'storyPoints' : 'estimate';

    let started;
    try {
      started = await prisma.$transaction(async (tx) => {
        // Commitment snapshot: what the team signed up for, measured now
        const [countAgg, sumAgg] = await Promise.all([
          tx.task.count({ where: { sprintId: params.id, deletedAt: null } }),
          tx.task.aggregate({
            where: { sprintId: params.id, deletedAt: null },
            _sum: { estimate: true, storyPoints: true },
          }),
        ]);

        return tx.sprint.update({
          where: { id: params.id },
          data: {
            status: 'ACTIVE',
            startDate,
            endDate,
            committedCount: countAgg,
            committedEstimate: sumAgg._sum[estimateField] ?? 0,
          },
        });
      });
    } catch (err) {
      // Partial unique index sprints_one_active_per_project fired
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return NextResponse.json(
          { error: 'This project already has an active sprint. Complete it first.' },
          { status: 409 }
        );
      }
      throw err;
    }

    logActivity({
      organizationId: sprint.project.organizationId,
      userId,
      entityType: 'SPRINT',
      entityId: sprint.id,
      action: 'STARTED',
      metadata: {
        projectId: sprint.projectId,
        committedCount: started.committedCount,
        committedEstimate: started.committedEstimate,
        estimationUnit: settings?.estimationUnit ?? 'HOURS',
      },
    });

    return NextResponse.json({ sprint: started });
  } catch (error) {
    logger.error('Error starting sprint', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
