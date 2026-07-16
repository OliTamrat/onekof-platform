import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationContext } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organization-members
 * Returns all members of the current organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get organization context and validate access
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;
    if (!context) {
      return NextResponse.json(
        { error: 'Failed to get organization context' },
        { status: 500 }
      );
    }

    const { organization } = context;
    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page');

    const { prisma } = await import('@onekof/database');

    const whereClause = {
      organizationId: organization.id,
    };

    const includeClause = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      },
    };

    const orderByClause = [
      { role: 'asc' as const }, // OWNER first, then ADMIN, then MEMBER
      { joinedAt: 'asc' as const },
    ];

    const formatMember = (member: any) => ({
      id: member.user.id,
      name: member.user.name || 'Unknown',
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      budgetAccess: member.budgetAccess,
      joinedAt: member.joinedAt.toISOString(),
      userCreatedAt: member.user.createdAt.toISOString(),
    });

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [members, total] = await Promise.all([
        prisma.organizationMember.findMany({
          where: whereClause,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.organizationMember.count({ where: whereClause }),
      ]);

      const formattedMembers = members.map(formatMember);
      return NextResponse.json(buildPaginatedResponse(formattedMembers, total, { page, limit, skip }));
    }

    // Legacy response (backward compatible)
    const members = await prisma.organizationMember.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: orderByClause,
    });

    const formattedMembers = members.map(formatMember);

    return NextResponse.json({
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error) {
    logger.error('Organization members error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organization-members
 * Update a member's role. Only OWNER/ADMIN can change roles.
 * Body: { userId, role }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;
    if (!context) return NextResponse.json({ error: 'No context' }, { status: 500 });

    const { organization, membership: callerMembership } = context;
    if (callerMembership.role !== 'OWNER' && callerMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only owners and admins can change roles' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'MEMBER', 'GUEST'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Role must be ADMIN, MEMBER, or GUEST' }, { status: 400 });
    }

    const target = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: organization.id, userId } },
    });

    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (target.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot change the role of an owner' }, { status: 403 });
    }

    await prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId: organization.id, userId } },
      data: { role: role as any },
    });

    return NextResponse.json({ message: 'Role updated', userId, role });
  } catch (error) {
    logger.error('Update member role error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

/**
 * DELETE /api/organization-members
 * Remove a member from the organization. Only OWNER/ADMIN can remove.
 * Query: ?userId=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;
    if (!context) return NextResponse.json({ error: 'No context' }, { status: 500 });

    const { organization, user, membership: callerMembership } = context;
    if (callerMembership.role !== 'OWNER' && callerMembership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 });
    }

    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 });
    }

    const target = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: organization.id, userId } },
    });

    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (target.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot remove an owner' }, { status: 403 });
    }

    await prisma.organizationMember.delete({
      where: { organizationId_userId: { organizationId: organization.id, userId } },
    });

    return NextResponse.json({ message: 'Member removed', userId });
  } catch (error) {
    logger.error('Remove member error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
