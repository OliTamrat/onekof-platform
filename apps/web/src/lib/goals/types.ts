/**
 * Shared Goal types and status metadata.
 *
 * Extracted so the List and Board views query the SAME API and render the
 * SAME shape as the main Goals page. The pages that previously lived at
 * /dashboard/goals/list and /board did neither — they rendered hardcoded
 * arrays of invented goals owned by invented people, and were deleted for it
 * (see docs/architecture/PRODUCT_SURFACE_AUDIT.md).
 *
 * Keeping the vocabulary here rather than duplicating it per page is what
 * stops the views drifting apart again.
 */

export type GoalStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AT_RISK'
  | 'COMPLETED'
  | 'CANCELLED';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface KeyResult {
  id: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
}

export interface Goal {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  startDate?: string;
  dueDate?: string;
  owner?: { id: string; name: string; avatar?: string };
  team?: { id: string; name: string; icon?: string; color?: string };
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Board columns, in the order work actually moves. CANCELLED is deliberately
 * absent: a cancelled goal is not a stage of progress, and giving it a column
 * would invite dragging things into it as if it were one. Cancelled goals
 * remain visible in the List view.
 */
export const BOARD_STATUSES: readonly GoalStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'AT_RISK',
  'COMPLETED',
];

/**
 * i18n keys, all of which already exist in every locale — checked rather than
 * assumed, after a first draft invented `goals.statusNotStarted` and friends
 * that were nowhere in the files. IN_PROGRESS and CANCELLED reuse the shared
 * `status.*` group; the rest live under `goals.*`.
 */
export const GOAL_STATUS_LABEL_KEYS: Record<GoalStatus, string> = {
  NOT_STARTED: 'goals.notStarted',
  IN_PROGRESS: 'status.inProgress',
  AT_RISK: 'goals.atRisk',
  COMPLETED: 'goals.completed',
  CANCELLED: 'status.cancelled',
};

export const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  AT_RISK: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export const GOAL_PRIORITY_DOT: Record<GoalPriority, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-blue-400',
};

/** Progress bar colour follows status, so an at-risk goal reads as at-risk. */
export function progressBarClass(status: GoalStatus): string {
  if (status === 'AT_RISK') return 'bg-amber-500';
  if (status === 'COMPLETED') return 'bg-emerald-500';
  if (status === 'CANCELLED') return 'bg-gray-400';
  return 'bg-primary-500';
}

/**
 * Fetch goals for the current organization. Tenancy is resolved server-side
 * from the request, so there is no organization id to pass or to get wrong.
 */
export async function fetchGoals(status?: string): Promise<{ goals: Goal[] }> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  const res = await fetch(`/api/goals?${params}`);
  if (!res.ok) throw new Error('Failed to load goals');
  return res.json();
}
