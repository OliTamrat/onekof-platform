import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getOrganizationContext } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

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

    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');

    const whereClause = {
      organizationId: organization.id,
      deletedAt: null,
    };

    const includeClause = {
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
    };

    const orderByClause = {
      updatedAt: 'desc' as const,
    };

    const transformProject = (project: any) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
      const inProgressTasks = project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
      const todoTasks = project.tasks.filter((t: any) => t.status === 'TODO').length;

      return {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        status: project.status,
        type: project.type || 'BUSINESS',
        color: project.color || '#3B82F6',
        icon: project.icon || '📁',
        leadId: project.leadId,
        lead: project.leadId ? project.members.find((m: any) => m.userId === project.leadId)?.user : null,
        defaultAssignee: project.defaultAssignee,
        priority: project.priority,
        template: project.template,
        startDate: project.startDate,
        dueDate: project.dueDate,
        settings: project.settings,
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
        isFavorite: project.isFavorite,
      };
    };

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.project.count({ where: whereClause }),
      ]);

      const projectsWithStats = projects.map(transformProject);
      return NextResponse.json(buildPaginatedResponse(projectsWithStats, total, { page, limit, skip }));
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: orderByClause,
    });

    const projectsWithStats = projects.map(transformProject);

    return NextResponse.json({
      projects: projectsWithStats,
    });
  } catch (error) {
    logger.error('Projects list error', { error: error instanceof Error ? error.message : error });
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
    const {
      name, description, key, color, icon,
      template, projectType, priority, leadId, ownerId, defaultAssignee,
      startDate, dueDate, teamIds,
      // Enterprise fields
      department, category, entityType, visibility, riskLevel,
      budgetCode, tags,
    } = body;

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
        ownerId: ownerId || null,
        leadId: leadId || user.id,
        defaultAssignee: defaultAssignee || null,
        status: 'ACTIVE',
        type: projectType || 'BUSINESS',
        priority: priority || 'MEDIUM',
        template: template || 'KANBAN',
        color: color || '#3B82F6',
        icon: icon || '📁',
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        // Enterprise fields
        department: department || null,
        category: category || null,
        entityType: entityType || 'INTERNAL',
        visibility: visibility || 'INTERNAL',
        riskLevel: riskLevel || 'NOT_ASSESSED',
        budgetCode: budgetCode || null,
        tags: Array.isArray(tags) ? tags : [],
        createdBy: user.id,
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
        addedBy: user.id,
      },
    });

    // Link teams to project if provided
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      await prisma.projectTeam.createMany({
        data: teamIds.map((teamId: string) => ({
          projectId: project.id,
          teamId,
          addedBy: user.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      project: {
        ...project,
        type: project.type,
        priority: project.priority,
        startDate: project.startDate?.toISOString() || null,
        dueDate: project.dueDate?.toISOString() || null,
        settings: project.settings,
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
    logger.error('Project creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
