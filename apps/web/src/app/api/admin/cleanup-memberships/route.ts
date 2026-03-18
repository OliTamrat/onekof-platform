import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'admin@ministryofwater.et';

/**
 * GET /api/admin/cleanup-memberships
 * Diagnose: show all memberships for both users
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        email: { in: ['admin@ministryofwater.et', 'sifanbone@gmail.com'] },
      },
      select: { id: true, email: true, name: true, defaultOrganizationId: true },
    });

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, email: true } },
      },
    });

    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ users, memberships, allOrgs });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/cleanup-memberships
 * Fix: ensure each user is only in their correct org
 * - admin@ministryofwater.et → Ministry of Water and Irrigation only
 * - sifanbone@gmail.com → Hakim only (restore if missing)
 */
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Find all orgs to identify them
    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });

    const ministryOrg = allOrgs.find((o) => o.slug === 'ministry-water-irrigation');

    // Hakim org: find by process of elimination or name match
    const hakimOrg = allOrgs.find(
      (o) => o.name.toLowerCase().includes('hakim') || o.slug.toLowerCase().includes('hakim')
    ) || allOrgs.find((o) => o.id !== ministryOrg?.id);

    if (!ministryOrg || !hakimOrg) {
      return NextResponse.json({
        error: 'Cannot identify orgs',
        allOrgs,
      }, { status: 404 });
    }

    const actions: string[] = [];

    // Step 1: Remove sifanbone from Ministry org (if present)
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
      actions.push(`Removed sifanbone@gmail.com from "${ministryOrg.name}"`);
    }

    // Step 2: Remove admin@ministry from Hakim org (if present)
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
      actions.push(`Removed admin@ministryofwater.et from "${hakimOrg.name}"`);
    }

    // Step 3: Ensure sifanbone IS in Hakim org
    const hakimUserInHakim = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: hakimOrg.id,
          userId: hakimUser.id,
        },
      },
    });

    if (!hakimUserInHakim) {
      await prisma.organizationMember.create({
        data: {
          organizationId: hakimOrg.id,
          userId: hakimUser.id,
          role: 'OWNER',
        },
      });
      actions.push(`Added sifanbone@gmail.com back to "${hakimOrg.name}" as OWNER`);
    }

    // Step 4: Ensure admin@ministry IS in Ministry org
    const ministryUserInMinistry = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: ministryOrg.id,
          userId: ministryUser.id,
        },
      },
    });

    if (!ministryUserInMinistry) {
      await prisma.organizationMember.create({
        data: {
          organizationId: ministryOrg.id,
          userId: ministryUser.id,
          role: 'OWNER',
          budgetAccess: 'FULL_CONTROL',
        },
      });
      actions.push(`Added admin@ministryofwater.et back to "${ministryOrg.name}" as OWNER`);
    }

    // Step 5: Remove any auto-created workspace orgs (not Ministry or Hakim)
    const autoCreatedOrg = allOrgs.find(
      (o) => o.id !== ministryOrg.id && o.id !== hakimOrg.id
    );

    if (autoCreatedOrg) {
      // Remove all related data before deleting the org
      await prisma.organizationMember.deleteMany({
        where: { organizationId: autoCreatedOrg.id },
      });
      await prisma.organizationSettings.deleteMany({
        where: { organizationId: autoCreatedOrg.id },
      });
      await prisma.invitation.deleteMany({
        where: { organizationId: autoCreatedOrg.id },
      });
      await prisma.organization.delete({
        where: { id: autoCreatedOrg.id },
      });
      actions.push(`Deleted auto-created org "${autoCreatedOrg.name}" (${autoCreatedOrg.slug})`);
    }

    // Step 6: Fix default org IDs
    await prisma.user.update({
      where: { id: ministryUser.id },
      data: { defaultOrganizationId: ministryOrg.id },
    });
    await prisma.user.update({
      where: { id: hakimUser.id },
      data: { defaultOrganizationId: hakimOrg.id },
    });
    actions.push('Updated default organization IDs for both users');

    return NextResponse.json({
      success: true,
      actions,
      result: {
        'admin@ministryofwater.et': ministryOrg.name,
        'sifanbone@gmail.com': hakimOrg.name,
      },
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
