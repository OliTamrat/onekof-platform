import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ViewSchema = z.object({
  entityType: z.enum(['TASK', 'PROJECT', 'GOAL', 'DOCUMENT']),
  entityId: z.string().min(1),
});

/**
 * POST /api/me/views — record that the signed-in user opened something.
 *
 * Upsert, so one row per user and entity holds the last time it was opened
 * rather than a row per glance. Deliberately not rate limited alongside real
 * mutations: this fires on navigation, and throttling it would silently lose
 * views for anyone moving quickly through their work — the exact person the
 * Viewed feed is for.
 *
 * Failures are swallowed by the caller. Nobody should see an error because a
 * convenience feed missed an entry.
 */
export async function POST(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const parsed = ViewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { entityType, entityId } = parsed.data;

    await prisma.recentView.upsert({
      where: {
        userId_entityType_entityId: { userId: ctx.user.id, entityType, entityId },
      },
      update: { viewedAt: new Date() },
      create: { userId: ctx.user.id, entityType, entityId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Record view error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
