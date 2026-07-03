import { prisma } from '@onekof/database';
import { NextRequest } from 'next/server';
import { encryptField } from '@/lib/security/field-encrypt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrgAuditParams {
  organizationId: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: OrgAction;
  resource: OrgResource;
  resourceId?: string;
  resourceName?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  outcome?: 'SUCCESS' | 'FAILURE' | 'DENIED';
  request?: NextRequest;
}

// ---------------------------------------------------------------------------
// Action catalogue — every string INSA will see in the audit report
// ---------------------------------------------------------------------------

export const OrgActions = {
  // Projects
  PROJECT_CREATED:          'PROJECT_CREATED',
  PROJECT_UPDATED:          'PROJECT_UPDATED',
  PROJECT_DELETED:          'PROJECT_DELETED',
  PROJECT_VISIBILITY_CHANGED: 'PROJECT_VISIBILITY_CHANGED',

  // Project membership
  PROJECT_MEMBER_ADDED:        'PROJECT_MEMBER_ADDED',
  PROJECT_MEMBER_REMOVED:      'PROJECT_MEMBER_REMOVED',
  PROJECT_MEMBER_ROLE_CHANGED: 'PROJECT_MEMBER_ROLE_CHANGED',

  // Org invitations
  INVITATION_SENT:    'INVITATION_SENT',
  INVITATION_REVOKED: 'INVITATION_REVOKED',
  INVITATION_ACCEPTED: 'INVITATION_ACCEPTED',

  // Teams
  TEAM_CREATED:             'TEAM_CREATED',
  TEAM_DELETED:             'TEAM_DELETED',
  TEAM_MEMBER_ADDED:        'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED:      'TEAM_MEMBER_REMOVED',
  TEAM_MEMBER_ROLE_CHANGED: 'TEAM_MEMBER_ROLE_CHANGED',

  // Issues / Tasks
  ISSUE_DELETED: 'ISSUE_DELETED',
  TASK_DELETED:  'TASK_DELETED',

  // Goals
  GOAL_CREATED: 'GOAL_CREATED',
  GOAL_DELETED: 'GOAL_DELETED',

  // Documents
  DOCUMENT_CREATED: 'DOCUMENT_CREATED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',

  // Automations
  AUTOMATION_CREATED: 'AUTOMATION_CREATED',
  AUTOMATION_DELETED: 'AUTOMATION_DELETED',

  // Expenses / Budget
  EXPENSE_APPROVED: 'EXPENSE_APPROVED',
  EXPENSE_REJECTED: 'EXPENSE_REJECTED',
  EXPENSE_DELETED:  'EXPENSE_DELETED',
  BUDGET_DELETED:   'BUDGET_DELETED',

  // Org settings
  ORG_SETTINGS_UPDATED: 'ORG_SETTINGS_UPDATED',
  ORG_MEMBER_ROLE_CHANGED: 'ORG_MEMBER_ROLE_CHANGED',
  ORG_MEMBER_REMOVED: 'ORG_MEMBER_REMOVED',
} as const;

export type OrgAction = typeof OrgActions[keyof typeof OrgActions];

export type OrgResource =
  | 'project'
  | 'project_member'
  | 'invitation'
  | 'team'
  | 'team_member'
  | 'issue'
  | 'task'
  | 'goal'
  | 'document'
  | 'automation'
  | 'expense'
  | 'budget'
  | 'organization';

// ---------------------------------------------------------------------------
// Core logger — fire-and-forget, never throws
// ---------------------------------------------------------------------------

export async function logOrgAction(params: OrgAuditParams): Promise<void> {
  try {
    const ipAddress = params.request
      ? (params.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         params.request.headers.get('x-real-ip') ||
         params.request.headers.get('cf-connecting-ip') ||
         undefined)
      : undefined;

    const userAgent = params.request
      ? (params.request.headers.get('user-agent') || undefined)
      : undefined;

    await prisma.orgAuditLog.create({
      data: {
        organizationId: params.organizationId,
        actorId:        params.actorId,
        actorEmail:     params.actorEmail,
        actorRole:      params.actorRole,
        action:         params.action,
        resource:       params.resource,
        resourceId:     params.resourceId,
        resourceName:   params.resourceName,
        before:         params.before as any,
        after:          params.after  as any,
        outcome:        params.outcome ?? 'SUCCESS',
        ipAddress:      ipAddress ? encryptField(ipAddress) : undefined,
        userAgent,
      },
    });
  } catch (err) {
    // Audit logging must never break the caller
    console.error('[OrgAudit] Failed to write log entry:', err);
  }
}
