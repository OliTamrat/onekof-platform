import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationContext } from '@/lib/api-organization';

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

    // Get all members of the organization
    const { prisma } = await import('@onekof/database');
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
        { joinedAt: 'asc' },
      ],
    });

    // Format response
    const formattedMembers = members.map((member: any) => ({
      id: member.user.id,
      name: member.user.name || 'Unknown',
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      budgetAccess: member.budgetAccess,
      joinedAt: member.joinedAt.toISOString(),
      userCreatedAt: member.user.createdAt.toISOString(),
    }));

    return NextResponse.json({
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error) {
    console.error('Organization members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}
