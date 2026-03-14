import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revokeSession } from '@/lib/security/session-manager';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/user/sessions/[id]
 * Revoke a specific session
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.id;

    const success = await revokeSession(sessionId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to revoke session' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Session revoked successfully',
    });
  } catch (error) {
    log.error('Error revoking session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
