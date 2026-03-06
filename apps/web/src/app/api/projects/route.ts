import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getOrganizationContext } from '@/lib/api-organization';

/**
 * GET /api/projects
 * Returns all projects for the current user's organization
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

    // Get all projects for the organization
    const projects = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
          },
        },
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
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform projects with computed fields
    const projectsWithStats = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
      const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const todoTasks = project.tasks.filter(t => t.status === 'TODO').length;

      return {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        status: project.status,
        type: project.type || 'BUSINESS',
        color: project.color || '#3B82F6', // ✅ Use proper column
        icon: project.icon || '📁', // ✅ Use proper column
        lead: project.leadId ? project.members.find(m => m.userId === project.leadId)?.user : null,
        memberCount: project.members.length,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
        },
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        isFavorite: project.isFavorite, // ✅ Use proper column
      };
    });

    return NextResponse.json({
      projects: projectsWithStats,
    });
  } catch (error) {
    console.error('Projects list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Creates a new project
 */
export async function POST(request: NextRequest) {
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

    const { organization, user } = context;

    // Parse request body
    const body = await request.json();
    const { name, description, key, color, icon } = body;

    // Validate required fields
    if (!name || !key) {
      return NextResponse.json(
        { error: 'Name and key are required' },
        { status: 400 }
      );
    }

    // Check if project key already exists
    const existingProject = await prisma.project.findFirst({
      where: {
        organizationId: organization.id,
        key: key.toUpperCase(),
        deletedAt: null,
      },
    });

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project key already exists' },
        { status: 409 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        key: key.toUpperCase(),
        organizationId: organization.id,
        leadId: user.id,
        status: 'ACTIVE',
        color: color || '#3B82F6', // ✅ Use proper column
        icon: icon || '📁', // ✅ Use proper column
        settings: {}, // Keep for other settings
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
      },
    });

    // Add creator as project member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    return NextResponse.json({
      project: {
        ...project,
        taskStats: {
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
        },
        progress: 0,
        isFavorite: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
