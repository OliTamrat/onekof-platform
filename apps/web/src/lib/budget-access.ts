import { prisma, BudgetAccess } from '@onekof/database';

/**
 * 🔐 BUDGET ACCESS CONTROL SYSTEM
 *
 * This is the CORE security layer for budget management.
 * Government projects require strict access control - not everyone
 * should see financial data.
 *
 * Access Levels:
 * - NO_ACCESS: Cannot see ANY budget information
 * - VIEW_ONLY: Can view budget but not edit (for team members)
 * - EDIT: Can view and edit budget, add expenses (for project managers)
 * - APPROVE: Can approve expenses (for finance directors)
 * - FULL_CONTROL: Complete budget management (for organization owners)
 */

/**
 * Check if user has required budget access level for a project
 */
export async function checkBudgetAccess(
  userId: string,
  projectId: string,
  requiredAccess: BudgetAccess
): Promise<boolean> {
  // Get user's actual access level
  const userAccess = await getBudgetAccess(userId, projectId);

  // Check if user's access meets or exceeds required level
  return hasAccessLevel(userAccess, requiredAccess);
}

/**
 * Get user's budget access level for a project
 *
 * Priority: Project-level access > Organization-level access
 */
export async function getBudgetAccess(
  userId: string,
  projectId: string
): Promise<BudgetAccess> {
  // Get project to find organization
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true }
  });

  if (!project) {
    return BudgetAccess.NO_ACCESS;
  }

  // 1. Check PROJECT-LEVEL access first (highest priority)
  const projectMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    select: { budgetAccess: true }
  });

  // If user has project-level budget access set, use it
  if (projectMembership?.budgetAccess) {
    return projectMembership.budgetAccess;
  }

  // 2. Fall back to ORGANIZATION-LEVEL access
  const orgMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: project.organizationId,
        userId
      }
    },
    select: {
      budgetAccess: true,
      role: true
    }
  });

  if (!orgMembership) {
    return BudgetAccess.NO_ACCESS;
  }

  // 3. Auto-grant FULL_CONTROL to OWNER/ADMIN if not explicitly set
  if (orgMembership.role === 'OWNER' || orgMembership.role === 'ADMIN') {
    return orgMembership.budgetAccess || BudgetAccess.FULL_CONTROL;
  }

  return orgMembership.budgetAccess;
}

/**
 * Check if user's access level meets or exceeds required level
 */
function hasAccessLevel(
  userAccess: BudgetAccess,
  requiredAccess: BudgetAccess
): boolean {
  const accessLevels: Record<BudgetAccess, number> = {
    NO_ACCESS: 0,
    VIEW_ONLY: 1,
    EDIT: 2,
    APPROVE: 3,
    FULL_CONTROL: 4
  };

  return accessLevels[userAccess] >= accessLevels[requiredAccess];
}

/**
 * Get accessible projects for user with budget access
 * Returns projects where user has at least VIEW_ONLY access
 */
export async function getAccessibleBudgets(userId: string) {
  // Get all organizations user belongs to
  const orgMemberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          projects: {
            where: { deletedAt: null },
            include: {
              budget: {
                select: {
                  id: true,
                  totalBudget: true,
                  currency: true,
                  status: true
                }
              }
            }
          }
        }
      }
    }
  });

  const accessibleProjects = [];

  for (const membership of orgMemberships) {
    // If user has org-level budget access
    if (membership.budgetAccess !== BudgetAccess.NO_ACCESS) {
      for (const project of membership.organization.projects) {
        if (project.budget) {
          accessibleProjects.push({
            projectId: project.id,
            projectName: project.name,
            projectKey: project.key,
            budget: project.budget,
            accessLevel: membership.budgetAccess
          });
        }
      }
    } else {
      // Check project-level access
      const projectMemberships = await prisma.projectMember.findMany({
        where: {
          userId,
          projectId: { in: membership.organization.projects.map(p => p.id) }
        }
      });

      for (const projectMembership of projectMemberships) {
        if (projectMembership.budgetAccess && projectMembership.budgetAccess !== BudgetAccess.NO_ACCESS) {
          const project = membership.organization.projects.find(p => p.id === projectMembership.projectId);
          if (project?.budget) {
            accessibleProjects.push({
              projectId: project.id,
              projectName: project.name,
              projectKey: project.key,
              budget: project.budget,
              accessLevel: projectMembership.budgetAccess
            });
          }
        }
      }
    }
  }

  return accessibleProjects;
}

/**
 * Filter budget data based on user's access level
 * Hides sensitive fields for users with limited access
 */
export function filterBudgetData(budget: any, accessLevel: BudgetAccess) {
  // Everyone with any access can see basic info
  const filtered: any = {
    id: budget.id,
    projectId: budget.projectId,
    currency: budget.currency,
    status: budget.status,
    accessLevel // Include user's access level in response
  };

  // VIEW_ONLY and above can see amounts
  if (hasAccessLevel(accessLevel, BudgetAccess.VIEW_ONLY)) {
    filtered.totalBudget = budget.totalBudget;
    filtered.fiscalYearStart = budget.fiscalYearStart;
    filtered.fiscalYearEnd = budget.fiscalYearEnd;
  }

  // EDIT and above can see all financial details
  if (hasAccessLevel(accessLevel, BudgetAccess.EDIT)) {
    filtered.categories = budget.categories;
    filtered.expenses = budget.expenses?.map((expense: any) => ({
      ...expense,
      // Hide vendor details unless APPROVE or FULL_CONTROL
      vendor: hasAccessLevel(accessLevel, BudgetAccess.APPROVE) ? expense.vendor : '[REDACTED]',
      receiptUrl: hasAccessLevel(accessLevel, BudgetAccess.APPROVE) ? expense.receiptUrl : null
    }));
    filtered.additionalFunding = budget.additionalFunding;
  }

  // FULL_CONTROL can see everything including settings
  if (hasAccessLevel(accessLevel, BudgetAccess.FULL_CONTROL)) {
    filtered.settings = budget.settings;
    filtered.visibilitySettings = budget.visibilitySettings;
    filtered.createdBy = budget.createdBy;
    filtered.approvedBy = budget.approvedBy;
    filtered.approvedAt = budget.approvedAt;
  }

  return filtered;
}

/**
 * Validate expense approval permissions
 * Returns true if user can approve expenses at this amount
 */
export async function canApproveExpense(
  userId: string,
  projectId: string,
  expenseAmount: number
): Promise<{ canApprove: boolean; reason?: string }> {
  const accessLevel = await getBudgetAccess(userId, projectId);

  // Must have at least APPROVE access
  if (!hasAccessLevel(accessLevel, BudgetAccess.APPROVE)) {
    return {
      canApprove: false,
      reason: 'Insufficient permissions to approve expenses'
    };
  }

  // Get budget settings for approval thresholds
  const budget = await prisma.budget.findFirst({
    where: { projectId },
    select: { settings: true }
  });

  if (!budget) {
    return { canApprove: false, reason: 'Budget not found' };
  }

  // Check approval levels from settings
  const settings: any = budget.settings || {};

  // For FULL_CONTROL, can approve anything
  if (hasAccessLevel(accessLevel, BudgetAccess.FULL_CONTROL)) {
    return { canApprove: true };
  }

  // Read threshold from budget settings, fall back to 1M ETB
  const maxApprovalAmount = settings.approvalThresholdAmount || 1000000;

  if (expenseAmount > maxApprovalAmount) {
    return {
      canApprove: false,
      reason: `Expenses over ETB ${maxApprovalAmount.toLocaleString()} require higher-level approval`
    };
  }

  return { canApprove: true };
}
