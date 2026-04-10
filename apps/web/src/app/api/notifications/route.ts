import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 *
 * Returns personalized notifications for the current user. These are
 * derived from UserActivity + TaskWatcher (tasks the user is watching
 * and other users took action on).
 *
 * Notification sources:
 * 1. Activities on tasks the user watches (excluding self-actions)
 * 2. Activities where the user was the target (mentioned, assigned, etc.)
 * 3. Activities on the user's organization that touched them directly
 *
 * Query params:
 * - limit (default 50)
 * - unreadOnly (bool)
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;
    const userId = ctx.user.id;
    const url = request.nextUrl;
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));

    // Fetch task IDs the user is watching — these are the tasks the user
    // wants to be notified about.
    const watchedTasks = await prisma.taskWatcher.findMany({
      where: { userId },
      select: { taskId: true },
    });
    const watchedTaskIds = watchedTasks.map((w: any) => w.taskId);

    // Pull activities where:
    // - The activity is on a task the user watches, AND
    // - The activity was NOT performed by the user themselves
    const activities = watchedTaskIds.length > 0
      ? await prisma.userActivity.findMany({
          where: {
            organizationId,
            entityType: 'TASK',
            entityId: { in: watchedTaskIds },
            userId: { not: userId }, // exclude self-actions
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        })
      : [];

    // Enrich with task details (key, title, project) so the frontend can
    // render clickable cards with proper context.
    const taskIds = Array.from(new Set(activities.map((a: any) => a.entityId)));
    const tasks = taskIds.length > 0
      ? await prisma.task.findMany({
          where: { id: { in: taskIds } },
          select: {
            id: true,
            key: true,
            title: true,
            project: { select: { id: true, key: true, name: true, color: true } },
          },
        })
      : [];
    const tasksById = new Map(tasks.map((t: any) => [t.id, t]));

    const notifications = activities.map((a: any) => ({
      id: a.id,
      action: a.action,
      activityType: a.activityType,
      entityType: a.entityType,
      entityId: a.entityId,
      aiSummary: a.aiSummary,
      impactScore: a.impactScore,
      createdAt: a.createdAt,
      user: a.user,
      task: tasksById.get(a.entityId) || null,
    }));

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length, // all are considered unread for now
    });
  } catch (error) {
    logger.error('Notifications fetch error', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
