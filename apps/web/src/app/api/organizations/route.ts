import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import { checkRateLimit } from '@/lib/security/rate-limit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = req.nextUrl;
    const hasPagination = url.searchParams.has('page');

    // Fetch user with default organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { defaultOrganizationId: true },
    });

    const includeClause = {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      },
    };

    const orderByClause = {
      organization: {
        createdAt: 'desc' as const,
      },
    };

    const formatMembership = (m: any) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logo: (m.organization as any).logo,
      description: (m.organization as any).description,
      type: m.organization.type || null,
      plan: m.organization.plan || 'FREE',
      status: m.organization.status || 'ACTIVE',
      maxMembers: m.organization.maxMembers ?? 5,
      maxProjects: m.organization.maxProjects ?? 3,
      maxStorage: m.organization.maxStorage ?? 1,
      trialEndsAt: m.organization.trialEndsAt?.toISOString() || null,
      createdAt: m.organization.createdAt.toISOString(),
      memberCount: m.organization._count.members,
      projectCount: m.organization._count.projects,
      role: m.role,
    });

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(req);

      const whereClause = { userId: session.user.id };

      const [memberships, total] = await Promise.all([
        prisma.organizationMember.findMany({
          where: whereClause,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.organizationMember.count({ where: whereClause }),
      ]);

      const organizations = memberships.map(formatMembership);

      const defaultOrganization = user?.defaultOrganizationId
        ? organizations.find(org => org.id === user.defaultOrganizationId)
        : null;

      const response = buildPaginatedResponse(organizations, total, { page, limit, skip });
      return NextResponse.json({
        ...response,
        defaultOrganization: defaultOrganization || organizations[0] || null,
      });
    }

    // Legacy response (backward compatible)
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: includeClause,
      orderBy: orderByClause,
    });

    const organizations = memberships.map(formatMembership);

    // Find default organization
    const defaultOrganization = user?.defaultOrganizationId
      ? organizations.find(org => org.id === user.defaultOrganizationId)
      : null;

    return NextResponse.json({
      organizations,
      defaultOrganization: defaultOrganization || organizations[0] || null,
    });
  } catch (error) {
    logger.error('Error fetching organizations', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit org creation to prevent spam/DoS
    const rateLimitError = await checkRateLimit(req, 'signup');
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      slug,
      description,
      // Categorization data from onboarding
      type,
      department,
      industry,
      teamSize,
      primaryUseCases,
      language,
      calendarPreference,
    } = await req.json();

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'This slug is already taken' },
        { status: 400 }
      );
    }

    // Generate unique schema name for multi-tenant architecture
      const schemaName = `onekof_org_${slug.replace(/-/g, '_')}`;

      // Create organization in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization with categorization data
        const isGovernment = type === 'government';
        const organization = await tx.organization.create({
          data: {
            name,
            slug,
            schemaName,
            // Categorization data from onboarding
            type: type || null,
            department: department || null,
            industry: industry || null,
            teamSize: teamSize || null,
            primaryUseCases: primaryUseCases || [],
            language: language || 'english',
            calendarPreference: calendarPreference || 'gregorian',
            // Trial: 7 days for non-government orgs; government orgs start ACTIVE
            status: isGovernment ? 'ACTIVE' : 'TRIAL',
            trialEndsAt: isGovernment ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

      // Add creator as organization member with OWNER role
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: session.user.id,
          role: 'OWNER',
        },
      });

      return organization;
    });

    return NextResponse.json(
      {
        organization: {
          id: result.id,
          name: result.name,
          slug: result.slug,
          type: result.type || null,
          description: (result as any).description,
          createdAt: result.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Error creating organization', { error: error instanceof Error ? error.message : error });

    // Surface Prisma-specific errors for debugging
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An organization with this slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create organization. Please try again.' },
      { status: 500 }
    );
  }
}
