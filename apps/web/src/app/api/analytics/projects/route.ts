import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import {
  getRecentActivities,
  getTopContributors,
  getDailyActivityAggregates,
} from '@/lib/activity-logger';

/**
 * GET /api/analytics/projects
 * Returns comprehensive project analytics for the organization
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const includeArchived = searchParams.get('includeArchived') === 'true';

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

    // Get the user's default organization or first organization
    const orgMembership = user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all projects with their tasks
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        ...(includeArchived ? {} : { deletedAt: null, isArchived: false }),
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Calculate aggregate metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE' && !p.isArchived).length;
    const archivedProjects = projects.filter(p => p.isArchived).length;

    const allTasks = projects.flatMap(p => p.tasks);
    const completedProjects = projects.filter(p =>
      p.tasks.length > 0 && p.tasks.every(t => t.status === 'DONE')
    ).length;
    const atRiskProjects = projects.filter(p =>
      p.tasks.some(t => t.status === 'BLOCKED' || (t.dueDate && t.dueDate < endDate && t.status !== 'DONE'))
    ).length;

    // Get monthly trend data (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(endDate);
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const createdInMonth = projects.filter(p =>
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      ).length;

      const completedInMonth = projects.filter(p =>
        p.tasks.length > 0 &&
        p.tasks.every(t => t.status === 'DONE') &&
        p.tasks.some(t => t.completedAt && t.completedAt >= monthStart && t.completedAt <= monthEnd)
      ).length;

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        created: createdInMonth,
        completed: completedInMonth,
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
      });
    }

    // Get top performing projects (by completion rate and task count)
    const topProjects = projects
      .filter(p => p.tasks.length > 0)
      .map(p => {
        const completedTasks = p.tasks.filter(t => t.status === 'DONE').length;
        const completionRate = (completedTasks / p.tasks.length) * 100;

        return {
          id: p.id,
          name: p.name,
          key: p.key,
          completionRate: Math.round(completionRate),
          tasksCompleted: completedTasks,
          totalTasks: p.tasks.length,
          memberCount: p.members.length,
          status: p.status,
        };
      })
      .sort((a, b) => {
        // Sort by completion rate first, then by number of completed tasks
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return b.tasksCompleted - a.tasksCompleted;
      })
      .slice(0, 5);

    // Get upcoming milestones (tasks with due dates in next 14 days)
    const next14Days = new Date(endDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingMilestones = allTasks
      .filter(t => t.dueDate && t.dueDate >= endDate && t.dueDate <= next14Days && t.status !== 'DONE')
      .map(t => {
        const project = projects.find(p => p.id === t.projectId);
        const daysLeft = Math.ceil((t.dueDate!.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000));

        return {
          id: t.id,
          title: t.title,
          project: project?.name || 'Unknown',
          projectId: project?.id,
          dueDate: t.dueDate!.toISOString(),
          daysLeft,
          priority: t.priority,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // Get activity data (with error handling - activity log table may not exist yet)
    let recentActivities: Awaited<ReturnType<typeof getRecentActivities>> = [];
    let topContributors: Awaited<ReturnType<typeof getTopContributors>> = [];
    let dailyActivities: Awaited<ReturnType<typeof getDailyActivityAggregates>> = [];

    try {
      recentActivities = await getRecentActivities(organizationId, {
        entityType: 'PROJECT',
        startDate,
        endDate,
        limit: 20,
      });

      topContributors = await getTopContributors(organizationId, startDate, endDate, {
        entityType: 'PROJECT',
        limit: 5,
      });

      dailyActivities = await getDailyActivityAggregates(
        organizationId,
        startDate,
        endDate,
        'PROJECT'
      );
    } catch (activityError) {
      // Activity logging not available - continue without it
      console.log('Activity logging not available');
    }

    return NextResponse.json({
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        archivedProjects,
        atRiskProjects,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(t => t.status === 'DONE').length,
        inProgressTasks: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
        blockedTasks: allTasks.filter(t => t.status === 'BLOCKED').length,
      },
      monthlyTrend,
      topProjects,
      upcomingMilestones,
      activities: recentActivities,
      topContributors,
      dailyActivities,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    });
  } catch (error) {
    console.error('Projects analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects analytics' },
      { status: 500 }
    );
  }
}

