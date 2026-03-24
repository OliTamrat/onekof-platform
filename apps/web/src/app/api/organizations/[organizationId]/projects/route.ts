import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId } = params;

    // Verify user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Fetch projects
    const projects = await prisma.project.findMany({
      where: {
        organizationId,
        isArchived: false, // Only show active projects by default
      },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: [
        { isFavorite: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        key: p.key,
        description: p.description,
        icon: p.icon,
        color: p.color,
        template: p.template,
        type: p.type,
        priority: p.priority,
        leadId: p.leadId,
        defaultAssignee: p.defaultAssignee,
        startDate: p.startDate?.toISOString() || null,
        dueDate: p.dueDate?.toISOString() || null,
        settings: p.settings,
        isArchived: p.isArchived,
        isFavorite: p.isFavorite,
        organizationId: p.organizationId,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        taskCount: p._count.tasks,
        memberCount: p._count.members,
      })),
    });
  } catch (error) {
    logger.error('Error fetching projects', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { organizationId } = params;

    // Verify user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Only ADMIN and OWNER can create projects
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to create projects' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name, key, description, icon, color, template,
      projectType, priority, leadId, defaultAssignee,
      startDate, dueDate, teamIds,
    } = body;

    // Validation
    if (!name || !key) {
      return NextResponse.json(
        { error: 'Name and key are required' },
        { status: 400 }
      );
    }

    // Validate key format (uppercase letters and numbers only)
    if (!/^[A-Z0-9]+$/.test(key)) {
      return NextResponse.json(
        { error: 'Key must contain only uppercase letters and numbers' },
        { status: 400 }
      );
    }

    // Check if key is already used in this organization
    const existingProject = await prisma.project.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key,
        },
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'This project key is already used in this organization' },
        { status: 400 }
      );
    }

    // Create project with all fields
    const project = await prisma.project.create({
      data: {
        organizationId,
        name,
        key,
        description,
        icon,
        color,
        template: template || 'KANBAN',
        type: projectType || 'BUSINESS',
        priority: priority || 'MEDIUM',
        leadId: leadId || null,
        defaultAssignee: defaultAssignee || null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdBy: session.user.id,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    // Add creator as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        role: 'ADMIN',
        addedBy: session.user.id,
      },
    });

    // Link teams to project if provided
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      await prisma.projectTeam.createMany({
        data: teamIds.map((teamId: string) => ({
          projectId: project.id,
          teamId,
          addedBy: session.user.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      {
        project: {
          id: project.id,
          name: project.name,
          key: project.key,
          description: project.description,
          icon: project.icon,
          color: project.color,
          template: project.template,
          type: project.type,
          priority: project.priority,
          leadId: project.leadId,
          defaultAssignee: project.defaultAssignee,
          startDate: project.startDate?.toISOString() || null,
          dueDate: project.dueDate?.toISOString() || null,
          settings: project.settings,
          isArchived: project.isArchived,
          isFavorite: project.isFavorite,
          organizationId: project.organizationId,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          taskCount: project._count.tasks,
          memberCount: project._count.members,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error creating project', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
