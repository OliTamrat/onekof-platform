import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@/lib/prisma';
import { generateTokenPair } from '@/lib/security/tokens';
import { sendInvitationEmail } from '@/lib/email';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id]/members - Get all members of a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get project members
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
      },
      orderBy: [
        { role: 'desc' }, // ADMIN first
        { addedAt: 'asc' },
      ],
    });

    // Fetch user details for each member
    const userIds = projectMembers.map((m: { userId: string }) => m.userId);
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

    const formattedMembers = projectMembers.map((member: { id: string; userId: string; role: string; addedAt: Date }) => {
      const user = userMap.get(member.userId);
      return {
        id: member.id,
        userId: member.userId,
        name: user?.name || user?.email || 'Unknown',
        email: user?.email || '',
        avatar: user?.avatar || null,
        role: member.role,
        addedAt: member.addedAt.toISOString(),
      };
    });

    return NextResponse.json({ members: formattedMembers });
  } catch (error) {
    logger.error('Error fetching project members', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch project members' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/members - Add a member to a project
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await req.json();
    const { userId, email: inviteEmail, role = 'MEMBER' } = body;

    // Verify project exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify current user is a project admin or org admin
    const orgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: authUser.id,
        },
      },
    });

    const currentUserProjectMembership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: authUser.id,
      },
    });

    const isOrgAdmin = orgMembership?.role === 'ADMIN' || orgMembership?.role === 'OWNER';
    const isProjectAdmin = currentUserProjectMembership?.role === 'ADMIN';

    if (!isOrgAdmin && !isProjectAdmin) {
      return NextResponse.json(
        { error: 'Only project admins and org admins can add members' },
        { status: 403 }
      );
    }

    // Email-based invite flow (external contributor support)
    if (inviteEmail && !userId) {
      const normalizedEmail = inviteEmail.trim().toLowerCase();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, avatar: true },
      });

      if (existingUser) {
        // Check if already an org member
        const userOrgMembership = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: project.organizationId,
              userId: existingUser.id,
            },
          },
        });

        if (userOrgMembership) {
          // Already in org - add directly to project
          const existingProjectMember = await prisma.projectMember.findFirst({
            where: { projectId, userId: existingUser.id },
          });

          if (existingProjectMember) {
            return NextResponse.json(
              { error: 'User is already a member of this project' },
              { status: 400 }
            );
          }

          const newMember = await prisma.projectMember.create({
            data: {
              projectId,
              userId: existingUser.id,
              role,
              addedBy: authUser.id,
            },
          });

          return NextResponse.json({
            member: {
              id: newMember.id,
              userId: existingUser.id,
              name: existingUser.name || existingUser.email,
              email: existingUser.email,
              avatar: existingUser.avatar,
              role: newMember.role,
              addedAt: newMember.addedAt.toISOString(),
            },
          });
        }

        // User exists but not in org - invite them to org
      }

      // Send org invitation (user either doesn't exist or not in org)
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          organizationId: project.organizationId,
          email: normalizedEmail,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        return NextResponse.json({
          invited: true,
          message: `An invitation was already sent to ${normalizedEmail}. They will be able to join the project once they accept.`,
        });
      }

      // Get organization info
      const org = await prisma.organization.findUnique({
        where: { id: project.organizationId },
        select: { name: true },
      });

      // Create invitation
      const { token: invitationToken, hash: tokenHash } = generateTokenPair();

      await prisma.invitation.create({
        data: {
          organizationId: project.organizationId,
          email: normalizedEmail,
          role: 'MEMBER',
          tokenHash,
          invitedBy: authUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const invitationUrl = `${baseUrl}/auth/accept-invite?token=${invitationToken}`;
      const inviterName = authUser.name || authUser.email || 'A team member';

      try {
        await sendInvitationEmail(
          normalizedEmail,
          inviterName,
          org?.name || 'your organization',
          invitationUrl,
          'Member'
        );
      } catch (emailError) {
        logger.error('Failed to send invitation email', { error: emailError instanceof Error ? emailError.message : emailError });
      }

      return NextResponse.json({
        invited: true,
        message: `Invitation sent to ${normalizedEmail}. They will join the organization and can then be added to the project.`,
        invitationUrl: process.env.NODE_ENV === 'development' ? invitationUrl : undefined,
      });
    }

    // userId-based flow (existing org members)
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    // Verify user to add exists and is in organization
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
      },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userOrgMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: userToAdd.id,
        },
      },
    });

    if (!userOrgMembership) {
      return NextResponse.json(
        { error: 'User is not a member of this organization. Use the email invite to add external contributors.' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: userToAdd.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this project' },
        { status: 400 }
      );
    }

    // Add member to project
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role,
        addedBy: authUser.id,
      },
    });

    // INSA audit trail: granting project access is a permissions event.
    logOrgAction({
      organizationId: project.organizationId,
      actorId: authUser.id,
      actorEmail: authUser.email || '',
      actorRole: orgMembership?.role ?? 'MEMBER',
      action: OrgActions.PROJECT_MEMBER_ADDED,
      resource: 'project_member',
      resourceId: userToAdd.id,
      after: { projectId, role },
      request: req,
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        userId: userToAdd.id,
        name: userToAdd.name || userToAdd.email,
        email: userToAdd.email,
        avatar: userToAdd.avatar,
        role: newMember.role,
        addedAt: newMember.addedAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error adding project member', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to add project member' },
      { status: 500 }
    );
  }
}
