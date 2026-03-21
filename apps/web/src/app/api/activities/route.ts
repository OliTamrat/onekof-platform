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
    const hasPagination = url.searchParams.has('page');

    const where: any = {
      organizationId,
    };

    if (userIdFilter) {
      where.userId = userIdFilter;
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

    return NextResponse.json({
      activities,
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
