import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { getRecentActivities, getEntityActivityTimeline } from '@/lib/activity-logger';
import type { ActivityEntityType, ActivityAction } from '@onekof/database';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/analytics/activity
 * Returns activity feed with filtering and pagination
 * Query params:
 * - entityType: filter by entity type (PROJECT, TASK, TEAM, GOAL, etc.)
 * - action: filter by action type (CREATED, UPDATED, COMPLETED, etc.)
 * - userId: filter by specific user
 * - entityId: get timeline for specific entity
 * - days: number of days to look back (default: 30)
 * - limit: max number of activities to return (default: 50, max: 100)
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
    const entityTypeParam = searchParams.get('entityType');
    const actionParam = searchParams.get('action');
    const userIdParam = searchParams.get('userId');
    const entityIdParam = searchParams.get('entityId');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

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

    // If entityId is provided, get timeline for that specific entity
    if (entityIdParam && entityTypeParam) {
      const timeline = await getEntityActivityTimeline(
        entityTypeParam as ActivityEntityType,
        entityIdParam,
        limit
      );

      return NextResponse.json({
        activities: timeline.map((activity: { id: string; action: string; entityType: string; entityId: string; entityName: string | null; description: string | null; metadata: Record<string, unknown> | null; user: { id: string; name: string | null; email: string; avatar: string | null }; createdAt: Date }) => ({
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          entityName: activity.entityName,
          description: activity.description,
          metadata: activity.metadata,
          user: {
            id: activity.user.id,
            name: activity.user.name || activity.user.email,
            email: activity.user.email,
            avatar: activity.user.avatar,
          },
          timestamp: activity.createdAt.toISOString(),
          timeAgo: getTimeAgo(activity.createdAt),
        })),
        total: timeline.length,
        entityType: entityTypeParam,
        entityId: entityIdParam,
      });
    }

    // Otherwise, get filtered activities for the organization
    const activities = await getRecentActivities(organizationId, {
      entityType: entityTypeParam as ActivityEntityType | undefined,
      action: actionParam as ActivityAction | undefined,
      userId: userIdParam || undefined,
      startDate,
      endDate,
      limit,
    });

    // Get activity statistics
    const totalActivities = await prisma.activityLog.count({
      where: {
        organizationId,
        ...(entityTypeParam && { entityType: entityTypeParam as ActivityEntityType }),
        ...(actionParam && { action: actionParam as ActivityAction }),
        ...(userIdParam && { userId: userIdParam }),
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get action breakdown
    const actionBreakdown = await prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        organizationId,
        ...(entityTypeParam && { entityType: entityTypeParam as ActivityEntityType }),
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        action: true,
      },
    });

    // Get entity type breakdown
    const entityBreakdown = await prisma.activityLog.groupBy({
      by: ['entityType'],
      where: {
        organizationId,
        ...(actionParam && { action: actionParam as ActivityAction }),
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        entityType: true,
      },
    });

    // Get hourly activity pattern (for activity heatmap)
    const hourlyActivity = Array.from({ length: 24 }, () => 0);
    const allActivitiesForPattern = await prisma.activityLog.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    allActivitiesForPattern.forEach((activity: { createdAt: Date }) => {
      const hour = activity.createdAt.getHours();
      hourlyActivity[hour]++;
    });

    return NextResponse.json({
      activities: activities.map((activity: { id: string; action: string; entityType: string; entityId: string; entityName: string | null; description: string | null; metadata: Record<string, unknown> | null; user: { id: string; name: string | null; email: string; avatar: string | null }; createdAt: Date }) => ({
        id: activity.id,
        action: activity.action,
        entityType: activity.entityType,
        entityId: activity.entityId,
        entityName: activity.entityName,
        description: activity.description,
        metadata: activity.metadata,
        user: {
          id: activity.user.id,
          name: activity.user.name || activity.user.email,
          email: activity.user.email,
          avatar: activity.user.avatar,
        },
        timestamp: activity.createdAt.toISOString(),
        timeAgo: getTimeAgo(activity.createdAt),
      })),
      statistics: {
        total: totalActivities,
        returned: activities.length,
        actionBreakdown: actionBreakdown.reduce((acc: Record<string, number>, item: { action: string; _count: { action: number } }) => {
          acc[item.action] = item._count.action;
          return acc;
        }, {} as Record<string, number>),
        entityBreakdown: entityBreakdown.reduce((acc: Record<string, number>, item: { entityType: string; _count: { entityType: number } }) => {
          acc[item.entityType] = item._count.entityType;
          return acc;
        }, {} as Record<string, number>),
        hourlyPattern: hourlyActivity,
      },
      filters: {
        entityType: entityTypeParam || null,
        action: actionParam || null,
        userId: userIdParam || null,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days,
        },
      },
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}
