import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@onekof/database';
import { generateTokenPair, generateTokenExpiry } from '@/lib/security/tokens';
import { log, logSecurity } from '@/lib/logger';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateRequestBody } from '@/lib/validation/validate';
import { signupSchema } from '@/lib/validation/schemas';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit signup requests to prevent abuse
    const rateLimitError = await checkRateLimit(req, 'signup');
    if (rateLimitError) return rateLimitError;

    // SECURITY: Validate input with Zod schema
    const validation = await validateRequestBody(req, signupSchema);
    if (!validation.success) return validation.error;

    const { name, email, password } = validation.data;

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
      const schemaName = `onekof_org_${email.split('@')[0]}_${Date.now()}`.replace(/[^a-z0-9_]/g, '_');
      const organization = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          slug: `${email.split('@')[0]}-workspace-${Date.now()}`,
          schemaName: schemaName,
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

      // SECURITY FIX: Generate secure token and hash it before storage
      const { token, hash: tokenHash } = generateTokenPair();
      const expires = generateTokenExpiry(24); // 24 hours

      // Store ONLY the hash in database, never the plaintext token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: tokenHash,  // Store hash, not plaintext
          expires,
        },
      });

      return { user, organization, verificationToken: token };
    });

    const { user, organization, verificationToken } = result;

    // Log security event
    logSecurity('user_signup', 'low', {
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
    });

    // Send email verification with secure verification link
    // The verification URL contains the plaintext token (sent via email only)
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;

    // Send email with verification link
    try {
      await sendVerificationEmail(user.email, verificationUrl);
      log.info('Verification email sent successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (emailError) {
      // Log email error but don't fail signup
      log.error('Failed to send verification email', {
        error: emailError,
        userId: user.id,
      });
      // Continue anyway - user account is created, they can request new verification email
    }

    // SECURITY FIX: Never return token or verificationUrl in API response
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
