export const REALTIME_EVENTS = {
  // Issue events
  ISSUE_CREATED: 'issue.created',
  ISSUE_UPDATED: 'issue.updated',
  ISSUE_DELETED: 'issue.deleted',
  ISSUE_COMMENTED: 'issue.commented',
  ISSUE_STATUS_CHANGED: 'issue.status_changed',
  ISSUE_ASSIGNED: 'issue.assigned',

  // Project events
  PROJECT_UPDATED: 'project.updated',
  PROJECT_MEMBER_ADDED: 'project.member_added',

  // Budget events
  BUDGET_UPDATED: 'budget.updated',
  EXPENSE_SUBMITTED: 'expense.submitted',
  EXPENSE_APPROVED: 'expense.approved',
  EXPENSE_REJECTED: 'expense.rejected',
  BUDGET_THRESHOLD: 'budget.threshold',

  // Notification events
  NOTIFICATION: 'notification',

  // Presence events
  PRESENCE: 'presence',
  USER_TYPING: 'user.typing',

  // Document events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_PROCESSED: 'document.processed',
} as const;

export type RealtimeEventType = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
