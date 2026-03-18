import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserOrganization } from '@/lib/api-organization';

export const dynamic = 'force-dynamic';

// GET /api/teams - Get all teams for the current organization
export async function GET(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    // Fetch teams with member count and project count
    const teams = await prisma.team.findMany({
      where: {
        organizationId,
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
    const formattedTeams = teams.map((team: { id: string; name: string; description: string | null; icon: string | null; color: string | null; isDefault: boolean; isFavorite: boolean; _count: { members: number; projects: number }; createdAt: Date; updatedAt: Date }) => ({
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
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await req.json();
    const { name, description, icon, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const organizationId = ctx.organizationId;

    if (ctx.role !== 'ADMIN' && ctx.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only admins and owners can create teams' },
        { status: 403 }
      );
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        organizationId,
        name,
        description,
        icon: icon || '👥',
        color: color || '#3B82F6',
        createdBy: ctx.user.id,
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
        userId: ctx.user.id,
        role: 'LEAD',
        addedBy: ctx.user.id,
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
