import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/teams/[id] - Get a specific team with members
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        members: {
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
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify user has access to this team's organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        icon: team.icon,
        color: team.color,
        isDefault: team.isDefault,
        isFavorite: team.isFavorite,
        memberCount: team.members.length,
        projectCount: team._count.projects,
        members: team.members.map((m: { id: string; userId: string; user: { name: string | null; email: string; avatar: string | null }; role: string; joinedAt: Date }) => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon, color, isFavorite } = body;

    // Get team to verify access
    const team = await prisma.team.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Verify user is an admin/owner or team lead
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: session.user.id,
        },
      },
    });

    const teamMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: params.id,
          userId: session.user.id,
        },
      },
    });

    const isOrgAdmin = membership && (membership.role === 'ADMIN' || membership.role === 'OWNER');
    const isTeamLead = teamMembership && teamMembership.role === 'LEAD';

    if (!isOrgAdmin && !isTeamLead) {
      return NextResponse.json(
        { error: 'Only team leads and organization admins can update teams' },
        { status: 403 }
      );
    }

    // Update team
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(isFavorite !== undefined && { isFavorite }),
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

    return NextResponse.json({
      team: {
        id: updatedTeam.id,
        name: updatedTeam.name,
        description: updatedTeam.description,
        icon: updatedTeam.icon,
        color: updatedTeam.color,
        isDefault: updatedTeam.isDefault,
        isFavorite: updatedTeam.isFavorite,
        memberCount: updatedTeam._count.members,
        projectCount: updatedTeam._count.projects,
        createdAt: updatedTeam.createdAt.toISOString(),
        updatedAt: updatedTeam.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team to verify access
    const team = await prisma.team.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Prevent deletion of default team
    if (team.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete the default team' },
        { status: 400 }
      );
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: team.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can delete teams' },
        { status: 403 }
      );
    }

    // Soft delete team
    await prisma.team.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
