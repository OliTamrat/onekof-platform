/**
 * Activity Tracking Middleware
 * Automatically logs activities for entity operations
 */

import { prisma } from '@onekof/database';
import type { ActivityAction, ActivityEntityType } from '@onekof/database';
import { logActivity } from './activity-logger';
import { headers } from 'next/headers';

interface EntityChange {
  organizationId: string;
  userId: string;
  entityType: ActivityEntityType;
  entityId: string;
  entityName?: string;
  action: ActivityAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Track entity changes and automatically log activity
 */
export async function trackEntityChange(change: EntityChange) {
  try {
    // Get IP and user agent from headers if available
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    try {
      const headersList = headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
      userAgent = headersList.get('user-agent') || undefined;
    } catch (e) {
      // Headers might not be available in all contexts
    }

    // Build metadata with changes
    const metadata: Record<string, any> = { ...change.metadata };

    // Add field changes if old and new values are provided
    if (change.oldValues && change.newValues) {
      const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

      for (const key in change.newValues) {
        if (change.newValues[key] !== change.oldValues[key]) {
          changes.push({
            field: key,
            oldValue: change.oldValues[key],
            newValue: change.newValues[key],
          });
        }
      }

      if (changes.length > 0) {
        metadata.changes = changes;
      }
    }

    // Generate human-readable description
    const description = generateActivityDescription(change);

    // Log the activity
    await logActivity({
      organizationId: change.organizationId,
      userId: change.userId,
      action: change.action,
      entityType: change.entityType,
      entityId: change.entityId,
      entityName: change.entityName,
      description,
      metadata,
      ipAddress,
      userAgent,
    });

    // Update metrics snapshot asynchronously (don't await to not block)
    updateMetricsSnapshot(change).catch(err =>
      console.error('Failed to update metrics snapshot:', err)
    );
  } catch (error) {
    console.error('Failed to track entity change:', error);
    // Don't throw - activity tracking should not break the main flow
  }
}

/**
 * Generate human-readable description for the activity
 */
function generateActivityDescription(change: EntityChange): string {
  const { action, entityType, entityName } = change;

  const entityTypeNames: Record<ActivityEntityType, string> = {
    ORGANIZATION: 'organization',
    PROJECT: 'project',
    TASK: 'task',
    TEAM: 'team',
    GOAL: 'goal',
    KEY_RESULT: 'key result',
    COMMENT: 'comment',
    ATTACHMENT: 'attachment',
    MILESTONE: 'milestone',
    DOCUMENT: 'document',
    WIKI: 'wiki',
  };

  const typeName = entityTypeNames[entityType] || 'item';
  const name = entityName ? `"${entityName}"` : 'an item';

  switch (action) {
    case 'CREATED':
      return `Created ${typeName} ${name}`;
    case 'UPDATED':
      return `Updated ${typeName} ${name}`;
    case 'DELETED':
      return `Deleted ${typeName} ${name}`;
    case 'ARCHIVED':
      return `Archived ${typeName} ${name}`;
    case 'RESTORED':
      return `Restored ${typeName} ${name}`;
    case 'COMPLETED':
      return `Completed ${typeName} ${name}`;
    case 'REOPENED':
      return `Reopened ${typeName} ${name}`;
    case 'STATUS_CHANGED':
      return `Changed status of ${typeName} ${name}`;
    case 'PRIORITY_CHANGED':
      return `Changed priority of ${typeName} ${name}`;
    case 'ASSIGNED':
      return `Assigned ${typeName} ${name}`;
    case 'UNASSIGNED':
      return `Unassigned ${typeName} ${name}`;
    case 'COMMENTED':
      return `Commented on ${typeName} ${name}`;
    case 'MENTIONED':
      return `Mentioned in ${typeName} ${name}`;
    case 'ATTACHED':
      return `Added attachment to ${typeName} ${name}`;
    case 'MEMBER_ADDED':
      return `Added member to ${typeName} ${name}`;
    case 'MEMBER_REMOVED':
      return `Removed member from ${typeName} ${name}`;
    case 'ROLE_CHANGED':
      return `Changed role in ${typeName} ${name}`;
    case 'MILESTONE_REACHED':
      return `Reached milestone in ${typeName} ${name}`;
    case 'DEADLINE_EXTENDED':
      return `Extended deadline for ${typeName} ${name}`;
    case 'BLOCKED':
      return `Blocked ${typeName} ${name}`;
    case 'UNBLOCKED':
      return `Unblocked ${typeName} ${name}`;
    default:
      return `Modified ${typeName} ${name}`;
  }
}

/**
 * Update metrics snapshot for the current period
 */
async function updateMetricsSnapshot(change: EntityChange) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    // Get or create daily snapshot
    const snapshot = await prisma.metricsSnapshot.upsert({
      where: {
        organizationId_period_periodDate_entityType: {
          organizationId: change.organizationId,
          period: 'DAILY',
          periodDate: today,
          entityType: change.entityType,
        },
      },
      create: {
        organizationId: change.organizationId,
        period: 'DAILY',
        periodDate: today,
        entityType: change.entityType,
        totalCount: 0,
        createdCount: 0,
        completedCount: 0,
        updatedCount: 0,
        deletedCount: 0,
        activeCount: 0,
        blockedCount: 0,
        atRiskCount: 0,
        topContributors: [],
        customMetrics: {},
      },
      update: {},
    });

    // Increment appropriate counters based on action
    const updates: any = {};

    switch (change.action) {
      case 'CREATED':
        updates.createdCount = { increment: 1 };
        updates.totalCount = { increment: 1 };
        break;
      case 'COMPLETED':
        updates.completedCount = { increment: 1 };
        break;
      case 'UPDATED':
      case 'STATUS_CHANGED':
      case 'PRIORITY_CHANGED':
        updates.updatedCount = { increment: 1 };
        break;
      case 'DELETED':
      case 'ARCHIVED':
        updates.deletedCount = { increment: 1 };
        updates.totalCount = { decrement: 1 };
        break;
      case 'BLOCKED':
        updates.blockedCount = { increment: 1 };
        break;
      case 'UNBLOCKED':
        updates.blockedCount = { decrement: 1 };
        break;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.metricsSnapshot.update({
        where: {
          id: snapshot.id,
        },
        data: updates,
      });
    }

    // Update top contributors
    await updateTopContributors(snapshot.id, change.userId);
  } catch (error) {
    console.error('Failed to update metrics snapshot:', error);
  }
}

/**
 * Update top contributors list in the snapshot
 */
async function updateTopContributors(snapshotId: string, userId: string) {
  try {
    const snapshot = await prisma.metricsSnapshot.findUnique({
      where: { id: snapshotId },
      select: { topContributors: true },
    });

    if (!snapshot) return;

    let contributors = snapshot.topContributors as Array<{
      userId: string;
      name: string;
      actionCount: number;
    }>;

    // Find contributor or add new one
    const contributorIndex = contributors.findIndex(c => c.userId === userId);

    if (contributorIndex >= 0) {
      contributors[contributorIndex].actionCount++;
    } else {
      // Get user name
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      contributors.push({
        userId,
        name: user?.name || user?.email || 'Unknown',
        actionCount: 1,
      });
    }

    // Sort by action count and keep top 10
    contributors.sort((a, b) => b.actionCount - a.actionCount);
    contributors = contributors.slice(0, 10);

    // Update snapshot
    await prisma.metricsSnapshot.update({
      where: { id: snapshotId },
      data: { topContributors: contributors },
    });
  } catch (error) {
    console.error('Failed to update top contributors:', error);
  }
}

/**
 * Helper to track project changes
 */
export async function trackProjectChange(params: {
  organizationId: string;
  userId: string;
  projectId: string;
  projectName: string;
  action: ActivityAction;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}) {
  return trackEntityChange({
    organizationId: params.organizationId,
    userId: params.userId,
    entityType: 'PROJECT',
    entityId: params.projectId,
    entityName: params.projectName,
    action: params.action,
    oldValues: params.oldValues,
    newValues: params.newValues,
    metadata: params.metadata,
  });
}

/**
 * Helper to track task changes
 */
export async function trackTaskChange(params: {
  organizationId: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  action: ActivityAction;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}) {
  return trackEntityChange({
    organizationId: params.organizationId,
    userId: params.userId,
    entityType: 'TASK',
    entityId: params.taskId,
    entityName: params.taskTitle,
    action: params.action,
    oldValues: params.oldValues,
    newValues: params.newValues,
    metadata: params.metadata,
  });
}

/**
 * Helper to track team changes
 */
export async function trackTeamChange(params: {
  organizationId: string;
  userId: string;
  teamId: string;
  teamName: string;
  action: ActivityAction;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}) {
  return trackEntityChange({
    organizationId: params.organizationId,
    userId: params.userId,
    entityType: 'TEAM',
    entityId: params.teamId,
    entityName: params.teamName,
    action: params.action,
    oldValues: params.oldValues,
    newValues: params.newValues,
    metadata: params.metadata,
  });
}

/**
 * Helper to track goal changes
 */
export async function trackGoalChange(params: {
  organizationId: string;
  userId: string;
  goalId: string;
  goalTitle: string;
  action: ActivityAction;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}) {
  return trackEntityChange({
    organizationId: params.organizationId,
    userId: params.userId,
    entityType: 'GOAL',
    entityId: params.goalId,
    entityName: params.goalTitle,
    action: params.action,
    oldValues: params.oldValues,
    newValues: params.newValues,
    metadata: params.metadata,
  });
}
