import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics for the current user's organization
 * Uses database-level aggregation for performance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Resolve organization from subdomain header (set by middleware), fallback to first org
    const slug = request.headers.get('x-organization-slug');
    const orgMembership = (slug
      ? user.organizations.find(m => m.organization.slug === slug)
      : null) || user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Get project IDs for this org (lightweight query)
    const orgProjects = await prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    const projectIds = orgProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json({
        stats: { completed: 0, updated: 0, created: 0, dueSoon: 0 },
        statusBreakdown: {},
        priorityBreakdown: {},
        typeBreakdown: {},
        totalTasks: 0,
        totalProjects: 0,
        organizationId,
      });
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const taskWhere = {
      projectId: { in: projectIds },
      deletedAt: null,
    };

    // Run all aggregation queries in parallel
    const [
      totalTasks,
      completedLast7Days,
      updatedLast7Days,
      createdLast7Days,
      dueSoon,
      statusGroups,
      priorityGroups,
      typeGroups,
    ] = await Promise.all([
      prisma.task.count({ where: taskWhere }),

      prisma.task.count({
        where: { ...taskWhere, status: 'DONE', updatedAt: { gte: last7Days } },
      }),

      prisma.task.count({
        where: { ...taskWhere, updatedAt: { gte: last7Days } },
      }),

      prisma.task.count({
        where: { ...taskWhere, createdAt: { gte: last7Days } },
      }),

      prisma.task.count({
        where: {
          ...taskWhere,
          status: { not: 'DONE' },
          dueDate: { gte: now, lte: next7Days },
        },
      }),

      prisma.task.groupBy({
        by: ['status'],
        where: taskWhere,
        _count: true,
      }),

      prisma.task.groupBy({
        by: ['priority'],
        where: taskWhere,
        _count: true,
      }),

      prisma.task.groupBy({
        by: ['type'],
        where: taskWhere,
        _count: true,
      }),
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const g of statusGroups) {
      statusBreakdown[g.status] = g._count;
    }

    const priorityBreakdown: Record<string, number> = {};
    for (const g of priorityGroups) {
      priorityBreakdown[g.priority || 'NONE'] = g._count;
    }

    const typeBreakdown: Record<string, number> = {};
    for (const g of typeGroups) {
      typeBreakdown[g.type || 'TASK'] = g._count;
    }

    return NextResponse.json({
      stats: {
        completed: completedLast7Days,
        updated: updatedLast7Days,
        created: createdLast7Days,
        dueSoon,
      },
      statusBreakdown,
      priorityBreakdown,
      typeBreakdown,
      totalTasks,
      totalProjects: projectIds.length,
      organizationId,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
