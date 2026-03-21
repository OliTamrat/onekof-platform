import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// DELETE /api/teams/[id]/members/[userId] - Remove a member from a team
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    const userIdToRemove = params.userId;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { organizationId: true },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify current user is a team lead or admin
    const currentUserTeamMembership = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
      },
    });

    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: session.user.id,
        },
      },
    });

    const isAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';
    const isTeamLead = currentUserTeamMembership?.role === 'LEAD';

    // Allow users to remove themselves
    const isSelf = session.user.id === userIdToRemove;

    if (!isAdmin && !isTeamLead && !isSelf) {
      return NextResponse.json(
        { error: 'Only team leads, admins, or the member themselves can remove members' },
        { status: 403 }
      );
    }

    // Find the member
    const memberToRemove = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userIdToRemove,
      },
    });

    if (!memberToRemove) {
      return NextResponse.json(
        { error: 'Member not found in this team' },
        { status: 404 }
      );
    }

    // Delete the member
    await prisma.teamMember.delete({
      where: { id: memberToRemove.id },
    });

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    logger.error('Error removing team member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id]/members/[userId] - Update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    const userIdToUpdate = params.userId;
    const body = await req.json();
    const { role } = body;

    if (!role || !['MEMBER', 'LEAD'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { organizationId: true },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify current user is admin (only admins can change roles)
    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: session.user.id,
        },
      },
    });

    const isAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can change member roles' },
        { status: 403 }
      );
    }

    // Find the member
    const memberToUpdate = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userIdToUpdate,
      },
    });

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: 'Member not found in this team' },
        { status: 404 }
      );
    }

    // Update the member role
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberToUpdate.id },
      data: { role },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        role: updatedMember.role,
      },
    });
  } catch (error) {
    logger.error('Error updating team member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}
