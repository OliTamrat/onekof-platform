import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationContext } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
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
