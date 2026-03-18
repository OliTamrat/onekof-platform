import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';

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
 *
 * Special entityType values:
 * - COMMENT: Returns activities where action = COMMENTED (stored as entityType=TASK)
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    const { searchParams } = new URL(request.url);
    const userIdFilter = searchParams.get('userId');
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    const [activities, totalCount] = await Promise.all([
      prisma.userActivity.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
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
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
