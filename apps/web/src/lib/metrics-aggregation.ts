/**
 * Metrics Aggregation Utility
 * Calculates and stores aggregated metrics for fast dashboard loading
 */

import { prisma } from '@onekof/database';

type ActivityEntityType = string;
type MetricsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface MetricsResult {
  totalCount: number;
  activeCount: number;
  blockedCount: number;
  atRiskCount: number;
  createdCount: number;
  completedCount: number;
  updatedCount: number;
  deletedCount: number;
  topContributors: Array<{ userId: string; name: string; actionCount: number }>;
  customMetrics: Record<string, unknown>;
  period: MetricsPeriod;
  periodDate: Date;
  entityType: string;
  organizationId: string;
}

/**
 * Calculate metrics snapshot for a given period
 */
export async function calculateMetricsSnapshot(
  organizationId: string,
  entityType: ActivityEntityType,
  period: MetricsPeriod,
  periodDate: Date
): Promise<MetricsResult> {
  try {
    const { startDate, endDate } = getPeriodDates(periodDate, period);

    const counts = await getEntityCounts(organizationId, entityType, startDate, endDate);
    const activityCounts = await getActivityCounts(organizationId, entityType, startDate, endDate);
    const topContributors = await getTopContributorsForPeriod(
      organizationId,
      entityType,
      startDate,
      endDate
    );
    const customMetrics = await calculateCustomMetrics(
      organizationId,
      entityType,
      startDate,
      endDate
    );

    return {
      organizationId,
      period,
      periodDate: new Date(periodDate.toISOString().split('T')[0]),
      entityType,
      ...counts,
      ...activityCounts,
      topContributors,
      customMetrics,
    };
  } catch (error) {
    console.error('Failed to calculate metrics snapshot:', error);
    throw error;
  }
}

/**
 * Get period date range
 */
function getPeriodDates(periodDate: Date, period: MetricsPeriod) {
  const startDate = new Date(periodDate);
  let endDate = new Date(periodDate);

  switch (period) {
    case 'DAILY':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'WEEKLY':
      const dayOfWeek = startDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate.setDate(startDate.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'MONTHLY':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'QUARTERLY':
      const quarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(quarter * 3);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'YEARLY':
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}

/**
 * Get entity counts for the period
 */
async function getEntityCounts(
  organizationId: string,
  entityType: ActivityEntityType,
  _startDate: Date,
  endDate: Date
) {
  let totalCount = 0;
  let activeCount = 0;
  let blockedCount = 0;
  let atRiskCount = 0;

  switch (entityType) {
    case 'PROJECT':
      const projects = await prisma.project.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          tasks: {
            where: { deletedAt: null },
          },
        },
      });

      totalCount = projects.length;
      activeCount = projects.filter(p => p.status === 'ACTIVE' && !p.isArchived).length;
      atRiskCount = projects.filter(p =>
        p.tasks.some(t => t.status === 'BLOCKED' || (t.dueDate && t.dueDate < endDate && t.status !== 'DONE'))
      ).length;
      break;

    case 'TASK':
      const tasks = await prisma.task.findMany({
        where: {
          project: { organizationId },
          deletedAt: null,
        },
      });

      totalCount = tasks.length;
      activeCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      blockedCount = tasks.filter(t => t.status === 'BLOCKED').length;
      atRiskCount = tasks.filter(t =>
        t.dueDate && t.dueDate < endDate && t.status !== 'DONE'
      ).length;
      break;

    case 'TEAM':
      const teams = await prisma.team.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          members: true,
        },
      });

      totalCount = teams.length;
      activeCount = teams.filter(t => t.members.length > 0).length;
      break;

    case 'GOAL':
      const goals = await prisma.goal.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
      });

      totalCount = goals.length;
      activeCount = goals.filter(g => g.status === 'IN_PROGRESS').length;
      atRiskCount = goals.filter(g => g.status === 'AT_RISK').length;
      break;
  }

  return {
    totalCount,
    activeCount,
    blockedCount,
    atRiskCount,
  };
}

/**
 * Get activity counts from user activities
 */
async function getActivityCounts(
  organizationId: string,
  entityType: ActivityEntityType,
  startDate: Date,
  endDate: Date
) {
  const activities = await prisma.userActivity.groupBy({
    by: ['action'],
    where: {
      organizationId,
      entityType,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      action: true,
    },
  });

  const counts = {
    createdCount: 0,
    completedCount: 0,
    updatedCount: 0,
    deletedCount: 0,
  };

  activities.forEach((activity: { action: string; _count: { action: number } }) => {
    if (activity.action === 'CREATED') {
      counts.createdCount = activity._count.action;
    } else if (activity.action === 'COMPLETED') {
      counts.completedCount = activity._count.action;
    } else if (['UPDATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED'].includes(activity.action)) {
      counts.updatedCount += activity._count.action;
    } else if (['DELETED', 'ARCHIVED'].includes(activity.action)) {
      counts.deletedCount += activity._count.action;
    }
  });

  return counts;
}

/**
 * Get top contributors for the period
 */
async function getTopContributorsForPeriod(
  organizationId: string,
  entityType: ActivityEntityType,
  startDate: Date,
  endDate: Date
) {
  const contributors = await prisma.userActivity.groupBy({
    by: ['userId'],
    where: {
      organizationId,
      entityType,
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
    take: 10,
  });

  const userIds = contributors.map((c: { userId: string; _count: { id: number } }) => c.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, typeof users[0]>);

  return contributors.map((c: { userId: string; _count: { id: number } }) => ({
    userId: c.userId,
    name: userMap[c.userId]?.name || userMap[c.userId]?.email || 'Unknown',
    actionCount: c._count.id,
  }));
}

/**
 * Calculate custom metrics based on entity type
 */
async function calculateCustomMetrics(
  organizationId: string,
  entityType: ActivityEntityType,
  startDate: Date,
  endDate: Date
): Promise<Record<string, unknown>> {
  const metrics: Record<string, unknown> = {};

  switch (entityType) {
    case 'PROJECT':
      const projects = await prisma.project.findMany({
        where: { organizationId, deletedAt: null },
        include: { tasks: { where: { deletedAt: null } } },
      });

      const completionRates = projects
        .filter(p => p.tasks.length > 0)
        .map(p => (p.tasks.filter(t => t.status === 'DONE').length / p.tasks.length) * 100);

      metrics.avgCompletionRate = completionRates.length > 0
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
        : 0;

      metrics.avgTasksPerProject = projects.length > 0
        ? projects.reduce((sum, p) => sum + p.tasks.length, 0) / projects.length
        : 0;
      break;

    case 'TASK':
      const completedTasks = await prisma.task.findMany({
        where: {
          project: { organizationId },
          status: 'DONE',
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
      });

      const completionTimes = completedTasks
        .filter(t => t.completedAt)
        .map(t => {
          const created = new Date(t.createdAt);
          const completed = new Date(t.completedAt!);
          return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        });

      metrics.avgDaysToComplete = completionTimes.length > 0
        ? completionTimes.reduce((sum, days) => sum + days, 0) / completionTimes.length
        : 0;
      break;

    case 'GOAL':
      const goals = await prisma.goal.findMany({
        where: { organizationId, deletedAt: null },
        include: { keyResults: true },
      });

      metrics.avgGoalProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length
        : 0;

      const krCompletionRates = goals
        .filter(g => g.keyResults.length > 0)
        .map(g =>
          (g.keyResults.filter(kr => kr.isCompleted).length / g.keyResults.length) * 100
        );

      metrics.avgKeyResultCompletion = krCompletionRates.length > 0
        ? krCompletionRates.reduce((sum, rate) => sum + rate, 0) / krCompletionRates.length
        : 0;
      break;
  }

  return metrics;
}

/**
 * Aggregate metrics for all entity types for an organization
 */
export async function aggregateAllMetrics(organizationId: string, period: MetricsPeriod = 'DAILY') {
  const periodDate = new Date();

  const entityTypes: ActivityEntityType[] = ['PROJECT', 'TASK', 'TEAM', 'GOAL'];

  const results = await Promise.allSettled(
    entityTypes.map(entityType =>
      calculateMetricsSnapshot(organizationId, entityType, period, periodDate)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return {
    successful,
    failed,
    total: entityTypes.length,
    results,
  };
}

/**
 * Aggregate metrics for all organizations (can be run as a cron job)
 */
export async function aggregateMetricsForAllOrganizations(period: MetricsPeriod = 'DAILY') {
  const organizations = await prisma.organization.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  console.log(`Aggregating ${period} metrics for ${organizations.length} organizations...`);

  const results = [];

  for (const org of organizations) {
    try {
      const result = await aggregateAllMetrics(org.id, period);
      results.push({ organizationId: org.id, organizationName: org.name, ...result });
    } catch (error) {
      console.error(`Failed to aggregate metrics for ${org.name}`, error);
      results.push({
        organizationId: org.id,
        organizationName: org.name,
        successful: 0,
        failed: 4,
        total: 4,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
