import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/organizations/cleanup-placeholder
 * Removes the auto-created placeholder personal workspace after a user
 * creates a proper organization during onboarding.
 * This prevents users from having a useless "{name}'s Workspace" alongside
 * their real organization.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newOrganizationId } = await req.json();

    if (!newOrganizationId) {
      return NextResponse.json(
        { error: 'newOrganizationId is required' },
        { status: 400 }
      );
    }

    // Find placeholder workspace(s) — type="personal" with no projects, no other members
    const placeholderOrgs = await prisma.organizationMember.findMany({
      where: {
        userId: session.user.id,
        role: 'OWNER',
        organization: {
          type: 'personal',
          id: { not: newOrganizationId },
        },
      },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    // Only delete truly empty placeholder orgs (1 member, 0 projects)
    const toDelete = placeholderOrgs.filter(
      (m) => m.organization._count.members <= 1 && m.organization._count.projects === 0
    );

    if (toDelete.length === 0) {
      return NextResponse.json({ message: 'No placeholder workspaces to clean up', deleted: 0 });
    }

    // Delete placeholder orgs and update user's default org
    await prisma.$transaction(async (tx) => {
      for (const membership of toDelete) {
        // Remove membership first (FK constraint)
        await tx.organizationMember.delete({
          where: {
            organizationId_userId: {
              organizationId: membership.organizationId,
              userId: session.user.id,
            },
          },
        });

        // Delete the empty placeholder organization
        await tx.organization.delete({
          where: { id: membership.organizationId },
        });
      }

      // Set the new organization as default
      await tx.user.update({
        where: { id: session.user.id },
        data: { defaultOrganizationId: newOrganizationId },
      });
    });

    return NextResponse.json({
      message: `Cleaned up ${toDelete.length} placeholder workspace(s)`,
      deleted: toDelete.length,
    });
  } catch (error) {
    logger.error('Error cleaning up placeholder workspace', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to clean up placeholder workspace' },
      { status: 500 }
    );
  }
}
