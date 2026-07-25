/**
 * Sprint insight aggregation — pure functions, unit-tested, no I/O.
 * See docs/architecture/SPRINT_REPORTING_AND_INSIGHTS.md §2.
 *
 * Input is the sprint's surviving issues (after completion the rollover has
 * moved unfinished work away, so what remains is what the sprint delivered).
 */

export interface InsightIssue {
  id: string;
  status: string;
  timeSpent?: number | null;
  estimate?: number | null;
  storyPoints?: number | null;
  assignee?: { id: string; name: string; avatar?: string } | null;
}

export interface AssigneeContribution {
  /** null id = unassigned bucket */
  id: string | null;
  name: string | null;
  avatar?: string;
  issues: number;
  done: number;
  timeSpent: number;
  estimated: number;
}

export interface SprintInsights {
  totals: {
    issues: number;
    done: number;
    timeSpent: number;
    estimated: number;
  };
  contributions: AssigneeContribution[];
}

export function aggregateSprintInsights(
  issues: InsightIssue[],
  estimationUnit: 'HOURS' | 'POINTS'
): SprintInsights {
  const byAssignee = new Map<string, AssigneeContribution>();
  const totals = { issues: 0, done: 0, timeSpent: 0, estimated: 0 };

  for (const issue of issues) {
    const estimated =
      (estimationUnit === 'POINTS' ? issue.storyPoints : issue.estimate) ?? 0;
    const timeSpent = issue.timeSpent ?? 0;
    const done = issue.status === 'DONE' ? 1 : 0;

    totals.issues += 1;
    totals.done += done;
    totals.timeSpent += timeSpent;
    totals.estimated += estimated;

    const key = issue.assignee?.id ?? '__unassigned__';
    const entry = byAssignee.get(key) ?? {
      id: issue.assignee?.id ?? null,
      name: issue.assignee?.name ?? null,
      avatar: issue.assignee?.avatar,
      issues: 0,
      done: 0,
      timeSpent: 0,
      estimated: 0,
    };
    entry.issues += 1;
    entry.done += done;
    entry.timeSpent += timeSpent;
    entry.estimated += estimated;
    byAssignee.set(key, entry);
  }

  // Most delivered first; unassigned bucket always last
  const contributions = Array.from(byAssignee.values()).sort((a, b) => {
    if (a.id === null) return 1;
    if (b.id === null) return -1;
    if (b.done !== a.done) return b.done - a.done;
    return b.timeSpent - a.timeSpent;
  });

  return { totals, contributions };
}

export interface ChurnEvent {
  entityId: string;
  metadata: { from?: string | null; to?: string | null } | null;
}

export interface ChurnSummary {
  added: number;
  removed: number;
  /** last-known direction per issue: 'in' | 'out' | 'both' */
  perIssue: Map<string, 'in' | 'out' | 'both'>;
}

/**
 * Classify TASK_SPRINT_CHANGED activity rows relative to one sprint.
 * Gross counts by design: an issue added then removed is 1 added + 1
 * removed — churn measures instability, not the net.
 */
export function summarizeChurn(sprintId: string, events: ChurnEvent[]): ChurnSummary {
  let added = 0;
  let removed = 0;
  const perIssue = new Map<string, 'in' | 'out' | 'both'>();

  for (const event of events) {
    const wasAdded = event.metadata?.to === sprintId;
    const wasRemoved = event.metadata?.from === sprintId;
    if (!wasAdded && !wasRemoved) continue;

    if (wasAdded) added += 1;
    if (wasRemoved) removed += 1;

    const direction: 'in' | 'out' = wasAdded ? 'in' : 'out';
    const prev = perIssue.get(event.entityId);
    perIssue.set(
      event.entityId,
      prev && prev !== direction ? 'both' : direction
    );
  }

  return { added, removed, perIssue };
}

/** Whole days between two ISO dates (inclusive-ish, floors partial days). */
export function sprintDurationDays(
  startDate: string | null,
  endDate: string | null
): number | null {
  if (!startDate || !endDate) return null;
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
