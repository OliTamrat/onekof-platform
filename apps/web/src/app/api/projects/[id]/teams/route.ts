import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/teams - Get all teams assigned to a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get project teams
    const projectTeams = await prisma.projectTeam.findMany({
      where: {
        projectId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    const teams = projectTeams.map((pt: { team: { id: string; name: string; description: string | null; icon: string | null; color: string | null; _count: { members: number } }; addedAt: Date; id: string }) => ({
      ...pt.team,
      memberCount: pt.team._count.members,
      addedAt: pt.addedAt.toISOString(),
      linkId: pt.id,
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching project teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project teams' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/teams - Assign a team to a project
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await req.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and get organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify user is an org admin
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can assign teams to projects' },
        { status: 403 }
      );
    }

    // Verify team exists and belongs to same organization
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        organizationId: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.organizationId !== project.organizationId) {
      return NextResponse.json(
        { error: 'Team must belong to the same organization' },
        { status: 400 }
      );
    }

    // Check if already assigned
    const existingLink = await prisma.projectTeam.findUnique({
      where: {
        projectId_teamId: {
          projectId,
          teamId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Team is already assigned to this project' },
        { status: 400 }
      );
    }

    // Create the link
    const projectTeam = await prisma.projectTeam.create({
      data: {
        projectId,
        teamId,
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({
      team: {
        ...team,
        memberCount: team._count.members,
        addedAt: projectTeam.addedAt.toISOString(),
        linkId: projectTeam.id,
      },
    });
  } catch (error) {
    console.error('Error assigning team to project:', error);
    return NextResponse.json(
      { error: 'Failed to assign team to project' },
      { status: 500 }
    );
  }
}
