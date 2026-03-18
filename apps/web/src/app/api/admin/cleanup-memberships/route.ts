import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'admin@ministryofwater.et';

/**
 * POST /api/admin/cleanup-memberships
 * One-time cleanup: removes incorrect cross-org memberships
 * - admin@ministryofwater.et should only be in "Ministry of Water and Irrigation"
 * - sifanbone@gmail.com should only be in "Hakim"
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find both users
    const ministryUser = await prisma.user.findUnique({
      where: { email: 'admin@ministryofwater.et' },
    });
    const hakimUser = await prisma.user.findUnique({
      where: { email: 'sifanbone@gmail.com' },
    });

    if (!ministryUser || !hakimUser) {
      return NextResponse.json({
        error: 'One or both users not found',
        found: { ministryUser: !!ministryUser, hakimUser: !!hakimUser },
      }, { status: 404 });
    }

    // Find both orgs
    const hakimOrg = await prisma.organization.findFirst({
      where: { name: { contains: 'Hakim' } },
    });
    const ministryOrg = await prisma.organization.findUnique({
      where: { slug: 'ministry-water-irrigation' },
    });

    if (!hakimOrg || !ministryOrg) {
      return NextResponse.json({
        error: 'One or both organizations not found',
        found: { hakimOrg: !!hakimOrg, ministryOrg: !!ministryOrg },
      }, { status: 404 });
    }

    const removals: string[] = [];

    // Remove admin@ministryofwater.et from Hakim org
    const ministryUserInHakim = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: hakimOrg.id,
          userId: ministryUser.id,
        },
      },
    });

    if (ministryUserInHakim) {
      await prisma.organizationMember.delete({
        where: { id: ministryUserInHakim.id },
      });
      removals.push(`Removed admin@ministryofwater.et from "${hakimOrg.name}"`);
    }

    // Remove sifanbone@gmail.com from Ministry org
    const hakimUserInMinistry = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ministryOrg.id,
          userId: hakimUser.id,
        },
      },
    });

    if (hakimUserInMinistry) {
      await prisma.organizationMember.delete({
        where: { id: hakimUserInMinistry.id },
      });
      removals.push(`Removed sifanbone@gmail.com from "${ministryOrg.name}"`);
    }

    // Update default org IDs
    await prisma.user.update({
      where: { id: ministryUser.id },
      data: { defaultOrganizationId: ministryOrg.id },
    });
    await prisma.user.update({
      where: { id: hakimUser.id },
      data: { defaultOrganizationId: hakimOrg.id },
    });

    return NextResponse.json({
      success: true,
      removals,
      message: removals.length > 0
        ? 'Cleaned up incorrect memberships'
        : 'No incorrect memberships found — already clean',
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
