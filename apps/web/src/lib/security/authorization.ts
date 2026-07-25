import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { NextResponse } from 'next/server';
import { log, logSecurity } from '@/lib/logger';
import { resolveAuthUser } from '@/lib/api-organization';

/**
 * Authorization Middleware for API Routes
 *
 * SECURITY: Prevents IDOR (Insecure Direct Object Reference) attacks
 * by verifying users can only access resources in their organization
 */

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
export type BudgetAccess = 'NO_ACCESS' | 'VIEW_ONLY' | 'EDIT' | 'APPROVE' | 'FULL_CONTROL';

interface AuthorizationResult {
  authorized: boolean;
  session?: any;
  membership?: any;
  error?: NextResponse;
}

/**
 * Verify user is authenticated.
 * Accepts NextAuth session cookies (web) or Bearer JWT tokens (mobile).
 */
export async function requireAuth(): Promise<AuthorizationResult> {
  // Try NextAuth session first (web)
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { authorized: true, session };
  }

  // Try Bearer JWT (mobile)
  const authUser = await resolveAuthUser();
  if (authUser) {
    // Return a session-like object for compatibility with existing code
    return {
      authorized: true,
      session: { user: { id: authUser.id, email: authUser.email, name: authUser.name } },
    };
  }

  return {
    authorized: false,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  };
}

/**
 * Verify user is member of an organization
 *
 * @param organizationId - Organization ID to check
 * @param userId - User ID to check
 * @param requiredRole - Optional minimum role required
 */
export async function requireOrganizationMembership(
  organizationId: string,
  userId: string,
  requiredRole?: Role
): Promise<AuthorizationResult> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    logSecurity('unauthorized_organization_access', 'high', {
      userId,
      organizationId,
    });

    return {
      authorized: false,
      error: NextResponse.json({ error: 'Access denied' }, { status: 403 }),
    };
  }

  // Check role if required
  if (requiredRole) {
    const roleHierarchy: Record<Role, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      GUEST: 1,
    };

    const userLevel = roleHierarchy[membership.role as Role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      logSecurity('insufficient_permissions', 'medium', {
        userId,
        organizationId,
        userRole: membership.role,
        requiredRole,
      });

      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, membership };
}

/**
 * Verify user can access a project
 *
 * @param projectId - Project ID to check
 * @param userId - User ID to check
 * @param requiredRole - Optional minimum role required
 */
export async function requireProjectAccess(
  projectId: string,
  userId: string,
  requiredRole?: 'ADMIN' | 'MEMBER' | 'VIEWER'
): Promise<AuthorizationResult> {
  // Get project with organization + visibility + lead/owner for access check
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      organizationId: true,
      visibility: true,
      leadId: true,
      ownerId: true,
    },
  });

  if (!project) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Project not found' }, { status: 404 }),
    };
  }

  // Check organization membership
  const orgAuth = await requireOrganizationMembership(project.organizationId, userId);
  if (!orgAuth.authorized) {
    return orgAuth;
  }

  // SECURITY: Even without a required project role, enforce project visibility.
  // PUBLIC and INTERNAL projects are visible to all org members — consistent
  // with buildProjectAccessFilter used in list endpoints. PRIVATE/CONFIDENTIAL
  // require explicit project membership.
  // Org OWNERs and ADMINs always have implicit access to non-CONFIDENTIAL projects.
  if (!requiredRole) {
    const isOrgAdmin = orgAuth.membership?.role === 'OWNER' || orgAuth.membership?.role === 'ADMIN';
    const isLeadOrOwner = project.leadId === userId || project.ownerId === userId;

    if (project.visibility === 'PUBLIC' || project.visibility === 'INTERNAL') {
      // Open to all org members — allow
      return { authorized: true, membership: orgAuth.membership };
    }

    if (isLeadOrOwner) {
      return { authorized: true, membership: orgAuth.membership };
    }

    if (project.visibility !== 'CONFIDENTIAL' && isOrgAdmin) {
      // Org admins have implicit access to PRIVATE (but NOT CONFIDENTIAL)
      return { authorized: true, membership: orgAuth.membership };
    }

    // PRIVATE / CONFIDENTIAL — require explicit project membership
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
      select: { role: true },
    });

    if (!projectMember) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'You do not have access to this project' }, { status: 403 }),
      };
    }

    return { authorized: true, membership: orgAuth.membership };
  }

  // Check project membership if stricter access needed
  if (requiredRole) {
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!projectMember) {
      // Org admins always have implicit access
      if (orgAuth.membership?.role === 'OWNER' || orgAuth.membership?.role === 'ADMIN') {
        return { authorized: true, membership: orgAuth.membership };
      }

      // Org members can edit tasks on PUBLIC / INTERNAL projects without an
      // explicit ProjectMember record — consistent with list-view access.
      if (project.visibility === 'PUBLIC' || project.visibility === 'INTERNAL') {
        return { authorized: true, membership: orgAuth.membership };
      }

      return {
        authorized: false,
        error: NextResponse.json({ error: 'Not a project member' }, { status: 403 }),
      };
    }

    // Check project role
    const roleHierarchy: Record<string, number> = {
      OWNER: 4,
      ADMIN: 3,
      MEMBER: 2,
      VIEWER: 1,
    };

    const userLevel = roleHierarchy[projectMember.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Insufficient project permissions' },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, membership: orgAuth.membership };
}

/**
 * Verify user can access a budget
 *
 * @param budgetId - Budget ID to check
 * @param userId - User ID to check
 * @param requiredAccess - Optional minimum access level required
 */
export async function requireBudgetAccess(
  budgetId: string,
  userId: string,
  requiredAccess?: BudgetAccess
): Promise<AuthorizationResult> {
  // Get budget with project organization
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      project: {
        select: { organizationId: true },
      },
    },
  });

  if (!budget) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Budget not found' }, { status: 404 }),
    };
  }

  // Check organization membership
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: budget.project.organizationId,
        userId,
      },
    },
  });

  if (!membership) {
    logSecurity('unauthorized_budget_access', 'high', {
      userId,
      budgetId,
      organizationId: budget.project.organizationId,
    });

    return {
      authorized: false,
      error: NextResponse.json({ error: 'Access denied' }, { status: 403 }),
    };
  }

  // Check budget access level if required
  if (requiredAccess) {
    const accessHierarchy: Record<BudgetAccess, number> = {
      FULL_CONTROL: 5,
      APPROVE: 4,
      EDIT: 3,
      VIEW_ONLY: 2,
      NO_ACCESS: 1,
    };

    const userLevel = accessHierarchy[membership.budgetAccess as BudgetAccess] || 0;
    const requiredLevel = accessHierarchy[requiredAccess] || 0;

    if (userLevel < requiredLevel) {
      logSecurity('insufficient_budget_permissions', 'medium', {
        userId,
        budgetId,
        userAccess: membership.budgetAccess,
        requiredAccess,
      });

      return {
        authorized: false,
        error: NextResponse.json(
          { error: 'Insufficient budget permissions' },
          { status: 403 }
        ),
      };
    }
  }

  return { authorized: true, membership };
}

/**
 * Verify user can access an expense
 *
 * @param expenseId - Expense ID to check
 * @param userId - User ID to check
 * @param action - Action to perform (read, update, approve)
 */
export async function requireExpenseAccess(
  expenseId: string,
  userId: string,
  action: 'read' | 'update' | 'approve' = 'read'
): Promise<AuthorizationResult> {
  // Get expense with budget and project
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      budget: {
        include: {
          project: {
            select: { organizationId: true },
          },
        },
      },
    },
  });

  if (!expense) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Expense not found' }, { status: 404 }),
    };
  }

  // For updates, only submitter or approver can modify
  if (action === 'update') {
    if (expense.submittedBy === userId) {
      // Submitter can update their own expenses
      return { authorized: true };
    }
  }

  // For approval, check budget approval permission
  if (action === 'approve') {
    return requireBudgetAccess(expense.budgetId, userId, 'APPROVE');
  }

  // For reading, check basic budget access
  return requireBudgetAccess(expense.budgetId, userId, 'VIEW_ONLY');
}

/**
 * Helper to check if user is organization owner/admin
 */
export async function isOrganizationAdmin(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  return membership?.role === 'OWNER' || membership?.role === 'ADMIN';
}
