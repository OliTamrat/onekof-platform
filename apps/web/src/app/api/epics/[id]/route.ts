import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/epics/[id]
 *
 * Returns an Epic with aggregated child task statistics.
 * An Epic is any Task with type='EPIC'. Children are Tasks where parentId=epicId.
 *
 * Response shape:
 * {
 *   epic: { id, key, title, description, status, priority, ... },
 *   children: [{ id, key, title, status, priority, assignee, estimate }],
 *   stats: {
 *     total: number,
 *     byStatus: { TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, BACKLOG },
 *     progress: number, // 0-100 (% in DONE)
 *     estimateTotal: number, // sum of child estimates in hours
 *     timeSpentTotal: number // sum of timeSpent in hours
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch the epic itself (must be type=EPIC)
    const epic = await prisma.task.findFirst({
      where: {
        id: params.id,
        type: 'EPIC',
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!epic) {
      return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    }

    // Security: verify user has access to the epic's project
    const projectAuth = await requireProjectAccess(epic.projectId, user.id);
    if (!projectAuth.authorized) {
      return projectAuth.error!;
    }

    // Fetch all child tasks in parallel with the aggregation
    const [children, statusGroups, estimateSums] = await Promise.all([
      prisma.task.findMany({
        where: {
          parentId: params.id,
          deletedAt: null,
        },
        select: {
          id: true,
          key: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          estimate: true,
          timeSpent: true,
          dueDate: true,
          createdAt: true,
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          parentId: params.id,
          deletedAt: null,
        },
        _count: { _all: true },
      }),
      prisma.task.aggregate({
        where: {
          parentId: params.id,
          deletedAt: null,
        },
        _sum: {
          estimate: true,
          timeSpent: true,
        },
      }),
    ]);

    // Build byStatus breakdown, defaulting missing statuses to 0
    const byStatus: Record<string, number> = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      BLOCKED: 0,
    };
    let total = 0;
    for (const g of statusGroups as any[]) {
      byStatus[g.status] = g._count._all;
      total += g._count._all;
    }

    const progress = total > 0
      ? Math.round((byStatus.DONE / total) * 100)
      : 0;

    return NextResponse.json({
      epic,
      children,
      stats: {
        total,
        byStatus,
        progress,
        estimateTotal: estimateSums._sum.estimate ?? 0,
        timeSpentTotal: estimateSums._sum.timeSpent ?? 0,
      },
    });
  } catch (error) {
    logger.error('Epic fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch epic' },
      { status: 500 }
    );
  }
}
