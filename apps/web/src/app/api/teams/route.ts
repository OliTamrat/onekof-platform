import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/teams - Get all teams for the current organization
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { defaultOrganizationId: true },
    });

    if (!user?.defaultOrganizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: user.defaultOrganizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    // Fetch teams with member count and project count
    const teams = await prisma.team.findMany({
      where: {
        organizationId: user.defaultOrganizationId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: [
        { isFavorite: 'desc' },
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Format response
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      icon: team.icon,
      color: team.color,
      isDefault: team.isDefault,
      isFavorite: team.isFavorite,
      memberCount: team._count.members,
      projectCount: team._count.projects,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }));

    return NextResponse.json({ teams: formattedTeams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Get user's current organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { defaultOrganizationId: true },
    });

    if (!user?.defaultOrganizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: user.defaultOrganizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can create teams' },
        { status: 403 }
      );
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        organizationId: user.defaultOrganizationId,
        name,
        description,
        icon: icon || '👥',
        color: color || '#3B82F6',
        createdBy: session.user.id,
      },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    // Add creator as team lead
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        role: 'LEAD',
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        icon: team.icon,
        color: team.color,
        isDefault: team.isDefault,
        isFavorite: team.isFavorite,
        memberCount: team._count.members + 1, // +1 for the creator just added
        projectCount: team._count.projects,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
