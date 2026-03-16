import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import {
  getRecentActivities,
  getTopContributors,
  getDailyActivityAggregates,
} from '@/lib/activity-logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/goals
 * Returns comprehensive goal analytics for the organization
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

    // Resolve organization from subdomain header (set by middleware), fallback to first org
    const slug = request.headers.get('x-organization-slug');
    const orgMembership = (slug
      ? user.organizations.find(m => m.organization.slug === slug)
      : null) || user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all goals with their key results
    const goals = await prisma.goal.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        keyResults: true,
        projects: {
          include: {
            project: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate aggregate metrics
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS').length;
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length;
    const notStartedGoals = goals.filter(g => g.status === 'NOT_STARTED').length;
    const atRiskGoals = goals.filter(g => g.status === 'AT_RISK').length;
    const cancelledGoals = goals.filter(g => g.status === 'CANCELLED').length;

    const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals) : 0;

    // Get goals by priority
    const priorityBreakdown = {
      CRITICAL: goals.filter(g => g.priority === 'CRITICAL').length,
      HIGH: goals.filter(g => g.priority === 'HIGH').length,
      MEDIUM: goals.filter(g => g.priority === 'MEDIUM').length,
      LOW: goals.filter(g => g.priority === 'LOW').length,
    };

    // Get monthly goal trend
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

      const createdInMonth = goals.filter(g =>
        g.createdAt >= monthStart && g.createdAt <= monthEnd
      ).length;

      const completedInMonth = goals.filter(g =>
        g.completedAt && g.completedAt >= monthStart && g.completedAt <= monthEnd
      ).length;

      const avgProgressInMonth = goals
        .filter(g => g.createdAt <= monthEnd)
        .reduce((sum, g) => sum + g.progress, 0) / Math.max(goals.filter(g => g.createdAt <= monthEnd).length, 1);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        created: createdInMonth,
        completed: completedInMonth,
        avgProgress: Math.round(avgProgressInMonth),
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
      });
    }

    // Get top performing goals (by progress and completion)
    const topGoals = goals
      .map(g => {
        const totalKeyResults = g.keyResults.length;
        const completedKeyResults = g.keyResults.filter((kr: { isCompleted: boolean }) => kr.isCompleted).length;
        const krCompletionRate = totalKeyResults > 0 ? (completedKeyResults / totalKeyResults) * 100 : 0;

        return {
          id: g.id,
          title: g.title,
          status: g.status,
          priority: g.priority,
          progress: g.progress,
          keyResultsCompleted: completedKeyResults,
          totalKeyResults,
          krCompletionRate: Math.round(krCompletionRate),
          projectCount: g.projects.length,
          teamName: g.team?.name || 'Unassigned',
        };
      })
      .sort((a, b) => {
        // Sort by progress first, then by key result completion rate
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        return b.krCompletionRate - a.krCompletionRate;
      })
      .slice(0, 5);

    // Get goals approaching deadline (due in next 14 days)
    const next14Days = new Date(endDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = goals
      .filter(g => g.dueDate && g.dueDate >= endDate && g.dueDate <= next14Days && g.status !== 'COMPLETED')
      .map(g => {
        const daysLeft = Math.ceil((g.dueDate!.getTime() - endDate.getTime()) / (24 * 60 * 60 * 1000));

        return {
          id: g.id,
          title: g.title,
          progress: g.progress,
          priority: g.priority,
          status: g.status,
          dueDate: g.dueDate!.toISOString(),
          daysLeft,
          teamName: g.team?.name || 'Unassigned',
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);

    // Get key results overview
    const allKeyResults = goals.flatMap(g => g.keyResults);
    const totalKeyResults = allKeyResults.length;
    const completedKeyResults = allKeyResults.filter(kr => kr.isCompleted).length;
    const avgKeyResultCompletion = totalKeyResults > 0 ? (completedKeyResults / totalKeyResults) * 100 : 0;

    // Calculate average progress by key results
    const keyResultsWithProgress = allKeyResults.map(kr => {
      const progressPercent = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return Math.min(progressPercent, 100);
    });
    const avgKeyResultProgress = keyResultsWithProgress.length > 0
      ? keyResultsWithProgress.reduce((sum, p) => sum + p, 0) / keyResultsWithProgress.length
      : 0;

    // Get activity data
    const recentActivities = await getRecentActivities(organizationId, {
      entityType: 'GOAL',
      startDate,
      endDate,
      limit: 20,
    });

    const topContributors = await getTopContributors(organizationId, startDate, endDate, {
      entityType: 'GOAL',
      limit: 5,
    });

    const dailyActivities = await getDailyActivityAggregates(
      organizationId,
      startDate,
      endDate,
      'GOAL'
    );

    return NextResponse.json({
      summary: {
        totalGoals,
        activeGoals,
        completedGoals,
        notStartedGoals,
        atRiskGoals,
        cancelledGoals,
        avgProgress,
        totalKeyResults,
        completedKeyResults,
        avgKeyResultCompletion: Math.round(avgKeyResultCompletion),
        avgKeyResultProgress: Math.round(avgKeyResultProgress),
      },
      priorityBreakdown,
      monthlyTrend,
      topGoals,
      upcomingDeadlines,
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
    console.error('Goals analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals analytics' },
      { status: 500 }
    );
  }
}
