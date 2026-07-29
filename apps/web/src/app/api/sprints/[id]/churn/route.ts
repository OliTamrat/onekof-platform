import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuthentication, requireProjectAccess } from '@/lib/security/authorization';
import { summarizeChurn } from '@/components/sprints/insights';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sprints/[id]/churn
 *
 * Scope-churn summary for one sprint: how many issues were added to / removed
 * from it AFTER it started (moves while PLANNED are planning, not churn), read
 * from the TASK_SPRINT_CHANGED activity trail Phase 1 has recorded all along.
 * Rollover at completion is intentionally not churn — the complete route
 * records it as rolledOver on the sprint, not as per-task events.
 *
 * Response: { added, removed, issues: [{ id, key, title, direction }] }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuthentication();
    if (!auth.authorized) return auth.error;

    const sprint = await prisma.sprint.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { project: { select: { organizationId: true } } },
    });
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, auth.session.user.id);
    if (!access.authorized) return access.error;

    // Churn is only defined once the commitment snapshot exists
    if (!sprint.startDate) {
      return NextResponse.json({ added: 0, removed: 0, issues: [] });
    }

    // The window opens at the INSTANT the commitment snapshot was written —
    // the SPRINT_STARTED audit event. startDate alone is a calendar date at
    // midnight, which would misclassify same-day planning drags as churn
    // (founder testing caught exactly this).
    const startedEvent = await prisma.userActivity.findFirst({
      where: {
        entityType: 'SPRINT',
        entityId: sprint.id,
        activityType: 'SPRINT_STARTED',
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    const windowStart = startedEvent?.createdAt ?? sprint.startDate;

    const events = await prisma.userActivity.findMany({
      where: {
        organizationId: sprint.project.organizationId,
        activityType: 'TASK_SPRINT_CHANGED',
        entityType: 'TASK',
        createdAt: {
          gte: windowStart,
          ...(sprint.completedAt && { lte: sprint.completedAt }),
        },
        OR: [
          { metadata: { path: ['to'], equals: sprint.id } },
          { metadata: { path: ['from'], equals: sprint.id } },
        ],
      },
      select: { entityId: true, metadata: true },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });

    const summary = summarizeChurn(
      sprint.id,
      events.map((e) => ({
        entityId: e.entityId,
        metadata: e.metadata as { from?: string | null; to?: string | null } | null,
      }))
    );

    // Resolve surviving issues for the drill-down (deleted ones drop out)
    const issueIds = Array.from(summary.perIssue.keys());
    const tasks = issueIds.length
      ? await prisma.task.findMany({
          where: { id: { in: issueIds }, deletedAt: null },
          select: { id: true, key: true, title: true },
        })
      : [];

    return NextResponse.json({
      added: summary.added,
      removed: summary.removed,
      issues: tasks.map((t) => ({
        id: t.id,
        key: t.key,
        title: t.title,
        direction: summary.perIssue.get(t.id),
      })),
    });
  } catch (error) {
    logger.error('Error computing sprint churn', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
