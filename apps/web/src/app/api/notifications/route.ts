import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { effectivePatientAccess, careItemExclusion } from '@/lib/security/patient-access';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 *
 * Returns personalized notifications for the current user with read state.
 * Notifications are derived from UserActivity + TaskWatcher + assignment/reporter.
 * Read state is tracked in the Notification table (Phase 2).
 *
 * Query params:
 * - limit (default 50)
 * - unreadOnly (bool) — only return unread notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;
    const userId = ctx.user.id;
    const url = request.nextUrl;
    const limit = Math.min(100, parseInt(url.searchParams.get('limit') || '50'));
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Gather all task IDs the user cares about:
    //   1. Tasks they're watching
    //   2. Tasks assigned to them
    //   3. Tasks they reported
    const [watchedTasks, relatedTasks] = await Promise.all([
      prisma.taskWatcher.findMany({
        where: { userId },
        select: { taskId: true },
      }),
      prisma.task.findMany({
        where: {
          project: { organizationId },
          deletedAt: null,
          OR: [
            { assigneeId: userId },
            { reporterId: userId },
          ],
        },
        select: { id: true },
      }),
    ]);

    let relevantTaskIds = Array.from(
      new Set([
        ...watchedTasks.map((w: any) => w.taskId),
        ...relatedTasks.map((t: any) => t.id),
      ]),
    );

    // M2 — being the assignee, reporter or a watcher of a care item does not
    // confer patient access. Those are how you came to be involved in the
    // work; the patient ladder is a separate grant, and a member whose access
    // was revoked (or who never had it) must stop receiving notifications
    // about care work even on tasks they are still assigned to.
    //
    // Filtering the id list rather than the activities is what makes this
    // hold: every downstream query keys off relevantTaskIds.
    const patientLevel = effectivePatientAccess(ctx.patientAccess);
    if (relevantTaskIds.length > 0 && 'patientId' in careItemExclusion(patientLevel)) {
      const visible = await prisma.task.findMany({
        where: { id: { in: relevantTaskIds }, patientId: null },
        select: { id: true },
      });
      relevantTaskIds = visible.map((t: { id: string }) => t.id);
    }

    // Pull activities on relevant tasks.
    // Include self-actions so single-user orgs still see notifications (marked isSelf).
    const activities = relevantTaskIds.length > 0
      ? await prisma.userActivity.findMany({
          where: {
            organizationId,
            entityType: 'TASK',
            entityId: { in: relevantTaskIds },
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

    // Get read state for all these activities (graceful if table not yet migrated)
    const activityIds = activities.map((a: any) => a.id);
    let readMap = new Map<string, Date | null>();
    try {
      if (activityIds.length > 0) {
        const readStates = await prisma.notification.findMany({
          where: { userId, activityId: { in: activityIds } },
          select: { activityId: true, readAt: true },
        });
        readMap = new Map(readStates.map((r: any) => [r.activityId, r.readAt]));
      }
    } catch {
      // notifications table may not exist yet — treat all as unread
    }

    // Enrich with task details
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

    let notifications = activities.map((a: any) => ({
      id: a.id,
      action: a.action,
      activityType: a.activityType,
      entityType: a.entityType,
      entityId: a.entityId,
      aiSummary: a.aiSummary,
      impactScore: a.impactScore,
      createdAt: a.createdAt,
      readAt: readMap.get(a.id) || null,
      isSelf: a.userId === userId,
      user: a.user,
      task: tasksById.get(a.entityId) || null,
    }));

    // Filter to unread only if requested
    if (unreadOnly) {
      notifications = notifications.filter((n: any) => !n.readAt);
    }

    const unreadCount = notifications.filter((n: any) => !n.readAt).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('Notifications fetch error', { error: msg, stack });
    return NextResponse.json(
      { error: 'Failed to fetch notifications', detail: msg },
      { status: 500 }
    );
  }
}
