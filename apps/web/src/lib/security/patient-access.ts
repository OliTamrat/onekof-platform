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
