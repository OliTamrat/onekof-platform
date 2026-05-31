import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import GitHubProvider from 'next-auth/providers/github';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { prisma } from '@onekof/database';
import { compare } from 'bcryptjs';
import { isAccountLocked, recordFailedLogin, resetFailedAttempts } from '@/lib/security/account-lockout';
import { logSecurity } from '@/lib/logger';
import { isVercelPreview } from '@/lib/env/runtime';

/**
 * Resolve the NextAuth session cookie domain from environment.
 *
 * Behavior matrix (all security flags remain constant — see `sessionToken.options`):
 *
 * | Environment             | AUTH_COOKIE_DOMAIN set? | Resolved domain      |
 * | ----------------------- | ----------------------- | -------------------- |
 * | production (Vercel)     | yes                     | value of env var     |
 * | production (Vercel)     | no                      | '.onekof.com'        |
 * | preview   (vercel.app)  | any                     | undefined (exact)    |
 * | production (self-host)  | yes (required)          | value of env var     |
 * | development             | any                     | '.localhost'         |
 *
 * On preview Vercel deploys, cookies must stay on the exact preview hostname
 * (e.g. `feature-branch.vercel.app`) so that unrelated preview deployments
 * cannot observe each other's sessions. This preserves the existing
 * production behavior on Tier 3.
 *
 * On self-hosted Tier 2 (`.onekof.et`) and Tier 1 (`.gov.onekof.et`) the env
 * var MUST be set at deploy time — there is no safe default. The fallback
 * `.onekof.com` only applies when the env var is unset AND the build is on
 * Vercel production, matching the behavior that existed before Wave 1.
 */
function resolveAuthCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== 'production') {
    return '.localhost';
  }
  if (isVercelPreview()) {
    return undefined;
  }
  return process.env.AUTH_COOKIE_DOMAIN || '.onekof.com';
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  // @ts-expect-error trustHost exists in NextAuth v4.24+ but types lag behind
  trustHost: true, // Allow NextAuth to work on any host (Vercel, custom domains, etc.)
  cookies: {
    // Configure cookies to work across subdomains.
    // All security flags (httpOnly, sameSite=lax, secure, __Secure- prefix)
    // are preserved from the pre-Wave-1 configuration per PROJECT_GUIDELINES.md
    // "Session strategy: JWT, cookies scoped to subdomain". Only the `domain`
    // field is now resolved from AUTH_COOKIE_DOMAIN env var so self-hosted
    // tiers can scope to .onekof.et or .gov.onekof.et without a code change.
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: resolveAuthCookieDomain(),
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
    // OAuth callbacks are always routed through the main domain (onekof.com)
    // regardless of which org subdomain the user signed in from.
    // This keeps redirect URIs stable across all tenants — each provider only
    // needs one registered callback URL.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: { redirect_uri: 'https://onekof.com/api/auth/callback/google' },
          },
        })]
      : []),
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET
      ? [AzureADProvider({
          clientId: process.env.AZURE_AD_CLIENT_ID,
          clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
          tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
          authorization: {
            params: { redirect_uri: 'https://onekof.com/api/auth/callback/azure-ad' },
          },
        })]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          authorization: {
            params: { redirect_uri: 'https://onekof.com/api/auth/callback/github' },
          },
        })]
      : []),
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [LinkedInProvider({
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          authorization: {
            params: { redirect_uri: 'https://onekof.com/api/auth/callback/linkedin' },
          },
        })]
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

        // SECURITY: Check if account is locked (gracefully skip if columns don't exist yet)
        try {
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
        } catch (lockErr: unknown) {
          // Re-throw if it's our own lock error, otherwise skip lockout check
          if (lockErr instanceof Error && lockErr.message.includes('Account is locked')) throw lockErr;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // SECURITY: Run a dummy bcrypt compare to prevent timing-based user enumeration.
          // Without this, responses for non-existent users are ~250ms faster than real users,
          // allowing attackers to determine which emails have accounts.
          await compare(credentials.password, '$2b$12$dummy.hash.to.prevent.timing.attacks.000000000000000000');
          try { await recordFailedLogin(credentials.email); } catch { /* columns may not exist */ }
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          try {
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
          } catch (lockErr: unknown) {
            if (lockErr instanceof Error && lockErr.message.includes('Account locked')) throw lockErr;
            if (lockErr instanceof Error && lockErr.message.includes('Invalid credentials')) throw lockErr;
          }
          throw new Error('Invalid credentials');
        }

        try { await resetFailedAttempts(credentials.email); } catch { /* columns may not exist */ }

        logSecurity('successful_login', 'low', {
          userId: user.id,
          email: user.email,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
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
