import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { canStorePatientData } from '@/lib/compliance/residency';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Granting and revoking patient access (M3).
 *
 * ARCHITECTURAL DECISION, 2026-07-29 — who may grant.
 *
 * Only the organization OWNER. Not ADMIN, and not a holder of MANAGE.
 *
 * Not MANAGE, because of bootstrapping: if only someone with patient access
 * could grant it, nobody could ever receive the first grant and the whole
 * module would be permanently inert. The first grant has to come from an
 * organization role.
 *
 * Not ADMIN, because ADMIN is a broad operational role — frequently held by
 * IT staff who administer the workspace and have no clinical standing.
 * Deciding who may read patient records is the most consequential permission
 * in this system, and it belongs with the person accountable for the
 * institution rather than whoever manages its software.
 *
 * Note this does NOT contradict M3's rule that organization role confers no
 * patient access. An OWNER still has NO_ACCESS themselves until somebody
 * grants it — including if they grant it to themselves, which is allowed and
 * audited precisely so the record exists. Being able to open the door is not
 * the same as being inside it.
 */

const LEVELS = ['NO_ACCESS', 'LIMITED', 'FULL', 'MANAGE'] as const;
type Level = (typeof LEVELS)[number];

/** Same 404-not-403 reasoning as lib/security/patient-access.ts. */
function unavailable() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

/**
 * PATCH /api/patients/access
 * Body: { userId, level }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Residency first, before identity — a deployment that may not hold
    // patient data must not be able to hand out access to it either.
    if (!canStorePatientData()) return unavailable();

    if (ctx.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only the organization owner can change patient access' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, level } = body as { userId?: string; level?: Level };

    if (!userId || !level || !LEVELS.includes(level)) {
      return NextResponse.json(
        { error: `userId and level are required; level must be one of ${LEVELS.join(', ')}` },
        { status: 400 }
      );
    }

    const target = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: ctx.organizationId, userId } },
      select: { patientAccess: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const previous = target.patientAccess as Level;
    if (previous === level) {
      return NextResponse.json({ userId, level, unchanged: true });
    }

    await prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId: ctx.organizationId, userId } },
      data: { patientAccess: level },
    });

    // Granting and revoking are separate actions rather than one
    // "changed" event: an auditor scanning for who was given access to health
    // data should not have to compare two JSON blobs to find out.
    const granting = LEVELS.indexOf(level) > LEVELS.indexOf(previous);

    logOrgAction({
      organizationId: ctx.organizationId,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorRole: ctx.role,
      action: granting
        ? OrgActions.PATIENT_ACCESS_GRANTED
        : OrgActions.PATIENT_ACCESS_REVOKED,
      resource: 'patient',
      resourceId: userId,
      before: { patientAccess: previous },
      after: { patientAccess: level },
      request: req,
    });

    return NextResponse.json({ userId, level, previous });
  } catch (err) {
    logger.error('Patient access change error', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: 'Failed to change patient access' }, { status: 500 });
  }
}

/**
 * GET /api/patients/access — who holds patient access in this organization.
 *
 * Owner-only. The list of people who may read health data is itself
 * sensitive: it maps precisely who to compromise.
 */
export async function GET() {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    if (!canStorePatientData()) return unavailable();

    if (ctx.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only the organization owner can view patient access' },
        { status: 403 }
      );
    }

    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId: ctx.organizationId,
        NOT: { patientAccess: 'NO_ACCESS' },
      },
      select: {
        userId: true,
        patientAccess: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        userId: m.userId,
        level: m.patientAccess,
        name: m.user.name,
        email: m.user.email,
      })),
    });
  } catch (err) {
    logger.error('Patient access list error', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: 'Failed to list patient access' }, { status: 500 });
  }
}
