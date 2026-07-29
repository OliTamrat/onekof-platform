/**
 * Patient access checks (M3) — the gate every patient-data route must pass.
 *
 * Two rules make this different from every other permission check in the
 * codebase, and both are deliberate:
 *
 * 1. ORGANIZATION ROLE CONFERS NOTHING. An OWNER or ADMIN has no patient
 *    access by virtue of being one. Running the institution is not a clinical
 *    reason to read somebody's record, and the person who administers the
 *    workspace is frequently not the person entitled to see patients. This is
 *    the opposite of how budget access works, where FULL_CONTROL is granted
 *    to owners — and the difference is the point.
 *
 * 2. RESIDENCY IS CHECKED FIRST. Before any question of who you are, the
 *    deployment itself must be allowed to hold patient data. On a Tier 3
 *    (Vercel/Supabase EU) deployment the answer is no for everybody,
 *    including an owner with MANAGE. See lib/compliance/residency.ts.
 *
 * Failing the first check is a 403 the user could in principle fix by being
 * granted access. Failing the second is a 404 — see the note on
 * `patientDataUnavailable` below.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { canStorePatientData } from '@/lib/compliance/residency';

export type PatientAccessLevel = 'NO_ACCESS' | 'LIMITED' | 'FULL' | 'MANAGE';

/** Ascending. Each level includes everything below it. */
const LADDER: PatientAccessLevel[] = ['NO_ACCESS', 'LIMITED', 'FULL', 'MANAGE'];

export function meetsPatientAccess(
  actual: PatientAccessLevel | null | undefined,
  required: PatientAccessLevel
): boolean {
  if (!actual) return false;
  return LADDER.indexOf(actual) >= LADDER.indexOf(required);
}

export interface PatientAccessResult {
  authorized: boolean;
  level?: PatientAccessLevel;
  error?: NextResponse;
}

/**
 * On a deployment that may not hold patient data, respond as though the
 * feature does not exist rather than as though it is forbidden.
 *
 * 403 would tell a caller "patients exist here but you cannot see them",
 * which is untrue and leaks the shape of the system. 404 is both more honest
 * and less informative: on this deployment there is genuinely nothing there.
 */
function patientDataUnavailable(): NextResponse {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * Does this user hold at least `required` patient access in this organization?
 *
 * Residency is checked before identity, so a misconfigured or non-sovereign
 * deployment refuses everybody rather than relying on nobody happening to
 * have been granted access.
 */
export async function requirePatientAccess(
  organizationId: string,
  userId: string,
  required: PatientAccessLevel = 'LIMITED'
): Promise<PatientAccessResult> {
  if (!canStorePatientData()) {
    return { authorized: false, error: patientDataUnavailable() };
  }

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { patientAccess: true },
  });

  // Not a member at all — same answer as no access. Nothing here reveals
  // whether the organization exists.
  if (!membership) {
    return { authorized: false, error: patientDataUnavailable() };
  }

  const level = membership.patientAccess as PatientAccessLevel;

  if (!meetsPatientAccess(level, required)) {
    return {
      authorized: false,
      level,
      error: NextResponse.json(
        { error: 'Insufficient patient access' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, level };
}

/**
 * True when this member may see identifying details rather than only that a
 * patient exists. LIMITED can see care work; FULL can see who it is about.
 */
export function canSeeIdentifiers(level: PatientAccessLevel | null | undefined): boolean {
  return meetsPatientAccess(level, 'FULL');
}

/**
 * The viewer's effective patient access, with residency applied.
 *
 * The non-refusing companion to `requirePatientAccess`. A patient route should
 * refuse outright; a task list must not — it carries ordinary work that has
 * nothing to do with patients, and 404-ing the whole board because one row is
 * a care item would break the product for everybody.
 *
 * So list routes resolve a level here and filter, rather than gate. The
 * residency rule is identical either way: on a deployment that may not hold
 * patient data, everybody's effective level is null, including an owner who
 * was granted MANAGE before the deployment moved.
 *
 * Takes the raw column value (a string, from an already-loaded membership)
 * rather than doing its own query, so the common path costs nothing.
 */
export function effectivePatientAccess(
  raw: string | null | undefined
): PatientAccessLevel | null {
  if (!canStorePatientData()) return null;
  if (!raw) return null;
  return (LADDER as string[]).includes(raw) ? (raw as PatientAccessLevel) : null;
}

/**
 * A Prisma `where` fragment that excludes care items from a task query for a
 * viewer below LIMITED.
 *
 * Filtering in the database rather than in JavaScript is not an optimisation
 * here — it is a correctness requirement. A post-filter applied after
 * `take`/`skip` would return short pages and a `total` that counts rows the
 * caller may not see, which both leaks the number of care items and breaks
 * pagination. The count and the page must be computed over the same rows.
 */
export function careItemExclusion(
  level: PatientAccessLevel | null | undefined
): { patientId?: null } {
  return meetsPatientAccess(level, 'LIMITED') ? {} : { patientId: null };
}

/**
 * Look up a member's effective patient access.
 *
 * For routes that do not already hold a membership row — the single-issue
 * routes authenticate through the session rather than
 * `resolveUserOrganization`, so they have no `patientAccess` in hand.
 *
 * Callers should reach for this only once they know the record in question is
 * a care item. On the overwhelming majority of tasks `patientId` is null and
 * this query is pure cost for an answer nothing will use.
 */
export async function getPatientAccessLevel(
  organizationId: string,
  userId: string
): Promise<PatientAccessLevel | null> {
  if (!canStorePatientData()) return null;

  const membership = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
    select: { patientAccess: true },
  });

  return effectivePatientAccess(membership?.patientAccess);
}

/**
 * May this caller attach a task to this patient?
 *
 * FULL, not LIMITED. Linking work to a patient means naming them, and LIMITED
 * is defined by not being allowed to know whose care item is whose — a LIMITED
 * member who could set the link would have to have obtained a patient id the
 * level exists to withhold.
 *
 * Three ways this fails, all answered the same way so none of them confirms
 * that a given patient id exists in some other organization:
 *
 *   - the caller lacks FULL (or the deployment may not hold patient data)
 *   - the patient belongs to a different organization
 *   - the patient has been erased under M6
 *
 * The last one is not an edge case. An erased patient is an anonymised shell
 * kept so operational statistics survive; attaching new work to it would
 * quietly rebuild a record about someone whose identifiers were destroyed on
 * request.
 */
export async function canLinkCareItem(
  organizationId: string,
  patientId: string,
  level: PatientAccessLevel | null | undefined
): Promise<boolean> {
  if (!canStorePatientData()) return false;
  if (!meetsPatientAccess(level, 'FULL')) return false;

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, organizationId, erasedAt: null },
    select: { id: true },
  });

  return Boolean(patient);
}
