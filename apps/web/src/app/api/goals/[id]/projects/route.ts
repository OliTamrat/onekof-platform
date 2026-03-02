import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/goals/[id]/projects - Get all projects linked to a goal
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;

    // Verify goal exists and user has access
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { organizationId: true },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all projects linked to this goal
    const goalProjects = await prisma.goalProject.findMany({
      where: {
        goalId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            icon: true,
            color: true,
            status: true,
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    const projects = goalProjects.map((gp) => ({
      ...gp.project,
      contributionWeight: gp.contributionWeight,
      addedAt: gp.addedAt.toISOString(),
      linkId: gp.id,
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching goal projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal projects' },
      { status: 500 }
    );
  }
}

// POST /api/goals/[id]/projects - Link a project to a goal
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const body = await req.json();
    const { projectId, contributionWeight = 100 } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify goal exists and get organization
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { organizationId: true },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can link projects to goals' },
        { status: 403 }
      );
    }

    // Verify project exists and belongs to same organization
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true, name: true, key: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.organizationId !== goal.organizationId) {
      return NextResponse.json(
        { error: 'Project must belong to the same organization' },
        { status: 400 }
      );
    }

    // Check if already linked
    const existingLink = await prisma.goalProject.findUnique({
      where: {
        goalId_projectId: {
          goalId,
          projectId,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Project is already linked to this goal' },
        { status: 400 }
      );
    }

    // Create the link
    const goalProject = await prisma.goalProject.create({
      data: {
        goalId,
        projectId,
        contributionWeight,
        addedBy: session.user.id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            icon: true,
            color: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      project: {
        ...goalProject.project,
        contributionWeight: goalProject.contributionWeight,
        addedAt: goalProject.addedAt.toISOString(),
        linkId: goalProject.id,
      },
    });
  } catch (error) {
    console.error('Error linking project to goal:', error);
    return NextResponse.json(
      { error: 'Failed to link project to goal' },
      { status: 500 }
    );
  }
}
