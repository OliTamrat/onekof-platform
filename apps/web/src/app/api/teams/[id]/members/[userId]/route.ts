import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@/lib/prisma';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// DELETE /api/teams/[id]/members/[userId] - Remove a member from a team
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
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
        userId: authUser.id,
      },
    });

    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: authUser.id,
        },
      },
    });

    const isAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';
    const isTeamLead = currentUserTeamMembership?.role === 'LEAD';

    // Allow users to remove themselves
    const isSelf = authUser.id === userIdToRemove;

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

    // INSA audit trail: teams carry project access, so removing someone from
    // one revokes whatever that team granted them.
    logOrgAction({
      organizationId: team.organizationId,
      actorId: authUser.id,
      actorEmail: authUser.email || '',
      actorRole: orgMembership?.role ?? 'MEMBER',
      action: OrgActions.TEAM_MEMBER_REMOVED,
      resource: 'team_member',
      resourceId: params.userId,
      before: { teamId, role: memberToRemove.role },
      request: req,
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
    const authUser = await resolveAuthUser();

    if (!authUser) {
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
          userId: authUser.id,
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

    // INSA audit trail: the previous role is the useful half. Promoting
    // someone to LEAD changes who can add and remove people from the team.
    logOrgAction({
      organizationId: team.organizationId,
      actorId: authUser.id,
      actorEmail: authUser.email || '',
      actorRole: orgMembership?.role ?? 'MEMBER',
      action: OrgActions.TEAM_MEMBER_ROLE_CHANGED,
      resource: 'team_member',
      resourceId: params.userId,
      before: { teamId, role: memberToUpdate.role },
      after: { teamId, role },
      request: req,
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
