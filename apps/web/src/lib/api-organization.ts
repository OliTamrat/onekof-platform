import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { headers } from 'next/headers';

interface OrganizationContext {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  membership: {
    role: string;
    budgetAccess: string | null;
  };
}

/**
 * Get the current organization context from subdomain and validate user access
 * This should be called at the start of every API route that needs organization isolation
 */
export async function getOrganizationContext(): Promise<{
  data: OrganizationContext | null;
  error: NextResponse | null;
}> {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        data: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    // Get organization slug from middleware-set header
    const headersList = headers();
    const organizationSlug = headersList.get('x-organization-slug');

    if (!organizationSlug) {
      return {
        data: null,
        error: NextResponse.json(
          { error: 'No organization context. Please access via organization subdomain.' },
          { status: 400 }
        ),
      };
    }

    // Single query: fetch membership with org + user included
    // Replaces 3 sequential queries (organization, membership, user) → 1 query
    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: organizationSlug },
      },
      select: {
        role: true,
        budgetAccess: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return {
        data: null,
        error: NextResponse.json(
          { error: 'You do not have access to this organization' },
          { status: 403 }
        ),
      };
    }

    if (membership.organization.status !== 'ACTIVE') {
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Organization is not active' },
          { status: 403 }
        ),
      };
    }

    return {
      data: {
        organization: membership.organization,
        user: membership.user,
        membership: {
          role: membership.role,
          budgetAccess: membership.budgetAccess,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting organization context:', error);
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Failed to get organization context' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Lightweight org resolver for API routes that need user + org context.
 * Uses x-organization-slug header (set by middleware from subdomain) to pick the correct org.
 * Falls back to user's default org, then first org — safe for Vercel previews without subdomains.
 *
 * Returns the user (with organizations included) and the resolved organizationId + membership role.
 */
export async function resolveUserOrganization(): Promise<{
  data: {
    user: { id: string; email: string; name: string | null };
    organizationId: string;
    role: string;
  } | null;
  error: NextResponse | null;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return {
        data: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    // 1. Try subdomain slug from middleware header (fast path — single query)
    const headersList = headers();
    const slug = headersList.get('x-organization-slug');

    if (slug) {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          user: { email: session.user.email },
          organization: { slug },
        },
        select: {
          role: true,
          organizationId: true,
          user: { select: { id: true, email: true, name: true } },
        },
      });

      if (membership) {
        return {
          data: {
            user: membership.user,
            organizationId: membership.organizationId,
            role: membership.role,
          },
          error: null,
        };
      }
    }

    // 2. Fallback path (no slug or slug mismatch): fetch user + default org
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        defaultOrganizationId: true,
        organizations: {
          select: {
            role: true,
            organizationId: true,
          },
          take: 5,
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return {
        data: null,
        error: NextResponse.json({ error: 'No organization found' }, { status: 404 }),
      };
    }

    const membership =
      (user.defaultOrganizationId &&
        user.organizations.find((m) => m.organizationId === user.defaultOrganizationId)) ||
      user.organizations[0];

    return {
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        organizationId: membership.organizationId,
        role: membership.role,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error resolving user organization:', error);
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Failed to resolve organization' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Helper function to check if user has specific role in organization
 */
export function hasRole(
  membership: { role: string },
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(membership.role);
}

/**
 * Helper function to check if user has budget access
 */
export function hasBudgetAccess(membership: {
  budgetAccess: string | null;
}): boolean {
  return membership.budgetAccess === 'FULL' || membership.budgetAccess === 'VIEW';
}

/**
 * Helper function to check if user has full budget access
 */
export function hasFullBudgetAccess(membership: {
  budgetAccess: string | null;
}): boolean {
  return membership.budgetAccess === 'FULL';
}
