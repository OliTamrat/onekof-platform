import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  listActiveSessions,
  invalidateAllUserSessions,
  getActiveSessionCount,
} from '@/lib/security/session-manager';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/sessions
 * List all active sessions for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await listActiveSessions(session.user.id);
    const activeCount = await getActiveSessionCount(session.user.id);

    return NextResponse.json({
      sessions,
      activeCount,
    });
  } catch (error) {
    log.error('Error listing user sessions', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/sessions
 * Invalidate all sessions except the current one (logout all other devices)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await invalidateAllUserSessions(session.user.id, {
      reason: 'logout_all',
      metadata: {
        initiatedBy: 'user',
        email: session.user.email,
      },
    });

    return NextResponse.json({
      message: 'All other sessions have been terminated',
    });
  } catch (error) {
    log.error('Error invalidating user sessions', { error });
    return NextResponse.json(
      { error: 'Failed to terminate sessions' },
      { status: 500 }
    );
  }
}
