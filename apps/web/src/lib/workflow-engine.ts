/**
 * Workflow Engine — Status Transition Rules
 *
 * Validates that issue status transitions follow a defined workflow.
 * Enforcement and the transition table come from the settings hierarchy
 * (resolveProjectSettings): a project's workflowTransitions override falls
 * back to DEFAULT_TRANSITIONS, and enforcement is off unless the project
 * (or org default) turns it on.
 *
 * Design principles (default table):
 * - Forward progress is always allowed (BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → DONE)
 * - Backward movement is allowed for corrections (e.g., IN_REVIEW → IN_PROGRESS)
 * - BLOCKED can be entered from any active state and returned to the previous state
 * - DONE → any other status is allowed (reopening)
 * - Direct jumps that skip steps are restricted (e.g., BACKLOG → DONE)
 */

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';

export type TransitionTable = Record<string, readonly string[]>;

interface TransitionResult {
  allowed: boolean;
  reason?: string;
}

export const DEFAULT_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG: ['TODO', 'IN_PROGRESS', 'BLOCKED'],
  // TODO → DONE is allowed: quick-closing a small task without touching
  // In Progress is a legitimate everyday flow (founder testing feedback).
  // BACKLOG → DONE stays restricted — unplanned work should at least be
  // acknowledged before being closed.
  TODO: ['BACKLOG', 'IN_PROGRESS', 'DONE', 'BLOCKED'],
  IN_PROGRESS: ['TODO', 'IN_REVIEW', 'DONE', 'BLOCKED'],
  IN_REVIEW: ['IN_PROGRESS', 'DONE', 'BLOCKED'],
  DONE: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BACKLOG'],
  BLOCKED: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW'],
};

export function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
  options?: { enforceWorkflow?: boolean; transitions?: TransitionTable | null }
): TransitionResult {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  if (!options?.enforceWorkflow) {
    return { allowed: true };
  }

  const table = options?.transitions ?? DEFAULT_TRANSITIONS;
  const allowedTransitions = table[currentStatus];
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

export function getAllowedTransitions(
  currentStatus: TaskStatus,
  transitions?: TransitionTable | null
): TaskStatus[] {
  return ([...((transitions ?? DEFAULT_TRANSITIONS)[currentStatus] || [])]) as TaskStatus[];
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
