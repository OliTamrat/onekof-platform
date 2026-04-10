import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { compare, hash } from 'bcryptjs';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import { logSecurity } from '@/lib/logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/change-password
 *
 * Changes the authenticated user's password. Requires the current password
 * for verification. Updates passwordChangedAt for session invalidation
 * tracking.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Cannot change password — account has no password set (OAuth login)' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      logSecurity('password_change_failed', 'medium', {
        userId: user.id,
        email: user.email,
      });
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 403 }
      );
    }

    // Don't allow same password
    const isSameAsOld = await compare(newPassword, user.password);
    if (isSameAsOld) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    // Hash and update
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    logSecurity('password_changed', 'low', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Password change error', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
