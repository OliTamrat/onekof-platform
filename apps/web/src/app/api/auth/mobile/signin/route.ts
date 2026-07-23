import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { isAccountLocked, recordFailedLogin, resetFailedAttempts } from '@/lib/security/account-lockout';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'dev-only-fallback';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit to prevent brute-force attacks
    const rateLimitError = await checkRateLimit(request, 'login');
    if (rateLimitError) return rateLimitError;

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // SECURITY: Check if account is locked
    try {
      const lockStatus = await isAccountLocked(email.toLowerCase().trim());
      if (lockStatus.locked) {
        return NextResponse.json(
          { error: `Account locked. Try again in ${lockStatus.minutesRemaining} minutes.` },
          { status: 423 }
        );
      }
    } catch {}

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      try { await recordFailedLogin(email.toLowerCase().trim()); } catch {}
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      try {
        const lockResult = await recordFailedLogin(email.toLowerCase().trim());
        if (lockResult.locked) {
          return NextResponse.json(
            { error: `Account locked due to too many failed attempts. Try again in ${Math.ceil((lockResult.lockedUntil!.getTime() - Date.now()) / 60000)} minutes.` },
            { status: 423 }
          );
        }
      } catch {}
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // SECURITY: Reset failed attempts on successful login
    try { await resetFailedAttempts(email.toLowerCase().trim()); } catch {}

    // Generate JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    console.error('Mobile signin error:', error);
    return NextResponse.json(
      { error: 'Sign in failed' },
      { status: 500 }
    );
  }
}
