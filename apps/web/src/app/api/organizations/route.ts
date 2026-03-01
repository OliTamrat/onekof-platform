import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user with default organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { defaultOrganizationId: true },
    });

    // Fetch all organizations where user is a member
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: {
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
      },
      orderBy: {
        organization: {
          createdAt: 'desc',
        },
      },
    });

    const organizations = memberships.map(m => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      logo: m.organization.logo,
      description: m.organization.description,
      ownerId: m.organization.ownerId,
      createdAt: m.organization.createdAt.toISOString(),
      memberCount: m.organization._count.members,
      projectCount: m.organization._count.projects,
      role: m.role,
    }));

    // Find default organization
    const defaultOrganization = user?.defaultOrganizationId
      ? organizations.find(org => org.id === user.defaultOrganizationId)
      : null;

    return NextResponse.json({
      organizations,
      defaultOrganization: defaultOrganization || organizations[0] || null,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, slug, description } = await req.json();

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

    // Create organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
          description,
          ownerId: session.user.id,
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
          description: result.description,
          ownerId: result.ownerId,
          createdAt: result.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
