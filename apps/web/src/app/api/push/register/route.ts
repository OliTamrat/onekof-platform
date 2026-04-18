import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveAuthUser } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/push/register
 * Register or update a push notification token for the current user.
 * Called on mobile app boot after permission is granted.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, platform, deviceName } = body;

    if (!token || !platform) {
      return NextResponse.json(
        { error: 'token and platform are required' },
        { status: 400 },
      );
    }

    // Upsert: if token exists, update lastUsedAt + un-revoke. If new, create.
    await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId: authUser.id,
        token,
        platform,
        deviceName: deviceName || null,
        lastUsedAt: new Date(),
      },
      update: {
        userId: authUser.id, // Token may have changed owner (reinstall)
        platform,
        deviceName: deviceName || null,
        lastUsedAt: new Date(),
        revokedAt: null, // Un-revoke if previously revoked
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Push token register error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}

/**
 * DELETE /api/push/register
 * Revoke push token on sign-out.
 */
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (token) {
      await prisma.pushToken.updateMany({
        where: { token, userId: authUser.id },
        data: { revokedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Push token revoke error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 });
  }
}
