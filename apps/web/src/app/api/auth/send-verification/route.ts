import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { generateTokenPair, generateTokenExpiry } from '@/lib/security/tokens';
import { log, logSecurity } from '@/lib/logger';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit email verification requests to prevent spam
    const rateLimitError = await checkRateLimit(req, 'emailVerification');
    if (rateLimitError) return rateLimitError;

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json(
        { message: 'If an account exists with that email, verification instructions have been sent' },
        { status: 200 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // SECURITY FIX: Generate secure token and hash it before storage
    const { token, hash } = generateTokenPair();
    const expires = generateTokenExpiry(24); // 24 hours

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Store ONLY the hash in database, never the plaintext token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hash,  // Store hash, not plaintext
        expires,
      },
    });

    // Log security event
    logSecurity('verification_email_requested', 'low', {
      email: email,
    });

    // Build verification URL — plaintext token is only sent via email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

    // Send the email via Resend
    try {
      await sendVerificationEmail(email, verificationUrl);
      log.info('Verification email sent', {
        email,
        expiresAt: expires.toISOString(),
      });
    } catch (emailError) {
      log.error('Failed to send verification email', {
        error: emailError instanceof Error ? emailError.message : emailError,
        email,
      });
      // Don't leak the email failure to the caller — token is already stored,
      // user can request resend. Still return success for security (don't reveal
      // whether send failed vs email doesn't exist).
    }

    // In development, also log the URL so Oli can test without checking inbox
    if (process.env.NODE_ENV === 'development') {
      log.debug('EMAIL VERIFICATION URL (Development Only)', { verificationUrl, validFor: '24 hours' });
    }

    // SECURITY: Never return token or verificationUrl in API response
    return NextResponse.json(
      {
        message: 'Verification email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    log.error('Send verification error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
