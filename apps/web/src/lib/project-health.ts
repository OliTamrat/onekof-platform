import type { ProjectHealth } from '@onekof/database';

/**
 * Delivery health for a project, for the leadership rollup.
 *
 * `Project.status` answers "is this project open?" (ACTIVE / ARCHIVED / ON_HOLD).
 * Leaders asked a different question — "is it going well?" — which nothing in
 * the schema answered. This module derives that from the work itself, so the
 * rollup is populated for every existing project without anyone filling in a
 * form, and a lead can override it when the numbers miss the context.
 */

/**
 * Tuning constants, deliberately gathered here rather than scattered through
 * the branches below. These are starting values, not measured ones — revisit
 * them once there is real project data to calibrate against.
 */
export const HEALTH_THRESHOLDS = {
  /** Overdue share at which a project stops being on track. */
  atRiskOverdueRatio: 0.1,
  /** Overdue share at which it is off track rather than merely at risk. */
  offTrackOverdueRatio: 0.25,
  /** Blocked share that dominates any other signal. */
  blockedRatio: 0.2,
  /**
   * How far behind schedule counts as at risk: a project 60% through its
   * calendar with less than 60% - 15pp of work done is drifting.
   */
  scheduleSlipPoints: 0.15,
  /** Twice the slip tolerance means off track, not at risk. */
  offTrackSlipPoints: 0.3,
} as const;

export interface ProjectHealthInput {
  startDate: Date | null;
  dueDate: Date | null;
  healthOverride: ProjectHealth | null;
  tasks: {
    status: string;
    dueDate: Date | null;
  }[];
}

export interface ProjectHealthResult {
  health: ProjectHealth;
  /** True when a lead set this explicitly rather than it being computed. */
  isOverridden: boolean;
  /** Plain-language justification, shown on hover in the rollup. */
  reason: string;
  metrics: {
    total: number;
    done: number;
    blocked: number;
    overdue: number;
    percentComplete: number;
    /** How far through the schedule the project is, 0–1. Null without dates. */
    scheduleElapsed: number | null;
  };
}

const DONE = 'DONE';
const BLOCKED = 'BLOCKED';

/** Whole days between two dates, ignoring time of day. */
function startOfDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function deriveProjectHealth(
  project: ProjectHealthInput,
  now: Date = new Date(),
): ProjectHealthResult {
  const tasks = project.tasks;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === DONE).length;
  const blocked = tasks.filter((t) => t.status === BLOCKED).length;

  const today = startOfDay(now);
  // A task due today is not yet overdue — it is overdue once today has passed.
  const overdue = tasks.filter(
    (t) => t.status !== DONE && t.dueDate != null && startOfDay(t.dueDate) < today,
  ).length;

  const percentComplete = total === 0 ? 0 : done / total;

  let scheduleElapsed: number | null = null;
  if (project.startDate && project.dueDate) {
    const span = startOfDay(project.dueDate) - startOfDay(project.startDate);
    // A same-day project has no meaningful elapsed fraction; treat as unknown
    // rather than dividing by zero and reporting Infinity.
    if (span > 0) {
      const elapsed = today - startOfDay(project.startDate);
      scheduleElapsed = Math.min(1, Math.max(0, elapsed / span));
    }
  }

  const metrics = {
    total,
    done,
    blocked,
    overdue,
    percentComplete,
    scheduleElapsed,
  };

  // An explicit call by the lead wins over every computed signal. It is still
  // reported alongside the metrics so a reader can see what it overrode.
  if (project.healthOverride) {
    return {
      health: project.healthOverride,
      isOverridden: true,
      reason: 'Set manually by the project lead',
      metrics,
    };
  }

  const derived = classify(metrics);
  return { ...derived, isOverridden: false, metrics };
}

function classify(m: ProjectHealthResult['metrics']): {
  health: ProjectHealth;
  reason: string;
} {
  const { total, done, blocked, overdue, percentComplete, scheduleElapsed } = m;

  // Order matters below. Each branch is checked before the ones that would
  // otherwise mask it — a finished project is COMPLETE even if it finished
  // late, and a blocked project is BLOCKED even if nothing is overdue yet.

  if (total === 0) {
    return { health: 'NOT_STARTED', reason: 'No work items yet' };
  }

  if (done === total) {
    return { health: 'COMPLETE', reason: 'All work items are done' };
  }

  if (done === 0 && blocked === 0 && overdue === 0) {
    return { health: 'NOT_STARTED', reason: 'No work started yet' };
  }

  const blockedRatio = blocked / total;
  if (blockedRatio >= HEALTH_THRESHOLDS.blockedRatio) {
    return {
      health: 'BLOCKED',
      reason: `${blocked} of ${total} items blocked`,
    };
  }

  const overdueRatio = overdue / total;
  if (overdueRatio >= HEALTH_THRESHOLDS.offTrackOverdueRatio) {
    return {
      health: 'OFF_TRACK',
      reason: `${overdue} of ${total} items overdue`,
    };
  }

  // Schedule drift: compare how much calendar has been consumed against how
  // much work is finished. Only meaningful once the project has both dates.
  if (scheduleElapsed !== null) {
    const slip = scheduleElapsed - percentComplete;
    if (slip >= HEALTH_THRESHOLDS.offTrackSlipPoints) {
      return {
        health: 'OFF_TRACK',
        reason: `${Math.round(scheduleElapsed * 100)}% of schedule used, ${Math.round(percentComplete * 100)}% complete`,
      };
    }
    if (slip >= HEALTH_THRESHOLDS.scheduleSlipPoints) {
      return {
        health: 'AT_RISK',
        reason: `${Math.round(scheduleElapsed * 100)}% of schedule used, ${Math.round(percentComplete * 100)}% complete`,
      };
    }
  }

  if (overdueRatio >= HEALTH_THRESHOLDS.atRiskOverdueRatio) {
    return {
      health: 'AT_RISK',
      reason: `${overdue} of ${total} items overdue`,
    };
  }

  if (blocked > 0) {
    return { health: 'AT_RISK', reason: `${blocked} blocked item${blocked === 1 ? '' : 's'}` };
  }

  return {
    health: 'ON_TRACK',
    reason: `${Math.round(percentComplete * 100)}% complete, nothing overdue`,
  };
}

/** Display order for the rollup: worst first, so problems lead. */
export const HEALTH_ORDER: ProjectHealth[] = [
  'OFF_TRACK',
  'BLOCKED',
  'AT_RISK',
  'ON_TRACK',
  'NOT_STARTED',
  'COMPLETE',
];

export const HEALTH_LABEL: Record<ProjectHealth, string> = {
  OFF_TRACK: 'Off track',
  BLOCKED: 'Blocked',
  AT_RISK: 'At risk',
  ON_TRACK: 'On track',
  NOT_STARTED: 'Not started',
  COMPLETE: 'Complete',
};

/**
 * Segment colours. Red/amber/green carry the health meaning; the two neutral
 * states are deliberately desaturated so they do not compete with them.
 */
export const HEALTH_COLOR: Record<ProjectHealth, string> = {
  OFF_TRACK: '#E85D5D',
  BLOCKED: '#F2793B',
  AT_RISK: '#EAB308',
  ON_TRACK: '#3B9EDB',
  NOT_STARTED: '#94A3B8',
  COMPLETE: '#7CC576',
};
