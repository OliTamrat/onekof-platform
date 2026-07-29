import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { requirePatientAccess, canSeeIdentifiers } from '@/lib/security/patient-access';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import { encryptField, decryptField } from '@/lib/security/field-encrypt';
import { blindIndex } from '@/lib/security/blind-index';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Patient registry (M1) — dark launch. No UI reaches this yet.
 *
 * Onekof holds healthcare OPERATIONS, not an Electronic Medical Record.
 * There is deliberately no field here for diagnoses, prescriptions,
 * laboratory or imaging results, or clinical notes, and adding one is a
 * decision about the regulatory class of the company rather than a change to
 * this file. See docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md, M1.
 *
 * Every handler passes requirePatientAccess first, which refuses outright on
 * a deployment that may not hold patient data (Tier 3) before it considers
 * who is asking.
 */

/** Shape returned to a caller who may NOT see identifiers (LIMITED). */
function redacted(p: { id: string; birthYear: number | null; erasedAt: Date | null }) {
  return {
    id: p.id,
    // Deliberately no name and no identifier. LIMITED exists so care work can
    // be coordinated by people who have no business knowing who the patient
    // is — a ward clerk scheduling a room does not need the name.
    birthYear: p.birthYear,
    erased: Boolean(p.erasedAt),
    identifiersVisible: false,
  };
}

/**
 * GET /api/patients?identifier=...
 *
 * Without `identifier`, lists patients. With one, looks up by blind index —
 * the plaintext is never decrypted merely to find somebody.
 */
export async function GET(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requirePatientAccess(ctx.organizationId, ctx.user.id, 'LIMITED');
    if (!access.authorized) return access.error!;

    const identifier = req.nextUrl.searchParams.get('identifier');

    const where = identifier
      ? { organizationId: ctx.organizationId, identifierIndex: blindIndex(identifier) }
      : { organizationId: ctx.organizationId };

    const patients = await prisma.patient.findMany({
      where,
      select: {
        id: true,
        identifierEncrypted: true,
        displayNameEncrypted: true,
        birthYear: true,
        erasedAt: true,
        lastActivityAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (!canSeeIdentifiers(access.level)) {
      return NextResponse.json({ patients: patients.map(redacted) });
    }

    // M4: reads of identifying patient data are audited, not just writes.
    // Unauthorised access to health data is almost always a read, and a log
    // of writes alone could never detect it. One entry per request rather
    // than per row — the request is the act.
    logOrgAction({
      organizationId: ctx.organizationId,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorRole: ctx.role,
      action: OrgActions.PATIENT_VIEWED,
      resource: 'patient',
      resourceId: identifier ? patients[0]?.id : undefined,
      after: { count: patients.length, lookup: identifier ? 'by-identifier' : 'list' },
      request: req,
    });

    return NextResponse.json({
      patients: patients.map((p) => ({
        id: p.id,
        // An erased patient keeps its row as an anonymised shell (M6), so the
        // ciphertext columns are null and there is nothing to decrypt.
        identifier: p.identifierEncrypted ? decryptField(p.identifierEncrypted) : null,
        displayName: p.displayNameEncrypted ? decryptField(p.displayNameEncrypted) : null,
        birthYear: p.birthYear,
        erased: Boolean(p.erasedAt),
        lastActivityAt: p.lastActivityAt?.toISOString() ?? null,
        identifiersVisible: true,
      })),
    });
  } catch (err) {
    logger.error('Patient list error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to load patients' }, { status: 500 });
  }
}

/**
 * POST /api/patients — register a patient. Requires MANAGE.
 */
export async function POST(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requirePatientAccess(ctx.organizationId, ctx.user.id, 'MANAGE');
    if (!access.authorized) return access.error!;

    const body = await req.json();
    const { identifier, displayName, birthYear } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json({ error: 'identifier is required' }, { status: 400 });
    }

    // Year only, never a full birth date — enough to tell two same-named
    // people apart, far less identifying than the exact date.
    if (birthYear != null) {
      const year = Number(birthYear);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > thisYear) {
        return NextResponse.json({ error: 'birthYear is out of range' }, { status: 400 });
      }
    }

    const index = blindIndex(identifier);

    const existing = await prisma.patient.findFirst({
      where: { organizationId: ctx.organizationId, identifierIndex: index },
      select: { id: true },
    });

    if (existing) {
      // The same person registered twice is a data-quality error, not two
      // patients. Returning the existing id rather than a bare conflict lets
      // the caller carry on with the record that already exists.
      return NextResponse.json(
        { error: 'Patient already registered', patientId: existing.id },
        { status: 409 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        organizationId: ctx.organizationId,
        identifierEncrypted: encryptField(identifier.trim()),
        identifierIndex: index,
        displayNameEncrypted: displayName ? encryptField(String(displayName).trim()) : null,
        birthYear: birthYear != null ? Number(birthYear) : null,
        createdBy: ctx.user.id,
      },
      select: { id: true, createdAt: true },
    });

    logOrgAction({
      organizationId: ctx.organizationId,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorRole: ctx.role,
      action: OrgActions.PATIENT_CREATED,
      resource: 'patient',
      resourceId: patient.id,
      // The audit entry never carries the identifier itself. An audit log
      // that records the plaintext it was written to protect defeats the
      // encryption on the row.
      after: { hasDisplayName: Boolean(displayName), birthYear: birthYear ?? null },
      request: req,
    });

    return NextResponse.json(
      { patient: { id: patient.id, createdAt: patient.createdAt.toISOString() } },
      { status: 201 }
    );
  } catch (err) {
    logger.error('Patient create error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to register patient' }, { status: 500 });
  }
}
