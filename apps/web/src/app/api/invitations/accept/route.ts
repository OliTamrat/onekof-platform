import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { verifyTokenHash, isTokenExpired } from '@/lib/security/tokens';
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

    // Find all pending invitations (we need to check token against each hash)
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

    // Find the matching invitation by verifying the token hash
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

    // Check expiration
    if (isTokenExpired(matchedInvitation.expiresAt)) {
      return NextResponse.json(
        { error: 'This invitation has expired. Please ask the sender for a new invitation.' },
        { status: 400 }
      );
    }

    // Any authenticated user with a valid token can accept
    // The token is the security — no email match required

    // Check if already a member
    const existingMembership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: matchedInvitation.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (existingMembership) {
      // Mark invitation as accepted even if already a member
      await prisma.invitation.update({
        where: { id: matchedInvitation.id },
        data: { acceptedAt: new Date() },
      });

      return NextResponse.json({
        message: 'You are already a member of this organization',
        organization: matchedInvitation.organization,
        alreadyMember: true,
      });
    }

    // Create organization membership and mark invitation as accepted
    await prisma.$transaction([
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
    ]);

    return NextResponse.json({
      message: `You have joined ${matchedInvitation.organization.name}`,
      organization: matchedInvitation.organization,
      role: matchedInvitation.role,
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
 * Validate an invitation token and return details (for the accept page)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to view invitation details' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }

    // Find matching invitation
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

    return NextResponse.json({
      valid: !isExpired,
      invitation: {
        role: matchedInvitation.role,
        organizationName: matchedInvitation.organization.name,
        organizationSlug: matchedInvitation.organization.slug,
        invitedBy: 'A team member',
        expiresAt: matchedInvitation.expiresAt.toISOString(),
        isExpired,
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
