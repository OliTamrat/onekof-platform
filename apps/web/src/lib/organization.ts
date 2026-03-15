import { headers } from 'next/headers';
import { prisma } from '@onekof/database';
import type { Organization } from '@onekof/database';

/**
 * Get the current organization from request headers (set by middleware)
 * This works in Server Components and API routes
 */
export async function getCurrentOrganization(): Promise<Organization | null> {
  const headersList = headers();
  const organizationSlug = headersList.get('x-organization-slug');

  if (!organizationSlug) {
    return null;
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  return organization;
}

/**
 * Get organization slug from request headers
 */
export function getOrganizationSlug(): string | null {
  const headersList = headers();
  return headersList.get('x-organization-slug');
}

/**
 * Require organization context - throws error if not in organization subdomain
 */
export async function requireOrganization(): Promise<Organization> {
  const organization = await getCurrentOrganization();

  if (!organization) {
    throw new Error('Organization context required. Please access via organization subdomain.');
  }

  return organization;
}

/**
 * Check if user has access to the current organization
 */
export async function checkOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  return !!membership;
}

/**
 * Get user's role in the current organization
 */
export async function getUserOrganizationRole(
  userId: string,
  organizationId: string
) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
    select: {
      role: true,
      budgetAccess: true,
    },
  });

  return membership;
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: {
      organization: {
        name: 'asc',
      },
    },
  });

  return memberships.map((m) => ({
    ...m.organization,
    role: m.role,
    budgetAccess: m.budgetAccess,
  }));
}
