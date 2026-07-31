import { NextResponse } from 'next/server';
import { resolveUserOrganization } from '@/lib/api-organization';
import { getResidencyPosture } from '@/lib/compliance/residency';
import { effectivePatientAccess } from '@/lib/security/patient-access';

export const dynamic = 'force-dynamic';

/**
 * GET /api/medical/status
 *
 * What the Medical UI needs before it renders anything: may this deployment
 * hold patient data at all, and what is this member allowed to see?
 *
 * This exists because the patient routes answer 404 for BOTH "the deployment
 * may not hold patient data" and "there is nothing here" — deliberately, so
 * a Tier 3 deployment discloses nothing about the shape of the system. That
 * is right for an API and useless for a screen: a page cannot tell the user
 * anything true from a bare 404.
 *
 * So the explanation lives in one endpoint that says plainly why, and the
 * patient routes stay uninformative. Nothing here is sensitive: the
 * deployment's own tier and the caller's own access level, neither of which
 * tells them anything about a patient.
 */
export async function GET() {
  const { data: ctx, error } = await resolveUserOrganization();
  if (error || !ctx) return error!;

  const posture = getResidencyPosture();
  const level = effectivePatientAccess(ctx.patientAccess);

  return NextResponse.json({
    residency: {
      tier: posture.tier,
      location: posture.location,
      // The single fact the UI branches on. Named for what it permits rather
      // than for the tier number, so a later tier change cannot silently
      // invert the meaning of this field.
      canHoldPatientData: posture.inCountry,
    },
    access: {
      // null on a deployment that may not hold patient data — the grant is
      // real but has no effect there, and reporting the stored value would
      // invite a screen that says "you have MANAGE" beside an empty list.
      level,
      canSeeIdentifiers: level === 'FULL' || level === 'MANAGE',
      canRegister: level === 'MANAGE',
    },
  });
}
