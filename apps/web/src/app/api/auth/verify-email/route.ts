import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { hashToken, isTokenExpired } from '@/lib/security/tokens';
import { log, logSecurity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Hash the provided token before database lookup
    const tokenHash = hashToken(token);

    // Find verification token by hashed value
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },  // Compare against hash, not plaintext
    });

    if (!verificationToken) {
      log.warn('Invalid email verification token attempt');
      logSecurity('invalid_verification_token_attempt', 'medium', {
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (isTokenExpired(verificationToken.expires)) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token: tokenHash },
      });

      log.warn('Expired email verification token used');
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token: tokenHash },
    });

    // Log successful verification
    logSecurity('email_verified', 'low', {
      userId: user.id,
      email: user.email,
    });

    log.info('Email verified successfully', { userId: user.id });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
