import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';
import { decryptField } from '@/lib/security/field-encrypt';

export const dynamic = 'force-dynamic';

/**
 * SECURITY: Audit log is append-only by design (INSA compliance requirement).
 * DELETE is explicitly rejected — no code path may remove audit entries.
 * This handler exists to make the constraint explicit and machine-enforceable,
 * not merely a documentation convention.
 */
export async function DELETE() {
  return NextResponse.json(
    { error: 'Audit log entries cannot be deleted. The log is append-only.' },
    { status: 405, headers: { Allow: 'GET' } }
  );
}

/**
 * GET /api/organizations/[organizationId]/audit-log
 * Returns paginated org audit log entries.
 * Restricted to OWNER and ADMIN members only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    // Only OWNER / ADMIN may view the audit log
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format   = searchParams.get('format') ?? 'json'; // 'json' | 'csv'
    const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10));
    const limit    = format === 'csv'
      ? 10_000 // export up to 10k rows
      : Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const action   = searchParams.get('action')   ?? undefined;
    const actorId  = searchParams.get('actorId')  ?? undefined;
    const resource = searchParams.get('resource') ?? undefined;
    const from     = searchParams.get('from')     ?? undefined;
    const to       = searchParams.get('to')       ?? undefined;

    const where: any = { organizationId };
    if (action)   where.action   = action;
    if (actorId)  where.actorId  = actorId;
    if (resource) where.resource = resource;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const [total, entries] = await Promise.all([
      prisma.orgAuditLog.count({ where }),
      prisma.orgAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:  format === 'csv' ? 0 : (page - 1) * limit,
        take:  limit,
      }),
    ]);

    // Decrypt IP addresses before sending to client
    const decryptedEntries = entries.map((e: any) => ({
      ...e,
      ipAddress: e.ipAddress ? decryptField(e.ipAddress) : null,
    }));

    // ── CSV export ─────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const escape = (v: unknown) => {
        const s = v == null ? '' : String(v);
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      };
      const headers = ['timestamp','actorEmail','actorRole','action','resource','resourceName','resourceId','ipAddress','outcome'];
      const rows = decryptedEntries.map((e: any) => [
        e.createdAt,
        e.actorEmail,
        e.actorRole,
        e.action,
        e.resource,
        e.resourceName ?? '',
        e.resourceId   ?? '',
        e.ipAddress    ?? '',
        e.outcome,
      ].map(escape).join(','));
      const csv = [headers.join(','), ...rows].join('\r\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="audit-log-${organizationId}-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    // ── JSON response ───────────────────────────────────────────────────────────
    return NextResponse.json({
      entries: decryptedEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Audit log fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
