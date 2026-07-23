/**
 * Workflow Engine — Status Transition Rules
 *
 * Validates that issue status transitions follow a defined workflow.
 * Default workflow allows standard project management transitions.
 * Future: per-project custom workflows stored in database.
 *
 * Design principles:
 * - Forward progress is always allowed (BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE)
 * - Backward movement is allowed for corrections (e.g., IN_REVIEW → IN_PROGRESS)
 * - BLOCKED can be entered from any active state and returned to the previous state
 * - DONE → any other status is allowed (reopening)
 * - Direct jumps that skip steps are restricted (e.g., BACKLOG → DONE)
 */

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

interface TransitionResult {
  allowed: boolean;
  reason?: string;
}

const DEFAULT_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG: ['TODO', 'IN_PROGRESS', 'BLOCKED'],
  TODO: ['BACKLOG', 'IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['TODO', 'IN_REVIEW', 'DONE', 'BLOCKED'],
  IN_REVIEW: ['IN_PROGRESS', 'DONE', 'BLOCKED'],
  DONE: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BACKLOG'],
  BLOCKED: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW'],
};

export function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
  options?: { enforceWorkflow?: boolean }
): TransitionResult {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  if (!options?.enforceWorkflow) {
    return { allowed: true };
  }

  const allowedTransitions = DEFAULT_TRANSITIONS[currentStatus];
  if (!allowedTransitions) {
    return { allowed: false, reason: `Unknown current status: ${currentStatus}` };
  }

  if (!allowedTransitions.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${formatStatus(currentStatus)} to ${formatStatus(newStatus)}. Allowed transitions: ${allowedTransitions.map(formatStatus).join(', ')}`,
    };
  }

  return { allowed: true };
}

export function getAllowedTransitions(currentStatus: TaskStatus): TaskStatus[] {
  return DEFAULT_TRANSITIONS[currentStatus] || [];
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export const WORKFLOW_STATUSES: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'BACKLOG', label: 'Backlog', color: '#6B7280' },
  { id: 'TODO', label: 'To Do', color: '#9CA3AF' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#8B5CF6' },
  { id: 'DONE', label: 'Done', color: '#22C55E' },
  { id: 'BLOCKED', label: 'Blocked', color: '#EF4444' },
];
