import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { generateTokenPair, generateTokenExpiry } from '@/lib/security/tokens';
import { log, logSecurity } from '@/lib/logger';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateRequestBody } from '@/lib/validation/validate';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit password reset requests to prevent abuse
    const rateLimitError = await checkRateLimit(req, 'passwordReset');
    if (rateLimitError) return rateLimitError;

    // SECURITY: Validate input with Zod schema
    const validation = await validateRequestBody(req, forgotPasswordSchema);
    if ('error' in validation) return validation.error;

    const { email } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (!user) {
      // Return success anyway to prevent leaking user existence
      log.warn('Password reset attempted for non-existent email', { email });
      return NextResponse.json(
        { message: 'If an account exists with that email, password reset instructions have been sent' },
        { status: 200 }
      );
    }

    // SECURITY FIX: Generate secure token and hash it before storage
    const { token, hash } = generateTokenPair();
    const resetTokenExpiry = generateTokenExpiry(1); // 1 hour expiry

    // Store ONLY the hash in database, never the plaintext token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hash,  // Store hash, not plaintext
        resetTokenExpiry,
      },
    });

    // Log security event
    logSecurity('password_reset_requested', 'low', {
      userId: user.id,
      email: user.email,
    });

    // Send password reset email with secure reset link
    // The reset URL contains the plaintext token (sent via email only)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // Send email with reset link
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      log.info('Password reset email sent successfully', {
        userId: user.id,
        expiresAt: resetTokenExpiry.toISOString(),
      });
    } catch (emailError) {
      // Log email error but don't expose to user (prevents email enumeration)
      log.error('Failed to send password reset email', {
        error: emailError,
        userId: user.id,
      });
      // Continue anyway - don't reveal email sending failure
    }

    // SECURITY FIX: Never return token or resetUrl in API response
    return NextResponse.json(
      {
        message: 'If an account exists with that email, password reset instructions have been sent',
      },
      { status: 200 }
    );
  } catch (error) {
    log.error('Forgot password error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
