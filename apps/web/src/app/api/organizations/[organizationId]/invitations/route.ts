import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { generateTokenPair } from '@/lib/security/tokens';
import { sendInvitationEmail } from '@/lib/email';
import { emailSchema } from '@/lib/validation/schemas';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/[organizationId]/invitations
 * Returns all pending invitations for the organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        acceptedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get inviter names
    const inviterIds = [...new Set(invitations.map((i: any) => i.invitedBy))];
    const inviters = await prisma.user.findMany({
      where: { id: { in: inviterIds } },
      select: { id: true, name: true, email: true },
    });
    const inviterMap = new Map(inviters.map((u: any) => [u.id, u]));

    const formattedInvitations = invitations.map((inv: any) => {
      const inviter = inviterMap.get(inv.invitedBy);
      const isExpired = new Date() > new Date(inv.expiresAt);
      return {
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invitedBy: inviter?.name || inviter?.email || 'Unknown',
        createdAt: inv.createdAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
        isExpired,
      };
    });

    return NextResponse.json({ invitations: formattedInvitations });
  } catch (error) {
    logger.error('Error fetching invitations', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[organizationId]/invitations
 * Invite an external user by email to join the organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;
    const body = await request.json();
    const { email, role: requestedRole, projectId, projectRole } = body;
    const role = projectId ? (requestedRole || 'GUEST') : (requestedRole || 'MEMBER');

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY (INSA Finding #3): Strict server-side email validation.
    // The previous regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ accepted HTML/JS
    // payloads like "><svg/onload=confirm(1)>@x.y — stored XSS risk.
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    const normalizedEmail = emailResult.data;

    // Validate role
    const validRoles = ['ADMIN', 'MEMBER', 'GUEST'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, MEMBER, or GUEST' },
        { status: 400 }
      );
    }

    // Validate project role if project-scoped
    if (projectId) {
      const validProjectRoles = ['ADMIN', 'MEMBER', 'VIEWER'];
      if (projectRole && !validProjectRoles.includes(projectRole)) {
        return NextResponse.json(
          { error: 'Invalid project role. Must be ADMIN, MEMBER, or VIEWER' },
          { status: 400 }
        );
      }

      const project = await prisma.project.findFirst({
        where: { id: projectId, organizationId, deletedAt: null },
        select: { id: true, name: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found in this organization' },
          { status: 404 }
        );
      }
    }

    // Verify current user is admin/owner of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const isAdmin = membership.role === 'ADMIN' || membership.role === 'OWNER';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins and owners can invite members' },
        { status: 403 }
      );
    }

    // Check if user already exists and is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (existingUser) {
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: 'This user is already a member of the organization' },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId,
        email: normalizedEmail,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email address' },
        { status: 400 }
      );
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Generate secure token
    const { token: invitationToken, hash: tokenHash } = generateTokenPair();

    // Create invitation (7 day expiry)
    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email: normalizedEmail,
        role: role as any,
        tokenHash,
        invitedBy: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: projectId || null,
        projectRole: projectRole ? (projectRole as any) : null,
      },
    });

    // INSA audit trail: granting someone access to the organization is a
    // privileged action. Recorded at creation, before the email attempt, so
    // an invitation that fails to send still leaves a trace of the grant.
    logOrgAction({
      organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: membership.role,
      action: OrgActions.INVITATION_SENT,
      resource: 'invitation',
      resourceId: invitation.id,
      resourceName: normalizedEmail,
      after: {
        email: normalizedEmail,
        role,
        projectId: projectId || null,
        projectRole: projectRole || null,
        expiresAt: invitation.expiresAt.toISOString(),
      },
      request,
    });

    // Build invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const invitationUrl = `${baseUrl}/auth/accept-invite?token=${invitationToken}`;
    const inviterName = session.user.name || session.user.email || 'A team member';

    // Send invitation email
    try {
      await sendInvitationEmail(
        normalizedEmail,
        inviterName,
        organization.name,
        invitationUrl,
        role
      );
    } catch (emailError) {
      logger.error('Failed to send invitation email', { error: emailError instanceof Error ? emailError.message : emailError });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: normalizedEmail,
        role,
        expiresAt: invitation.expiresAt.toISOString(),
        invitationUrl: process.env.NODE_ENV === 'development' ? invitationUrl : undefined,
      },
      message: `Invitation sent to ${normalizedEmail}`,
    });
  } catch (error) {
    logger.error('Error creating invitation', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[organizationId]/invitations
 * Revoke a pending invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = params;
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Verify admin access
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can revoke invitations' },
        { status: 403 }
      );
    }

    // Scope the lookup to this organization. The delete previously ran on the
    // id alone, so an admin of one organization could revoke an invitation
    // belonging to another simply by passing its id.
    const invitation = await prisma.invitation.findFirst({
      where: { id: invitationId, organizationId },
      select: { id: true, email: true, role: true, projectId: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    await prisma.invitation.delete({
      where: { id: invitation.id },
    });

    // INSA audit trail: revoking access is as privileged as granting it.
    logOrgAction({
      organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: membership.role,
      action: OrgActions.INVITATION_REVOKED,
      resource: 'invitation',
      resourceId: invitation.id,
      resourceName: invitation.email,
      before: {
        email: invitation.email,
        role: invitation.role,
        projectId: invitation.projectId,
      },
      request,
    });

    return NextResponse.json({ message: 'Invitation revoked' });
  } catch (error) {
    logger.error('Error revoking invitation', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
