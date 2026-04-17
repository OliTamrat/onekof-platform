import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/read-all
 * Mark all unread notifications as read for the current user.
 */
export async function POST() {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const userId = ctx.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (err) {
    logger.error('Mark all notifications read error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}
