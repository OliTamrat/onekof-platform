/**
 * Activity Tracking Middleware
 * Automatically logs activities for entity operations
 */

import { prisma } from '@onekof/database';
import { logActivity } from './activity-logger';
import { headers } from 'next/headers';

type ActivityEntityType = string;
type ActivityAction = string;

interface EntityChange {
  organizationId: string;
  userId: string;
  entityType: ActivityEntityType;
  entityId: string;
  entityName?: string;
  action: ActivityAction;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Track entity changes and automatically log activity
 */
export async function trackEntityChange(change: EntityChange) {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    try {
      const headersList = headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
      userAgent = headersList.get('user-agent') || undefined;
    } catch (e) {
      // Headers might not be available in all contexts
    }

    const metadata: Record<string, unknown> = { ...change.metadata };

    if (change.oldValues && change.newValues) {
      const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];

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

    const description = generateActivityDescription(change);

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
  } catch (error) {
    console.error('Failed to track entity change:', error);
  }
}

/**
 * Generate human-readable description for the activity
 */
function generateActivityDescription(change: EntityChange): string {
  const { action, entityType, entityName } = change;

  const entityTypeNames: Record<string, string> = {
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
 * Helper to track project changes
 */
export async function trackProjectChange(params: {
  organizationId: string;
  userId: string;
  projectId: string;
  projectName: string;
  action: ActivityAction;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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
