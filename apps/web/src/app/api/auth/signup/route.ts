import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@onekof/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with default organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Create default organization/workspace
      const organization = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          slug: `${email.split('@')[0]}-workspace-${Date.now()}`,
          ownerId: user.id,
        },
      });

      // Add user as organization member with OWNER role
      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // Update user with default organization
      await tx.user.update({
        where: { id: user.id },
        data: { defaultOrganizationId: organization.id },
      });

      // Generate verification token (valid for 24 hours)
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create verification token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires,
        },
      });

      return { user, organization, verificationToken };
    });

    const { user, organization, verificationToken } = result;

    // TODO: Send email with verification link
    // For development, log the verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    console.log('\n========================================');
    console.log('EMAIL VERIFICATION REQUIRED');
    console.log('========================================');
    console.log('Email:', email);
    console.log('Verification URL:', verificationUrl);
    console.log('This URL will be valid for 24 hours');
    console.log('========================================\n');

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        message: 'Account created successfully. Please check your email to verify your account.',
        // Include verification URL in dev environment for testing
        ...(process.env.NODE_ENV === 'development' && { verificationUrl }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
