import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@onekof/database';
import { compare } from 'bcryptjs';
import { isAccountLocked, recordFailedLogin, resetFailedAttempts } from '@/lib/security/account-lockout';
import { logSecurity } from '@/lib/logger';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  trustHost: true, // Allow NextAuth to work on any host (Vercel, custom domains, etc.)
  cookies: {
    // Configure cookies to work across subdomains
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Domain handling:
        // - Development: .localhost for subdomain support
        // - Production on custom domain: .onekof.com for subdomain support
        // - Production on Vercel: undefined (use current domain)
        domain: process.env.NODE_ENV === 'production'
          ? (process.env.VERCEL_URL?.includes('vercel.app') ? undefined : '.onekof.com')
          : '.localhost',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },
  providers: [
    // Only include Google OAuth if credentials are configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        // SECURITY: Check if account is locked
        const lockStatus = await isAccountLocked(credentials.email);
        if (lockStatus.locked) {
          logSecurity('login_attempt_while_locked', 'medium', {
            email: credentials.email,
            lockedUntil: lockStatus.lockedUntil?.toISOString(),
            minutesRemaining: lockStatus.minutesRemaining,
          });

          throw new Error(
            `Account is locked due to too many failed login attempts. Please try again in ${lockStatus.minutesRemaining} minutes.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // SECURITY: Record failed attempt (even for non-existent users to prevent enumeration timing attacks)
          await recordFailedLogin(credentials.email);
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // SECURITY: Record failed login attempt
          const lockResult = await recordFailedLogin(credentials.email);

          if (lockResult.locked) {
            const lockMinutes = Math.ceil(
              (lockResult.lockedUntil!.getTime() - Date.now()) / (60 * 1000)
            );
            throw new Error(
              `Account locked due to too many failed login attempts. Try again in ${lockMinutes} minutes.`
            );
          }

          const attemptsMsg = lockResult.attemptsRemaining
            ? ` (${lockResult.attemptsRemaining} attempts remaining)`
            : '';

          throw new Error(`Invalid credentials${attemptsMsg}`);
        }

        // SECURITY: Reset failed attempts on successful login
        await resetFailedAttempts(credentials.email);

        logSecurity('successful_login', 'low', {
          userId: user.id,
          email: user.email,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;

        // Fetch user's organizations
        const organizations = await prisma.organizationMember.findMany({
          where: { userId: user.id },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                status: true,
              },
            },
          },
        });

        token.organizations = organizations.map((membership) => ({
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
          plan: membership.organization.plan,
          status: membership.organization.status,
          role: membership.role,
        }));
      }

      // Refresh organizations on update trigger
      if (trigger === 'update' && token.id) {
        const organizations = await prisma.organizationMember.findMany({
          where: { userId: token.id as string },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                status: true,
              },
            },
          },
        });

        token.organizations = organizations.map((membership) => ({
          id: membership.organization.id,
          name: membership.organization.name,
          slug: membership.organization.slug,
          plan: membership.organization.plan,
          status: membership.organization.status,
          role: membership.role,
        }));
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.organizations = token.organizations as any[];
      }
      return session;
    },
  },
};
