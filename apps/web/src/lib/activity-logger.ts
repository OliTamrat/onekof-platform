/**
 * Activity Logger Utility
 * Provides helper functions to log user activities for analytics and audit trail
 */

import { prisma } from '@onekof/database';
import type { ActivityAction, ActivityEntityType } from '@onekof/database';

export interface LogActivityParams {
  organizationId: string;
  userId: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  entityName?: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an activity to the database
 */
export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,
        metadata: params.metadata || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging should not break the main flow
    return null;
  }
}

/**
 * Log project-related activity
 */
export async function logProjectActivity(params: {
  organizationId: string;
  userId: string;
  projectId: string;
  projectName: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
}) {
  return logActivity({
    ...params,
    entityType: 'PROJECT',
    entityId: params.projectId,
    entityName: params.projectName,
  });
}

/**
 * Log task-related activity
 */
export async function logTaskActivity(params: {
  organizationId: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
}) {
  return logActivity({
    ...params,
    entityType: 'TASK',
    entityId: params.taskId,
    entityName: params.taskTitle,
  });
}

/**
 * Log team-related activity
 */
export async function logTeamActivity(params: {
  organizationId: string;
  userId: string;
  teamId: string;
  teamName: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
}) {
  return logActivity({
    ...params,
    entityType: 'TEAM',
    entityId: params.teamId,
    entityName: params.teamName,
  });
}

/**
 * Log goal-related activity
 */
export async function logGoalActivity(params: {
  organizationId: string;
  userId: string;
  goalId: string;
  goalTitle: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
}) {
  return logActivity({
    ...params,
    entityType: 'GOAL',
    entityId: params.goalId,
    entityName: params.goalTitle,
  });
}

/**
 * Get recent activities for an organization
 */
export async function getRecentActivities(
  organizationId: string,
  options: {
    limit?: number;
    entityType?: ActivityEntityType;
    action?: ActivityAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const {
    limit = 50,
    entityType,
    action,
    userId,
    startDate,
    endDate = new Date(),
  } = options;

  return await prisma.activityLog.findMany({
    where: {
      organizationId,
      ...(entityType && { entityType }),
      ...(action && { action }),
      ...(userId && { userId }),
      ...(startDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    },
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
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get activity timeline for a specific entity
 */
export async function getEntityActivityTimeline(
  entityType: ActivityEntityType,
  entityId: string,
  limit = 50
) {
  return await prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
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
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get activity counts by action type for a date range
 */
export async function getActivityCounts(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  entityType?: ActivityEntityType
) {
  const activities = await prisma.activityLog.groupBy({
    by: ['action'],
    where: {
      organizationId,
      ...(entityType && { entityType }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      action: true,
    },
  });

  return activities.reduce((acc: Record<string, number>, item: { action: string; _count: { action: number } }) => {
    acc[item.action] = item._count.action;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get top contributors for a date range
 */
export async function getTopContributors(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  options: {
    limit?: number;
    entityType?: ActivityEntityType;
  } = {}
) {
  const { limit = 10, entityType } = options;

  const contributors = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      organizationId,
      ...(entityType && { entityType }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  // Fetch user details
  const userIds = contributors.map((c: { userId: string; _count: { id: number } }) => c.userId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, typeof users[0]>);

  return contributors.map((contributor: { userId: string; _count: { id: number } }) => ({
    user: userMap[contributor.userId],
    activityCount: contributor._count.id,
  }));
}

/**
 * Get daily activity aggregates for a date range
 */
export async function getDailyActivityAggregates(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  entityType?: ActivityEntityType
) {
  const activities = await prisma.activityLog.findMany({
    where: {
      organizationId,
      ...(entityType && { entityType }),
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      action: true,
      createdAt: true,
    },
  });

  // Group by date
  const dailyAggregates = activities.reduce((acc: Record<string, { date: string; total: number; created: number; updated: number; completed: number; deleted: number }>, activity: { action: string; createdAt: Date }) => {
    const dateKey = activity.createdAt.toISOString().split('T')[0];

    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        total: 0,
        created: 0,
        updated: 0,
        completed: 0,
        deleted: 0,
      };
    }

    acc[dateKey].total++;

    if (activity.action === 'CREATED') acc[dateKey].created++;
    else if (activity.action === 'UPDATED' || activity.action === 'STATUS_CHANGED') acc[dateKey].updated++;
    else if (activity.action === 'COMPLETED') acc[dateKey].completed++;
    else if (activity.action === 'DELETED') acc[dateKey].deleted++;

    return acc;
  }, {} as Record<string, { date: string; total: number; created: number; updated: number; completed: number; deleted: number }>);

  return Object.values(dailyAggregates).sort((a, b) => a.date.localeCompare(b.date));
}
