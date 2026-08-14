import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { checkRateLimit } from '@/lib/security/rate-limit';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const StarSchema = z.object({
  entityType: z.enum(['TASK', 'PROJECT', 'GOAL', 'DOCUMENT']),
  entityId: z.string().min(1),
});

/**
 * POST /api/me/stars — toggle a star for the signed-in user.
 *
 * Toggle rather than separate add and remove routes: the client holds one
 * boolean and a single endpoint keeps it from drifting out of step with the
 * server if a request is retried. The unique constraint on
 * (userId, entityType, entityId) makes the write idempotent either way.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit(request, 'dataMutation');
    if (rateLimited) return rateLimited;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const parsed = StarSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { entityType, entityId } = parsed.data;

    const where = {
      userId_entityType_entityId: { userId: ctx.user.id, entityType, entityId },
    };
    const existing = await prisma.star.findUnique({ where });

    if (existing) {
      await prisma.star.delete({ where });
      return NextResponse.json({ starred: false });
    }

    await prisma.star.create({
      data: { userId: ctx.user.id, entityType, entityId },
    });
    return NextResponse.json({ starred: true });
  } catch (err) {
    logger.error('Star toggle error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to update star' }, { status: 500 });
  }
}
