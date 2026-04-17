import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { verify } from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret';

/**
 * GET /api/auth/mobile/members
 *
 * Returns all members of the user's current organization.
 * Uses Bearer JWT auth (same as /api/auth/mobile/me).
 * Reads org from x-organization-slug header (set by mobile apiFetch).
 *
 * Response: { members: [{ id, name, email, avatar, role }] }
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let payload: { id: string; email: string };
    try {
      payload = verify(token, JWT_SECRET) as { id: string; email: string };
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Get org slug from mobile header
    const orgSlug = request.headers.get('x-organization-slug');
    if (!orgSlug) {
      return NextResponse.json({ error: 'No organization context' }, { status: 400 });
    }

    // Verify user belongs to this org
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: payload.id,
        organization: { slug: orgSlug },
      },
      select: { organizationId: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Fetch all org members
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
      })),
    });
  } catch (error) {
    console.error('Mobile members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
