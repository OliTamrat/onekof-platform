import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { checkBudgetAccess, getBudgetAccess, filterBudgetData } from '@/lib/budget-access';
import { BudgetAccess } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 💰 BUDGET API - Integrated into OneKOF PM
 *
 * This API provides real-time budget visibility for the Ministry of Water and Irrigation.
 * Shows WHERE every birr is spent, WHO approved it, and WHEN it will run out.
 *
 * Features that beat Jira:
 * - Real-time utilization with burn rate calculation
 * - Category breakdown with variance analysis
 * - Automatic alerts at configurable thresholds
 * - Budget forecast with completion predictions
 * - Complete audit trail with approval workflow
 * - Role-based data filtering for security
 */

/**
 * GET /api/projects/[id]/budget
 * Get project budget with real-time utilization stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔐 SECURITY: Check budget access
    const hasAccess = await checkBudgetAccess(user.id, params.id, BudgetAccess.VIEW_ONLY);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view budget' },
        { status: 403 }
      );
    }

    // Get budget with all related data
    const budget = await prisma.budget.findUnique({
      where: { projectId: params.id },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            expenses: {
              where: { status: { not: 'REJECTED' } }
            }
          }
        },
        expenses: {
          where: { status: { not: 'REJECTED' } },
          orderBy: { transactionDate: 'desc' },
          take: 50, // Latest 50 expenses
          include: {
            category: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found for this project' }, { status: 404 });
    }

    // 📊 CALCULATE REAL-TIME UTILIZATION
    const utilization = calculateBudgetUtilization(budget);

    // 📈 CALCULATE BURN RATE
    const burnRate = calculateBurnRate(budget);

    // 🎯 CALCULATE CATEGORY UTILIZATION
    const categoryBreakdown = calculateCategoryBreakdown(budget.categories);

    // ⚠️ GENERATE ALERTS
    const alerts = generateBudgetAlerts(budget, utilization);

    // 🔮 FORECAST
    const forecast = calculateForecast(budget, utilization, burnRate);

    // Get user's access level
    const userAccess = await getBudgetAccess(user.id, params.id);

    // Filter data based on access level
    const filteredBudget = filterBudgetData(budget, userAccess);

    return NextResponse.json({
      budget: {
        ...filteredBudget,
        utilization,
        burnRate,
        categoryBreakdown,
        alerts,
        forecast
      }
    });
  } catch (error) {
    console.error('Budget fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/budget
 * Create or update project budget
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔐 SECURITY: Check budget edit access
    const hasAccess = await checkBudgetAccess(user.id, params.id, BudgetAccess.EDIT);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit budget' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      totalBudget,
      currency,
      fiscalYearStart,
      fiscalYearEnd,
      settings,
      additionalFunding,
      isPublic
    } = body;

    // Validate
    if (totalBudget !== undefined && totalBudget < 0) {
      return NextResponse.json({ error: 'Total budget cannot be negative' }, { status: 400 });
    }

    // Check if budget exists
    const existingBudget = await prisma.budget.findUnique({
      where: { projectId: params.id }
    });

    if (existingBudget) {
      // Update existing budget
      const updated = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: {
          totalBudget: totalBudget !== undefined ? totalBudget : existingBudget.totalBudget,
          currency: currency || existingBudget.currency,
          fiscalYearStart: fiscalYearStart ? new Date(fiscalYearStart) : existingBudget.fiscalYearStart,
          fiscalYearEnd: fiscalYearEnd ? new Date(fiscalYearEnd) : existingBudget.fiscalYearEnd,
          settings: settings !== undefined ? settings : existingBudget.settings,
          additionalFunding: additionalFunding !== undefined ? additionalFunding : existingBudget.additionalFunding,
          isPublic: isPublic !== undefined ? isPublic : existingBudget.isPublic,
          status: totalBudget !== undefined ? 'ACTIVE' : existingBudget.status
        }
      });

      return NextResponse.json({ budget: updated });
    }

    // Create new budget
    const budget = await prisma.budget.create({
      data: {
        projectId: params.id,
        totalBudget: totalBudget || 0,
        currency: currency || 'ETB',
        fiscalYearStart: fiscalYearStart ? new Date(fiscalYearStart) : null,
        fiscalYearEnd: fiscalYearEnd ? new Date(fiscalYearEnd) : null,
        settings: settings || {},
        additionalFunding: additionalFunding || [],
        isPublic: isPublic || false,
        status: 'ACTIVE',
        createdBy: user.id
      }
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Budget creation error:', error);
    return NextResponse.json({ error: 'Failed to create/update budget' }, { status: 500 });
  }
}

// ============================================================================
// HELPER FUNCTIONS - Real-time calculations
// ============================================================================

function calculateBudgetUtilization(budget: any) {
  const totalBudget = Number(budget.totalBudget);

  const spent = budget.expenses
    .filter((e: any) => e.type === 'ACTUAL' && (e.status === 'APPROVED' || e.status === 'PAID'))
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const committed = budget.expenses
    .filter((e: any) => e.type === 'COMMITTED' || (e.type === 'ACTUAL' && e.status === 'PENDING'))
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const available = totalBudget - spent - committed;
  const percentageUsed = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const percentageCommitted = totalBudget > 0 ? ((spent + committed) / totalBudget) * 100 : 0;

  let status = 'ON_TRACK';
  if (percentageUsed >= 100) status = 'OVER_BUDGET';
  else if (percentageUsed >= 90) status = 'CRITICAL';
  else if (percentageUsed >= 75) status = 'AT_RISK';
  else if (percentageUsed >= 50) status = 'WATCH';

  return {
    totalBudget,
    spent,
    committed,
    available,
    percentageUsed: Math.round(percentageUsed * 10) / 10,
    percentageCommitted: Math.round(percentageCommitted * 10) / 10,
    status,
    lastUpdated: new Date().toISOString()
  };
}

function calculateBurnRate(budget: any) {
  const expenses = budget.expenses.filter((e: any) =>
    e.type === 'ACTUAL' && (e.status === 'APPROVED' || e.status === 'PAID')
  );

  if (expenses.length === 0) {
    return {
      dailyBurnRate: 0,
      weeklyBurnRate: 0,
      monthlyBurnRate: 0,
      averageExpenseSize: 0,
      totalExpenses: 0
    };
  }

  const sortedExpenses = expenses.sort((a: any, b: any) =>
    new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );

  const firstDate = new Date(sortedExpenses[0].transactionDate);
  const lastDate = new Date(sortedExpenses[sortedExpenses.length - 1].transactionDate);

  const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalSpent = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const dailyBurnRate = totalSpent / daysDiff;

  return {
    dailyBurnRate: Math.round(dailyBurnRate),
    weeklyBurnRate: Math.round(dailyBurnRate * 7),
    monthlyBurnRate: Math.round(dailyBurnRate * 30),
    averageExpenseSize: Math.round(totalSpent / expenses.length),
    totalExpenses: expenses.length
  };
}

function calculateCategoryBreakdown(categories: any[]) {
  return categories.map((cat: any) => {
    const allocated = Number(cat.allocatedAmount);
    const spent = cat.expenses
      .filter((e: any) => e.type === 'ACTUAL' && (e.status === 'APPROVED' || e.status === 'PAID'))
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const committed = cat.expenses
      .filter((e: any) => e.type === 'COMMITTED' || (e.type === 'ACTUAL' && e.status === 'PENDING'))
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const available = allocated - spent - committed;
    const percentageUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
    const variance = spent - allocated;

    let status = 'ON_TRACK';
    if (percentageUsed >= 100) status = 'OVER_BUDGET';
    else if (percentageUsed >= 90) status = 'AT_RISK';
    else if (percentageUsed >= 75) status = 'WATCH';

    return {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      allocated,
      spent,
      committed,
      available,
      percentageUsed: Math.round(percentageUsed * 10) / 10,
      variance,
      status,
      expenseCount: cat.expenses.length
    };
  });
}

function generateBudgetAlerts(budget: any, utilization: any) {
  const alerts = [];
  const settings: any = budget.settings || {};
  const thresholds = settings.alertThresholds || [50, 75, 90, 95];

  for (const threshold of thresholds) {
    if (utilization.percentageUsed >= threshold && utilization.percentageUsed < threshold + 5) {
      alerts.push({
        type: utilization.percentageUsed >= 90 ? 'CRITICAL' : 'WARNING',
        message: `Budget utilization at ${utilization.percentageUsed.toFixed(1)}% (${threshold}% threshold crossed)`,
        category: 'UTILIZATION',
        threshold
      });
    }
  }

  if (utilization.percentageUsed > 100) {
    alerts.push({
      type: 'CRITICAL',
      message: `Budget exceeded by ${(utilization.percentageUsed - 100).toFixed(1)}%`,
      category: 'OVER_BUDGET',
      amount: utilization.spent - utilization.totalBudget
    });
  }

  const pendingExpenses = budget.expenses.filter((e: any) => e.status === 'PENDING');
  if (pendingExpenses.length > 0) {
    const pendingAmount = pendingExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    alerts.push({
      type: 'INFO',
      message: `${pendingExpenses.length} expenses awaiting approval (${pendingAmount.toLocaleString()} ${budget.currency})`,
      category: 'PENDING_APPROVAL',
      count: pendingExpenses.length,
      amount: pendingAmount
    });
  }

  return alerts;
}

function calculateForecast(budget: any, utilization: any, burnRate: any) {
  const daysRemaining = burnRate.dailyBurnRate > 0
    ? Math.floor(utilization.available / burnRate.dailyBurnRate)
    : Infinity;

  const projectedCompletionDate = daysRemaining !== Infinity
    ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const fiscalYearEnd = budget.fiscalYearEnd ? new Date(budget.fiscalYearEnd) : null;
  const daysUntilFiscalYearEnd = fiscalYearEnd
    ? Math.floor((fiscalYearEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  let forecastStatus = 'ON_TRACK';
  let forecastMessage = 'Project on track to complete within budget';

  if (daysRemaining !== Infinity && daysUntilFiscalYearEnd) {
    if (daysRemaining < daysUntilFiscalYearEnd) {
      forecastStatus = 'BUDGET_SHORTAGE';
      forecastMessage = `Budget projected to run out ${daysUntilFiscalYearEnd - daysRemaining} days before fiscal year end`;
    } else if (daysRemaining > daysUntilFiscalYearEnd * 1.5) {
      forecastStatus = 'UNDER_UTILIZED';
      forecastMessage = 'Budget significantly under-utilized, consider reallocation';
    }
  }

  return {
    daysRemaining,
    projectedCompletionDate,
    daysUntilFiscalYearEnd,
    forecastStatus,
    forecastMessage,
    projectedTotalSpend: burnRate.dailyBurnRate * (daysUntilFiscalYearEnd || 365)
  };
}
