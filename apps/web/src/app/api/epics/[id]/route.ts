import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuthentication, requireProjectAccess } from '@/lib/security/authorization';
import {
  getPatientAccessLevel,
  meetsPatientAccess,
  careItemExclusion,
} from '@/lib/security/patient-access';
import { applyCareItemVisibility, redactCareItem } from '@/lib/security/care-item-visibility';
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
    const authResult = await requireAuthentication();
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
            organizationId: true,
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

    // M2 — the epic itself may be a care item, and so may its children even
    // when it is not. Resolved once here rather than lazily, because the
    // children query below needs the answer either way.
    const patientLevel = await getPatientAccessLevel(epic.project.organizationId, user.id);
    if (epic.patientId && !meetsPatientAccess(patientLevel, 'LIMITED')) {
      return NextResponse.json({ error: 'Epic not found' }, { status: 404 });
    }

    // The exclusion is applied to the children list AND to both aggregates.
    // Counting hidden children into `total` would report an epic as 40% done
    // beside a list of two tasks, and the gap is itself a disclosure.
    const careItemFilter = careItemExclusion(patientLevel);

    // Fetch all child tasks in parallel with the aggregation
    const [children, statusGroups, estimateSums] = await Promise.all([
      prisma.task.findMany({
        where: {
          parentId: params.id,
          deletedAt: null,
          ...careItemFilter,
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
          // Selected so the visibility helper below can actually recognise a
          // care item. Without it every child looks ordinary and the LIMITED
          // redaction pass silently does nothing.
          patientId: true,
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
          ...careItemFilter,
        },
        _count: { _all: true },
      }),
      prisma.task.aggregate({
        where: {
          parentId: params.id,
          deletedAt: null,
          ...careItemFilter,
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
      epic: redactCareItem(epic, patientLevel),
      children: applyCareItemVisibility(children as any[], patientLevel),
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
