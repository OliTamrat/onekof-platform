import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/activities
 * Returns activity timeline for organization or user
 *
 * Query params:
 * - userId: Filter by specific user
 * - entityType: Filter by entity type (TASK, PROJECT, GOAL, etc.)
 * - action: Filter by action (COMMENTED, CREATED, UPDATED, etc.)
 * - entityId: Filter by specific entity
 * - limit: Number of activities to return (default: 50)
 * - offset: Pagination offset (default: 0)
 * - page: Page number for page-based pagination (when present, uses standardized pagination)
 *
 * Special entityType values:
 * - COMMENT: Returns activities where action = COMMENTED (stored as entityType=TASK)
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    const url = request.nextUrl;
    const userIdFilter = url.searchParams.get('userId');
    const entityType = url.searchParams.get('entityType');
    const action = url.searchParams.get('action');
    const entityId = url.searchParams.get('entityId');
    const projectIdFilter = url.searchParams.get('projectId');
    const hasPagination = url.searchParams.has('page');

    const where: any = {
      organizationId,
    };

    if (userIdFilter) {
      where.userId = userIdFilter;
    }

    // Project-scoped filtering: find task IDs belonging to the project
    if (projectIdFilter) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId: projectIdFilter, deletedAt: null },
        select: { id: true },
      });
      const taskIds = projectTasks.map((t: { id: string }) => t.id);
      // Include activities for tasks in this project OR for the project itself
      where.OR = [
        { entityType: 'TASK', entityId: { in: taskIds } },
        { entityType: 'PROJECT', entityId: projectIdFilter },
      ];
    }

    // Smart entity type filtering:
    // "COMMENT" is stored as entityType=TASK with action=COMMENTED
    if (entityType === 'COMMENT') {
      where.action = 'COMMENTED';
    } else if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.action = action;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    const includeClause = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    };

    const orderByClause = { createdAt: 'desc' as const };

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [activities, total] = await Promise.all([
        prisma.userActivity.findMany({
          where,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.userActivity.count({ where }),
      ]);

      return NextResponse.json(buildPaginatedResponse(activities, total, { page, limit, skip }));
    }

    // Legacy offset-based pagination (backward compatible)
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const [activities, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        include: includeClause,
        orderBy: orderByClause,
        take: limit,
        skip: offset,
      }),
      prisma.userActivity.count({ where }),
    ]);

    // Enrich TASK activities with task key + title for display.
    // Skip entirely if there are no TASK-type activities (avoids round-trip).
    const taskIds = Array.from(
      new Set(
        activities
          .filter((a: any) => a.entityType === 'TASK')
          .map((a: any) => a.entityId)
      )
    );

    let taskMap = new Map<string, any>();
    if (taskIds.length > 0) {
      // Single flat query with scalar projectId — no nested project join.
      const tasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: {
          id: true,
          key: true,
          title: true,
          projectId: true,
        },
      });

      // Fetch distinct project details in parallel (fewer rows than tasks)
      const projectIds = Array.from(new Set(tasks.map((t: any) => t.projectId).filter(Boolean)));
      const projects = projectIds.length > 0
        ? await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, key: true, name: true, color: true },
          })
        : [];
      const projectsById = new Map(projects.map((p: any) => [p.id, p]));

      taskMap = new Map(
        tasks.map((t: any) => [
          t.id,
          {
            id: t.id,
            key: t.key,
            title: t.title,
            project: t.projectId ? projectsById.get(t.projectId) || null : null,
          },
        ])
      );
    }

    const enrichedActivities = activities.map((a: any) => ({
      ...a,
      entity: a.entityType === 'TASK' ? taskMap.get(a.entityId) || null : null,
    }));

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + activities.length < totalCount,
      },
    });
  } catch (error) {
    logger.error('Activities fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
