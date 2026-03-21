import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorized, error } = await requireSuperAdmin();
  if (!authorized) return error!;

  try {
    const members = await prisma.organizationMember.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } }
      }
    });

    const formatted = members.map(m => ({
      userEmail: m.user.email,
      userName: m.user.name,
      userId: m.user.id,
      orgName: m.organization.name,
      orgSlug: m.organization.slug,
      orgId: m.organization.id,
      role: m.role
    }));

    return NextResponse.json({ members: formatted }, { status: 200 });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
