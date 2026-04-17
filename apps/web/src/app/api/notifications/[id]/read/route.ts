import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/notifications/[id]/read
 * Mark a single notification as read for the current user.
 * The [id] is the activity ID (not the notification row ID).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const activityId = params.id;
    const userId = ctx.user.id;
    const organizationId = ctx.organizationId;

    // Upsert: create notification row if it doesn't exist, then set readAt
    await prisma.notification.upsert({
      where: {
        userId_activityId: { userId, activityId },
      },
      create: {
        userId,
        organizationId,
        activityId,
        readAt: new Date(),
      },
      update: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Mark notification read error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
