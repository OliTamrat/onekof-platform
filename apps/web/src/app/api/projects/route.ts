import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getOrganizationContext, buildProjectAccessFilter } from '@/lib/api-organization';
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

    const { organization, user, membership } = context;

    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');

    // SECURITY: scope projects to what this user is allowed to see based on
    // their org role and project membership (see buildProjectAccessFilter doc)
    const whereClause = buildProjectAccessFilter({
      organizationId: organization.id,
      userId: user.id,
      orgRole: membership.role,
    });

    // Only fetch the lead member (not all members) + use _count for member count.
    // Task stats are computed separately via groupBy (see below) to avoid loading
    // every task object just to count them.
    const includeClause = {
      _count: {
        select: { members: true },
      },
    };

    const orderByClause = {
      updatedAt: 'desc' as const,
    };

    // Fetch projects (paginated or full list)
    let projects: any[];
    let total: number | null = null;
    let paginationParams: { page: number; limit: number; skip: number } | null = null;

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);
      paginationParams = { page, limit, skip };
      const [projectRows, totalCount] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.project.count({ where: whereClause }),
      ]);
      projects = projectRows;
      total = totalCount;
    } else {
      projects = await prisma.project.findMany({
        where: whereClause,
        include: includeClause,
        orderBy: orderByClause,
      });
    }

    const projectIds = projects.map((p) => p.id);
    const leadIds = Array.from(new Set(projects.map((p) => p.leadId).filter(Boolean))) as string[];

    // Parallel fetch: task status groupBy + lead users
    // Single DB call per aggregation regardless of project count
    const [taskGroups, leadUsers] = await Promise.all([
      projectIds.length > 0
        ? prisma.task.groupBy({
            by: ['projectId', 'status'],
            where: {
              projectId: { in: projectIds },
              deletedAt: null,
            },
            _count: { _all: true },
          })
        : Promise.resolve([] as any[]),
      leadIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: leadIds } },
            select: { id: true, name: true, email: true, avatar: true },
          })
        : Promise.resolve([] as any[]),
    ]);

    // Build a projectId -> stats map
    const statsByProject = new Map<string, { total: number; completed: number; inProgress: number; todo: number }>();
    for (const g of taskGroups as any[]) {
      const stats = statsByProject.get(g.projectId) || { total: 0, completed: 0, inProgress: 0, todo: 0 };
      const count = g._count._all;
      stats.total += count;
      if (g.status === 'DONE') stats.completed += count;
      else if (g.status === 'IN_PROGRESS') stats.inProgress += count;
      else if (g.status === 'TODO') stats.todo += count;
      statsByProject.set(g.projectId, stats);
    }
    const leadsById = new Map(leadUsers.map((u: any) => [u.id, u]));

    const transformProject = (project: any) => {
      const taskStats = statsByProject.get(project.id) || { total: 0, completed: 0, inProgress: 0, todo: 0 };
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
        lead: project.leadId ? leadsById.get(project.leadId) || null : null,
        defaultAssignee: project.defaultAssignee,
        priority: project.priority,
        template: project.template,
        startDate: project.startDate,
        dueDate: project.dueDate,
        settings: project.settings,
        memberCount: project._count?.members ?? 0,
        taskStats,
        progress: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        isFavorite: project.isFavorite,
      };
    };

    const projectsWithStats = projects.map(transformProject);

    if (paginationParams && total !== null) {
      return NextResponse.json(buildPaginatedResponse(projectsWithStats, total, paginationParams));
    }

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
      startDate, dueDate, teamIds, memberIds,
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

    // Add individual members to project if provided
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: memberIds
          .filter((m: { userId: string }) => m.userId !== user.id) // skip creator (already added)
          .map((m: { userId: string; role?: string }) => ({
            projectId: project.id,
            userId: m.userId,
            role: (m.role || 'MEMBER') as any,
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
