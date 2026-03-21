import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// DELETE /api/projects/[id]/teams/[teamId] - Remove a team from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const teamId = params.teamId;

    // Verify project exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user is an org admin
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can remove teams from projects' },
        { status: 403 }
      );
    }

    // Find and delete the link
    const link = await prisma.projectTeam.findUnique({
      where: {
        projectId_teamId: {
          projectId,
          teamId,
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Team is not assigned to this project' },
        { status: 404 }
      );
    }

    await prisma.projectTeam.delete({
      where: {
        id: link.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error removing team from project', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to remove team from project' },
      { status: 500 }
    );
  }
}
