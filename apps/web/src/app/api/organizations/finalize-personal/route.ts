import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/organizations/finalize-personal
 * Finalizes the user's auto-created placeholder workspace as a personal workspace.
 * Called when a user selects "Personal Workspace" during onboarding.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user's most recent placeholder workspace (type="personal", created at signup)
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        role: 'OWNER',
        organization: {
          type: 'personal',
        },
      },
      include: {
        organization: true,
      },
      orderBy: {
        organization: {
          createdAt: 'desc',
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No personal workspace found. Please contact support.' },
        { status: 404 }
      );
    }

    const org = membership.organization;

    // Update the user's default organization to this personal workspace
    await prisma.user.update({
      where: { id: session.user.id },
      data: { defaultOrganizationId: org.id },
    });

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        type: 'personal',
      },
      message: 'Personal workspace is ready.',
    });
  } catch (error) {
    logger.error('Error finalizing personal workspace', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to set up personal workspace' },
      { status: 500 }
    );
  }
}
