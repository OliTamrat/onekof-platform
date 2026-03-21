import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { authorized, error } = await requireSuperAdmin('ADMIN');
  if (!authorized) return error!;

  try {
    const incorrectMembership = await prisma.organizationMember.findFirst({
      where: {
        user: { email: 'admin@ministryofwater.et' },
        organization: { slug: 'mint' }
      },
      include: {
        user: { select: { email: true, name: true } },
        organization: { select: { name: true, slug: true } }
      }
    });

    if (!incorrectMembership) {
      return NextResponse.json({
        message: 'No incorrect membership found',
        fixed: false
      });
    }

    await prisma.organizationMember.delete({
      where: {
        id: incorrectMembership.id
      }
    });

    return NextResponse.json({
      message: 'Fixed tenant isolation issue',
      removed: {
        user: incorrectMembership.user.email,
        from: incorrectMembership.organization.name
      },
      fixed: true
    });
  } catch (error) {
    console.error('Error fixing membership:', error);
    return NextResponse.json({ error: 'Failed to fix membership' }, { status: 500 });
  }
}
