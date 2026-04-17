import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@/lib/prisma';
import { generateTokenPair } from '@/lib/security/tokens';
import { sendInvitationEmail } from '@/lib/email';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/teams/[id]/members - Get all members of a team
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;

    // Verify team exists and user has access
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { organizationId: true },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
      },
      orderBy: [
        { role: 'desc' }, // LEAD first
        { joinedAt: 'asc' },
      ],
    });

    // Fetch user details for each member
    const userIds = teamMembers.map((m: { userId: string }) => m.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    const userMap = new Map(users.map((u: { id: string; email: string; name: string | null; avatar: string | null }) => [u.id, u]));

    const formattedMembers = teamMembers.map((member: { id: string; userId: string; role: string; joinedAt: Date }) => {
      const user = userMap.get(member.userId);
      return {
        id: member.id,
        userId: member.userId,
        name: user?.name || user?.email || 'Unknown',
        email: user?.email || '',
        avatar: user?.avatar || null,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      };
    });

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    logger.error('Error fetching team members', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/members - Add a member to a team
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    const body = await req.json();
    const { userEmail, role = 'MEMBER' } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Verify team exists and get organization
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

    if (!isAdmin && !isTeamLead) {
      return NextResponse.json(
        { error: 'Only team leads and admins can add members' },
        { status: 403 }
      );
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    // If user doesn't exist, send invitation
    if (!userToAdd) {
      // Check if invitation already exists
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          organizationId: team.organizationId,
          email: userEmail,
          acceptedAt: null,
        },
      });

      if (existingInvitation) {
        return NextResponse.json(
          { error: 'Invitation already sent to this email' },
          { status: 400 }
        );
      }

      // Create secure invitation token
      const { token: invitationToken, hash: tokenHash } = generateTokenPair();

      // Create invitation (expires in 7 days)
      const invitation = await prisma.invitation.create({
        data: {
          organizationId: team.organizationId,
          email: userEmail,
          role: 'MEMBER',
          tokenHash,
          invitedBy: authUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Send invitation email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const invitationUrl = `${baseUrl}/auth/accept-invite?token=${invitationToken}`;
      const inviterName = authUser.name || authUser.email || 'A team member';

      // Fetch organization name for the email
      const org = await prisma.organization.findUnique({
        where: { id: team.organizationId },
        select: { name: true },
      });

      try {
        await sendInvitationEmail(
          userEmail,
          inviterName,
          org?.name || 'your organization',
          invitationUrl
        );
      } catch (emailError) {
        logger.error('Failed to send invitation email', { error: emailError instanceof Error ? emailError.message : emailError });
      }

      return NextResponse.json({
        invited: true,
        message: `Invitation sent to ${userEmail}`,
        invitation: {
          email: userEmail,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      });
    }

    // User exists, check if they're in the organization
    const userOrgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: userToAdd.id,
        },
      },
    });

    if (!userOrgMembership) {
      // User exists but is not in the org — auto-invite them
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          organizationId: team.organizationId,
          email: userEmail,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        return NextResponse.json({
          invited: true,
          message: `An invitation was already sent to ${userEmail}. They will be able to join the team once they accept.`,
        });
      }

      // Create invitation for existing user who's not in the org
      const { token: invToken, hash: invHash } = generateTokenPair();
      const org = await prisma.organization.findUnique({
        where: { id: team.organizationId },
        select: { name: true },
      });

      await prisma.invitation.create({
        data: {
          organizationId: team.organizationId,
          email: userEmail,
          role: 'MEMBER',
          tokenHash: invHash,
          invitedBy: authUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const invUrl = `${baseUrl}/auth/accept-invite?token=${invToken}`;
      const inviterName = authUser.name || authUser.email || 'A team member';

      try {
        await sendInvitationEmail(
          userEmail,
          inviterName,
          org?.name || 'your organization',
          invUrl,
          'Member'
        );
      } catch (emailError) {
        logger.error('Failed to send invitation email', { error: emailError instanceof Error ? emailError.message : emailError });
      }

      return NextResponse.json({
        invited: true,
        message: `Invitation sent to ${userEmail}. They need to join the organization first, then can be added to the team.`,
      });
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }

    // Add member to team
    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
        role,
        addedBy: authUser.id,
      },
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        userId: userToAdd.id,
        name: userToAdd.name || userToAdd.email,
        email: userToAdd.email,
        avatar: userToAdd.avatar,
        role: newMember.role,
        joinedAt: newMember.joinedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error adding team member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}
