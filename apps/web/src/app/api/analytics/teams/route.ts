import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import {
  getRecentActivities,
  getTopContributors,
  getDailyActivityAggregates,
} from '@/lib/activity-logger';
import { resolveUserOrganization } from '@/lib/api-organization';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/teams
 * Returns comprehensive team analytics for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const organizationId = ctx.organizationId;

    // Calculate date ranges
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Get all teams with their members and projects
    const teams = await prisma.team.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
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
        projects: {
          include: {
            project: {
              include: {
                tasks: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
        goals: {
          include: {
            keyResults: true,
          },
        },
      },
    });

    // Calculate aggregate metrics
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
    const avgMembersPerTeam = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;

    // Get team performance metrics
    const teamPerformance = teams.map(team => {
      const allTasks = team.projects.flatMap(pt => pt.project.tasks);
      const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
      const totalTasks = allTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const activeGoals = team.goals.filter(g => g.status === 'IN_PROGRESS').length;
      const completedGoals = team.goals.filter(g => g.status === 'COMPLETED').length;
      const totalGoals = team.goals.length;

      return {
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        projectCount: team.projects.length,
        completedTasks,
        totalTasks,
        completionRate: Math.round(completionRate),
        activeGoals,
        completedGoals,
        totalGoals,
        avgProgress: totalGoals > 0 ? Math.round(team.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals) : 0,
      };
    });

    // Sort teams by performance (completion rate and task count)
    const topTeams = [...teamPerformance]
      .sort((a, b) => {
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return b.completedTasks - a.completedTasks;
      })
      .slice(0, 5);

    // Get team size distribution
    const teamSizeDistribution = {
      small: teams.filter(t => t.members.length <= 3).length, // 1-3 members
      medium: teams.filter(t => t.members.length > 3 && t.members.length <= 8).length, // 4-8 members
      large: teams.filter(t => t.members.length > 8).length, // 9+ members
    };

    // Get monthly team activity trend
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

      const createdInMonth = teams.filter(t =>
        t.createdAt >= monthStart && t.createdAt <= monthEnd
      ).length;

      // Count members added in month
      const membersAddedInMonth = teams.reduce((sum, team) => {
        const addedMembers = team.members.filter(m =>
          m.joinedAt >= monthStart && m.joinedAt <= monthEnd
        ).length;
        return sum + addedMembers;
      }, 0);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        teamsCreated: createdInMonth,
        membersAdded: membersAddedInMonth,
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
      });
    }

    // Get most active teams (based on recent activity)
    const teamActivityCounts = await Promise.all(
      teams.map(async team => {
        const activityCount = await prisma.userActivity.count({
          where: {
            organizationId,
            entityType: 'TEAM',
            entityId: team.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          teamId: team.id,
          teamName: team.name,
          activityCount,
        };
      })
    );

    const mostActiveTeams = teamActivityCounts
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 5);

    // Get activity data
    const recentActivities = await getRecentActivities(organizationId, {
      entityType: 'TEAM',
      startDate,
      endDate,
      limit: 20,
    });

    const topContributors = await getTopContributors(organizationId, startDate, endDate, {
      entityType: 'TEAM',
      limit: 5,
    });

    const dailyActivities = await getDailyActivityAggregates(
      organizationId,
      startDate,
      endDate,
      'TEAM'
    );

    return NextResponse.json({
      summary: {
        totalTeams,
        totalMembers,
        avgMembersPerTeam,
        totalProjects: teams.reduce((sum, t) => sum + t.projects.length, 0),
        totalGoals: teams.reduce((sum, t) => sum + t.goals.length, 0),
      },
      teamSizeDistribution,
      monthlyTrend,
      topTeams,
      mostActiveTeams,
      teamPerformance,
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
    console.error('Teams analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams analytics' },
      { status: 500 }
    );
  }
}
