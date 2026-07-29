import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { verifyTokenHash, isTokenExpired } from '@/lib/security/tokens';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/invitations/accept
 * Accept an organization invitation using the token
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to accept an invitation' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    const pendingInvitations = await prisma.invitation.findMany({
      where: {
        acceptedAt: null,
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    let matchedInvitation: any = null;
    for (const inv of pendingInvitations) {
      try {
        if (verifyTokenHash(token, inv.tokenHash)) {
          matchedInvitation = inv;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedInvitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation link' },
        { status: 400 }
      );
    }

    if (isTokenExpired(matchedInvitation.expiresAt)) {
      return NextResponse.json(
        { error: 'This invitation has expired. Please ask the sender for a new invitation.' },
        { status: 400 }
      );
    }

    // Enforce email matching — only the invited email can accept
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (user?.email?.toLowerCase() !== matchedInvitation.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'This invitation was sent to a different email address. Please sign out and sign in with the correct account.',
          invitedEmail: matchedInvitation.email,
          currentEmail: user?.email,
          emailMismatch: true,
        },
        { status: 403 }
      );
    }

    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: matchedInvitation.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (existingMembership) {
      await prisma.invitation.update({
        where: { id: matchedInvitation.id },
        data: { acceptedAt: new Date() },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { defaultOrganizationId: matchedInvitation.organizationId },
      });

      return NextResponse.json({
        message: 'You are already a member of this organization',
        organization: matchedInvitation.organization,
        alreadyMember: true,
      });
    }

    const transactionOps = [
      prisma.organizationMember.create({
        data: {
          organizationId: matchedInvitation.organizationId,
          userId: session.user.id,
          role: matchedInvitation.role,
          invitedBy: matchedInvitation.invitedBy,
        },
      }),
      prisma.invitation.update({
        where: { id: matchedInvitation.id },
        data: { acceptedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { defaultOrganizationId: matchedInvitation.organizationId },
      }),
    ];

    if (matchedInvitation.projectId) {
      transactionOps.push(
        prisma.projectMember.create({
          data: {
            projectId: matchedInvitation.projectId,
            userId: session.user.id,
            role: matchedInvitation.projectRole || 'MEMBER',
            addedBy: matchedInvitation.invitedBy,
          },
        }) as any
      );
    }

    await prisma.$transaction(transactionOps);

    // INSA audit trail: this is the moment someone actually gains access to
    // the organization. The actor is the invitee accepting, which is why the
    // `before` records who issued the invitation — otherwise the trail shows
    // people joining with no record of who let them in.
    logOrgAction({
      organizationId: matchedInvitation.organizationId,
      actorId: session.user.id,
      actorEmail: session.user.email || '',
      actorRole: matchedInvitation.role,
      action: OrgActions.INVITATION_ACCEPTED,
      resource: 'invitation',
      resourceId: matchedInvitation.id,
      resourceName: session.user.email || undefined,
      before: { invitedBy: matchedInvitation.invitedBy },
      after: {
        role: matchedInvitation.role,
        projectId: matchedInvitation.projectId || null,
        projectRole: matchedInvitation.projectId
          ? matchedInvitation.projectRole || 'MEMBER'
          : null,
      },
      request,
    });

    let projectName = null;
    if (matchedInvitation.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: matchedInvitation.projectId },
        select: { name: true },
      });
      projectName = project?.name;
    }

    return NextResponse.json({
      message: projectName
        ? `You have joined ${matchedInvitation.organization.name} and project ${projectName}`
        : `You have joined ${matchedInvitation.organization.name}`,
      organization: matchedInvitation.organization,
      role: matchedInvitation.role,
      projectId: matchedInvitation.projectId,
      projectRole: matchedInvitation.projectRole,
    });
  } catch (error) {
    logger.error('Error accepting invitation', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invitations/accept?token=xxx
 * Validate an invitation token and return details.
 * Does NOT require authentication — unauthenticated users need to see
 * the invitation details so they can decide to sign in or sign up.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }

    const pendingInvitations = await prisma.invitation.findMany({
      where: { acceptedAt: null },
      include: {
        organization: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    let matchedInvitation: any = null;
    for (const inv of pendingInvitations) {
      try {
        if (verifyTokenHash(token, inv.tokenHash)) {
          matchedInvitation = inv;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedInvitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation link' },
        { status: 400 }
      );
    }

    const isExpired = isTokenExpired(matchedInvitation.expiresAt);

    let projectName = null;
    if (matchedInvitation.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: matchedInvitation.projectId },
        select: { name: true },
      });
      projectName = project?.name;
    }

    return NextResponse.json({
      valid: !isExpired,
      invitation: {
        role: matchedInvitation.role,
        organizationName: matchedInvitation.organization.name,
        organizationSlug: matchedInvitation.organization.slug,
        invitedBy: 'A team member',
        expiresAt: matchedInvitation.expiresAt.toISOString(),
        isExpired,
        projectName,
        projectRole: matchedInvitation.projectRole,
      },
    });
  } catch (error) {
    logger.error('Error validating invitation', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}
