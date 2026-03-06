import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@onekof/database';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/onboarding',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

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
