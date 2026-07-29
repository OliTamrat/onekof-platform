import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations/[organizationId]/members
 * Returns all members of an organization.
 * Auth: supports both web session (NextAuth cookie) and mobile Bearer JWT.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    // resolveUserOrganization handles both web sessions + mobile Bearer JWT
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const { organizationId } = params;

    // resolveUserOrganization authorizes against the organization in the
    // x-organization-slug header (the subdomain the caller is on), not
    // against the id in the path. Without this comparison a member of one
    // organization could read another's member list — names, emails, roles
    // and budget access — just by putting a different id in the URL.
    if (organizationId !== ctx.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch all members of the organization
    const members = await prisma.organizationMember.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Transform to simpler format
    const formattedMembers = members.map((member) => ({
      id: member.user.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      budgetAccess: member.budgetAccess,
    }));

    return NextResponse.json({
      members: formattedMembers,
    });
  } catch (error) {
    logger.error('Failed to fetch organization members', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
