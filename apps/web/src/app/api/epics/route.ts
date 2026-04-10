import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/epics
 *
 * Returns all EPIC-type tasks the user can see, with child count + progress
 * aggregated in a single efficient query.
 *
 * Query params:
 * - projectId (optional): filter to a specific project
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;
    const url = request.nextUrl;
    const projectIdParam = url.searchParams.get('projectId');

    // Security: scope to projects the user can see
    const projectAccessFilter = buildProjectAccessFilter({
      organizationId,
      userId: ctx.user.id,
      orgRole: ctx.role,
    });

    const where: any = {
      type: 'EPIC',
      deletedAt: null,
      project: projectAccessFilter,
    };
    if (projectIdParam) {
      where.projectId = projectIdParam;
    }

    // Fetch all epics
    const epics = await prisma.task.findMany({
      where,
      select: {
        id: true,
        key: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        project: {
          select: { id: true, name: true, key: true, color: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });

    if (epics.length === 0) {
      return NextResponse.json({ epics: [] });
    }

    // Aggregate child task stats across all epics in one query
    const epicIds = epics.map((e) => e.id);
    const childStats = await prisma.task.groupBy({
      by: ['parentId', 'status'],
      where: {
        parentId: { in: epicIds },
        deletedAt: null,
      },
      _count: { _all: true },
    });

    // Build a map: epicId -> { total, done }
    const statsByEpic = new Map<string, { total: number; done: number }>();
    for (const row of childStats as any[]) {
      const prev = statsByEpic.get(row.parentId) || { total: 0, done: 0 };
      prev.total += row._count._all;
      if (row.status === 'DONE') prev.done += row._count._all;
      statsByEpic.set(row.parentId, prev);
    }

    const enriched = epics.map((epic) => {
      const stats = statsByEpic.get(epic.id) || { total: 0, done: 0 };
      const progress = stats.total > 0
        ? Math.round((stats.done / stats.total) * 100)
        : 0;
      return {
        ...epic,
        childCount: stats.total,
        childDoneCount: stats.done,
        progress,
      };
    });

    return NextResponse.json({ epics: enriched });
  } catch (error) {
    logger.error('Epics list error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch epics' },
      { status: 500 }
    );
  }
}
