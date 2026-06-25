import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { hash } from 'bcryptjs';
import { hashToken, isTokenExpired } from '@/lib/security/tokens';
import { passwordSchema } from '@/lib/validation/schemas';
import { log, logSecurity } from '@/lib/logger';
import { invalidateAllUserSessions } from '@/lib/security/session-manager';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Use strict password schema (min 8 chars + uppercase + lowercase + digit)
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.errors[0]?.message || 'Password does not meet requirements' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Hash the provided token before database lookup
    const tokenHash = hashToken(token);

    // Find user by hashed reset token
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,  // Compare against hash, not plaintext
      },
    });

    if (!user) {
      log.warn('Invalid password reset token attempt');
      logSecurity('invalid_reset_token_attempt', 'medium', {
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(user.resetTokenExpiry)) {
      log.warn('Expired password reset token used', { userId: user.id });
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,  // Clear hashed token
        resetTokenExpiry: null,
        passwordChangedAt: new Date(),  // Track password change
      },
    });

    // SECURITY: Invalidate all existing sessions after password change
    // This forces the user to log in again on all devices
    await invalidateAllUserSessions(user.id, {
      reason: 'password_change',
      metadata: {
        email: user.email,
        resetMethod: 'password_reset_token',
      },
    });

    // Log successful password reset
    logSecurity('password_reset_completed', 'low', {
      userId: user.id,
      email: user.email,
    });

    log.info('Password reset successfully', { userId: user.id });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    log.error('Reset password error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
