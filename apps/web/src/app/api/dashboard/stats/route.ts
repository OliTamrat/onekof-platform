import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics for the current user's organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get organization slug from subdomain (set by middleware)
    const orgSlug = request.headers.get('x-organization-slug');

    // Get user from database
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

    // Match organization by subdomain slug, or fall back to first org
    const orgMembership = (orgSlug
      ? user.organizations.find(o => o.organization.slug === orgSlug)
      : null) || user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Calculate date ranges
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all projects for the organization
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    // Calculate stats
    const allTasks = projects.flatMap(p => p.tasks);

    const completedLast7Days = allTasks.filter(task =>
      task.status === 'DONE' &&
      task.updatedAt >= last7Days
    ).length;

    const updatedLast7Days = allTasks.filter(task =>
      task.updatedAt >= last7Days
    ).length;

    const createdLast7Days = allTasks.filter(task =>
      task.createdAt >= last7Days
    ).length;

    const dueSoon = allTasks.filter(task =>
      task.dueDate &&
      task.dueDate <= next7Days &&
      task.dueDate >= now &&
      task.status !== 'DONE'
    ).length;

    // Get status breakdown
    const statusCounts = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get priority breakdown
    const priorityCounts = allTasks.reduce((acc, task) => {
      const priority = task.priority || 'NONE';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get type breakdown (using project type as proxy for now)
    const typeCounts = {
      TASK: allTasks.length,
      STORY: 0,
      BUG: 0,
      EPIC: 0,
      FEATURE: 0,
    };

    return NextResponse.json({
      stats: {
        completed: completedLast7Days,
        updated: updatedLast7Days,
        created: createdLast7Days,
        dueSoon,
      },
      statusBreakdown: statusCounts,
      priorityBreakdown: priorityCounts,
      typeBreakdown: typeCounts,
      totalTasks: allTasks.length,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
