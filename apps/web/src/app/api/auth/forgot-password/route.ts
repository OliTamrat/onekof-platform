import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, you would send an email here
    if (!user) {
      // Return success anyway to prevent leaking user existence
      return NextResponse.json(
        { message: 'If an account exists with that email, password reset instructions have been sent' },
        { status: 200 }
      );
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // For development, log the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    console.log('Password reset URL:', resetUrl);
    console.log('This URL will be valid for 1 hour');

    return NextResponse.json(
      {
        message: 'If an account exists with that email, password reset instructions have been sent',
        // Include token in dev environment for testing
        ...(process.env.NODE_ENV === 'development' && { resetUrl }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
