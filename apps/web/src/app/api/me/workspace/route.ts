import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Items due within this window count as "due soon" in the recommended feed. */
const DUE_SOON_DAYS = 7;
const FEED_LIMIT = 15;

const TASK_CARD = {
  id: true,
  key: true,
  title: true,
  type: true,
  status: true,
  priority: true,
  dueDate: true,
  updatedAt: true,
  project: { select: { id: true, name: true, key: true, color: true } },
} as const;

/**
 * GET /api/me/workspace
 *
 * Everything the personal workspace shows, in one round trip: what needs
 * attention, what is assigned, what has been pinned, what was touched and what
 * was opened. Four tabs fetching separately would mean four spinners for a
 * page whose whole purpose is a single glance at your own work.
 */
export async function GET(_request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const userId = ctx.user.id;
    const projectAccess = buildProjectAccessFilter({
      organizationId: ctx.organizationId,
      userId,
      orgRole: ctx.role,
    });

    // Every task query is scoped through projectAccess. Someone's own
    // workspace is still not a way around project visibility — an item
    // assigned to you in a project you have since lost access to must not
    // reappear here.
    const visibleTask = { deletedAt: null, project: projectAccess };
    const OPEN = { notIn: ['DONE'] as string[] };

    const dueSoonCutoff = new Date();
    dueSoonCutoff.setDate(dueSoonCutoff.getDate() + DUE_SOON_DAYS);

    const [assigned, dueSoon, overdue, unreadNotifications, stars, activity, views] =
      await Promise.all([
        prisma.task.findMany({
          where: { ...visibleTask, assigneeId: userId, status: OPEN },
          select: TASK_CARD,
          orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { updatedAt: 'desc' }],
          take: FEED_LIMIT,
        }),

        prisma.task.findMany({
          where: {
            ...visibleTask,
            assigneeId: userId,
            status: OPEN,
            dueDate: { gte: new Date(), lte: dueSoonCutoff },
          },
          select: TASK_CARD,
          orderBy: { dueDate: 'asc' },
          take: FEED_LIMIT,
        }),

        prisma.task.findMany({
          where: {
            ...visibleTask,
            assigneeId: userId,
            status: OPEN,
            dueDate: { lt: new Date() },
          },
          select: TASK_CARD,
          orderBy: { dueDate: 'asc' },
          take: FEED_LIMIT,
        }),

        prisma.notification.findMany({
          where: { userId, readAt: null },
          orderBy: { createdAt: 'desc' },
          take: FEED_LIMIT,
        }),

        prisma.star.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),

        // Distinct entities this user changed recently. Over-fetched because
        // one task edited ten times is ten rows here but one card on screen.
        prisma.userActivity.findMany({
          where: { userId, organizationId: ctx.organizationId, entityType: 'TASK' },
          select: { entityId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 120,
        }),

        prisma.recentView.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' },
          take: 50,
        }),
      ]);

    // Resolve the polymorphic feeds. Both stars and views point at entities by
    // id with no foreign key, so an entity deleted since it was pinned or
    // opened simply will not come back — drop it rather than render a husk.
    const starTaskIds = stars.filter((s) => s.entityType === 'TASK').map((s) => s.entityId);
    const starProjectIds = stars.filter((s) => s.entityType === 'PROJECT').map((s) => s.entityId);
    const viewTaskIds = views.filter((v) => v.entityType === 'TASK').map((v) => v.entityId);

    const workedOnIds = [...new Set(activity.map((a) => a.entityId))].slice(0, FEED_LIMIT);

    const [starTasks, starProjects, viewTasks, workedTasks] = await Promise.all([
      starTaskIds.length
        ? prisma.task.findMany({ where: { ...visibleTask, id: { in: starTaskIds } }, select: TASK_CARD })
        : [],
      starProjectIds.length
        ? prisma.project.findMany({
            where: { ...projectAccess, deletedAt: null, id: { in: starProjectIds } },
            select: { id: true, name: true, key: true, color: true },
          })
        : [],
      viewTaskIds.length
        ? prisma.task.findMany({ where: { ...visibleTask, id: { in: viewTaskIds } }, select: TASK_CARD })
        : [],
      workedOnIds.length
        ? prisma.task.findMany({ where: { ...visibleTask, id: { in: workedOnIds } }, select: TASK_CARD })
        : [],
    ]);

    // Restore the orderings the id-based refetches above discarded.
    const byId = <T extends { id: string }>(rows: T[]) => new Map(rows.map((r) => [r.id, r]));
    const orderBy = <T extends { id: string }>(rows: T[], ids: string[]) => {
      const m = byId(rows);
      return ids.map((id) => m.get(id)).filter((x): x is T => x != null);
    };

    return NextResponse.json({
      recommended: {
        overdue,
        dueSoon,
        notifications: unreadNotifications,
      },
      assigned,
      starred: {
        tasks: orderBy(starTasks, starTaskIds),
        projects: orderBy(starProjects, starProjectIds),
      },
      workedOn: orderBy(workedTasks, workedOnIds),
      viewed: orderBy(viewTasks, viewTaskIds),
      counts: {
        assigned: assigned.length,
        overdue: overdue.length,
        dueSoon: dueSoon.length,
        notifications: unreadNotifications.length,
      },
    });
  } catch (err) {
    logger.error('Personal workspace error', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: 'Failed to load your workspace' }, { status: 500 });
  }
}
