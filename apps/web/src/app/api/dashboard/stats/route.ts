import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics for the current user's organization
 */
export async function GET(_request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;
    const userId = ctx.user.id;
    const isGuest = ctx.role === 'GUEST';

    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // RBAC: GUEST users only see stats from projects they're explicitly in
    let baseWhere: any = {
      project: { organizationId, deletedAt: null },
      deletedAt: null,
    };

    if (isGuest) {
      const allowedProjects = await prisma.project.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { members: { some: { userId } } },
            { leadId: userId },
            { ownerId: userId },
          ],
        },
        select: { id: true },
      });
      const allowedIds = allowedProjects.map((p: { id: string }) => p.id);
      baseWhere.projectId = { in: allowedIds };
    }

    // All aggregations run in parallel — DB-side counting, no data transfer
    const [
      completed,
      updated,
      created,
      dueSoon,
      statusGroups,
      priorityGroups,
      typeGroups,
      totalTasks,
    ] = await Promise.all([
      prisma.task.count({
        where: { ...baseWhere, status: 'DONE', updatedAt: { gte: last7Days } },
      }),
      prisma.task.count({
        where: { ...baseWhere, updatedAt: { gte: last7Days } },
      }),
      prisma.task.count({
        where: { ...baseWhere, createdAt: { gte: last7Days } },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { gte: now, lte: next7Days },
          status: { not: 'DONE' },
        },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.task.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.task.count({ where: baseWhere }),
    ]);

    const statusBreakdown = statusGroups.reduce((acc: Record<string, number>, g: any) => {
      acc[g.status] = g._count._all;
      return acc;
    }, {});

    const priorityBreakdown = priorityGroups.reduce((acc: Record<string, number>, g: any) => {
      acc[g.priority || 'NONE'] = g._count._all;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        completed,
        updated,
        created,
        dueSoon,
      },
      statusBreakdown,
      priorityBreakdown,
      // Real per-type counts. This used to report every task as TASK with the
      // other types hardcoded to zero, so the Types of Work card was fiction.
      typeBreakdown: typeGroups.reduce((acc: Record<string, number>, g: any) => {
        acc[g.type] = g._count._all;
        return acc;
      }, {}),
      totalTasks,
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
