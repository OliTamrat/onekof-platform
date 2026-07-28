/**
 * Department & Workstream catalog — the classification vocabulary (D1).
 *
 * The ONE place that defines valid department/workstream values. The API
 * validates against this catalog; department pages stamp from it; the
 * migration backfill mirrors it. Values are stable slugs shared with the
 * routes and i18n keys (departmentTabs.*).
 *
 * Deliberately strings-in-code rather than a DB enum: departments are
 * organizational vocabulary (a ministry has Directorates, an NGO has
 * Programs). When org-defined departments arrive, they extend through
 * OrgSettings and this module becomes the platform-default registry —
 * no schema migration required.
 */

export const DEPARTMENT_CATALOG = {
  development: ['backlog', 'code-review', 'release'],
  marketing: ['analytics', 'campaign', 'social-media'],
  operations: ['checklist', 'incident', 'monitoring'],
  research: ['data', 'findings', 'inspection', 'materials', 'plan'],
} as const;

export type Department = keyof typeof DEPARTMENT_CATALOG;
export type Workstream = (typeof DEPARTMENT_CATALOG)[Department][number];

export const DEPARTMENTS = Object.keys(DEPARTMENT_CATALOG) as Department[];

export function isDepartment(value: unknown): value is Department {
  return typeof value === 'string' && value in DEPARTMENT_CATALOG;
}

export function isWorkstreamOf(department: unknown, workstream: unknown): boolean {
  if (!isDepartment(department) || typeof workstream !== 'string') return false;
  return (DEPARTMENT_CATALOG[department] as readonly string[]).includes(workstream);
}

export interface ClassificationCheck {
  ok: boolean;
  error?: string;
}

/**
 * Validate a department/workstream pair as it would exist AFTER an update.
 * Rules: null/undefined are always valid (general work); a workstream
 * requires a department and must belong to it; a department must be in
 * the catalog.
 */
export function validateClassification(
  department: string | null | undefined,
  workstream: string | null | undefined
): ClassificationCheck {
  if (workstream != null && department == null) {
    return { ok: false, error: 'A workstream requires a department' };
  }
  if (department != null && !isDepartment(department)) {
    return { ok: false, error: `Unknown department: ${department}` };
  }
  if (workstream != null && !isWorkstreamOf(department, workstream)) {
    return { ok: false, error: `Workstream "${workstream}" does not belong to department "${department}"` };
  }
  return { ok: true };
}
