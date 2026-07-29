/**
 * Care item visibility (M2).
 *
 * A task carrying a `patientId` is a care item. Project access alone does NOT
 * make it visible: the whole point of M3's separate ladder is that being on
 * the project team and being entitled to see patients are different things.
 *
 * Three outcomes, and the middle one is the one that is easy to get wrong:
 *
 *   NO_ACCESS  — the care item is not returned at all. Not returned redacted;
 *                omitted. A redacted row still tells you a patient exists and
 *                that somebody is doing work about them, which on a small
 *                ward is often enough to identify who.
 *
 *   LIMITED    — the care item IS returned, with the patient reference
 *                withheld. This is the level that lets a scheduler move a
 *                task through a board without learning whose task it is.
 *
 *   FULL/MANAGE — returned intact.
 *
 * The asymmetry between NO_ACCESS and LIMITED is deliberate. Hiding the row
 * entirely is the safe default; showing a redacted row is a considered
 * decision that someone has a reason to see the work exists.
 */

import type { PatientAccessLevel } from '@/lib/security/patient-access';
import { meetsPatientAccess } from '@/lib/security/patient-access';

/** Minimum shape this module needs. Real tasks carry far more. */
export interface CareItemLike {
  id: string;
  patientId?: string | null;
}

/** A care item is any task pointing at a patient. */
export function isCareItem(task: CareItemLike): boolean {
  return Boolean(task.patientId);
}

/**
 * Filter a task list for a viewer. Ordinary tasks pass through untouched —
 * this must never affect the 99% of work that has nothing to do with
 * patients.
 */
export function filterCareItems<T extends CareItemLike>(
  tasks: T[],
  level: PatientAccessLevel | null | undefined
): T[] {
  if (meetsPatientAccess(level, 'LIMITED')) return tasks;
  // Below LIMITED: care items are omitted, ordinary tasks are kept.
  return tasks.filter((t) => !isCareItem(t));
}

/**
 * Strip the patient reference from a care item for a viewer who may see that
 * the work exists but not who it concerns.
 *
 * Returns the task unchanged when it is not a care item, or when the viewer
 * holds FULL or above.
 */
export function redactCareItem<T extends CareItemLike>(
  task: T,
  level: PatientAccessLevel | null | undefined
): T {
  if (!isCareItem(task)) return task;
  if (meetsPatientAccess(level, 'FULL')) return task;
  // Null rather than delete: callers and types still see the field, so a
  // missing key cannot be mistaken for "this task has no patient".
  return { ...task, patientId: null };
}

/**
 * The two operations together, in the order that matters: filter first, then
 * redact what survives. Redacting before filtering would strip the patientId
 * a NO_ACCESS viewer's filter then needs to recognise the row as a care item
 * — and every care item would leak through as an ordinary task.
 */
export function applyCareItemVisibility<T extends CareItemLike>(
  tasks: T[],
  level: PatientAccessLevel | null | undefined
): T[] {
  return filterCareItems(tasks, level).map((t) => redactCareItem(t, level));
}
