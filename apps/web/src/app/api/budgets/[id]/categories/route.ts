import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { checkBudgetAccess } from '@/lib/budget-access';
import { BudgetAccess } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budgets/[id]/categories
 * List all budget categories
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

    // Get budget to find project
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      select: { projectId: true }
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Check budget access
    const hasAccess = await checkBudgetAccess(user.id, budget.projectId, BudgetAccess.VIEW_ONLY);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view budget categories' },
        { status: 403 }
      );
    }

    // Get categories with expense summary
    const categories = await prisma.budgetCategory.findMany({
      where: { budgetId: params.id },
      orderBy: { order: 'asc' },
      include: {
        expenses: {
          where: { status: { not: 'REJECTED' } },
          select: {
            amount: true,
            type: true,
            status: true
          }
        }
      }
    });

    // Calculate utilization for each category
    const categoriesWithUtilization = categories.map((cat: any) => {
      const allocated = Number(cat.allocatedAmount);
      const spent = cat.expenses
        .filter((e: any) => e.type === 'ACTUAL' && (e.status === 'APPROVED' || e.status === 'PAID'))
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

      const committed = cat.expenses
        .filter((e: any) => e.type === 'COMMITTED' || (e.type === 'ACTUAL' && e.status === 'PENDING'))
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

      const available = allocated - spent - committed;
      const percentageUsed = allocated > 0 ? (spent / allocated) * 100 : 0;

      return {
        ...cat,
        expenses: undefined, // Remove raw expenses from response
        utilization: {
          allocated,
          spent,
          committed,
          available,
          percentageUsed: Math.round(percentageUsed * 10) / 10
        }
      };
    });

    return NextResponse.json({ categories: categoriesWithUtilization });
  } catch (error) {
    logger.error('Categories fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * POST /api/budgets/[id]/categories
 * Create budget category
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

    // Get budget to find project
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      select: { projectId: true }
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Check budget edit access
    const hasAccess = await checkBudgetAccess(user.id, budget.projectId, BudgetAccess.EDIT);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit budget' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, description, allocatedAmount, currency, parentId } = body;

    // Validate
    if (!name || !allocatedAmount) {
      return NextResponse.json(
        { error: 'Name and allocated amount are required' },
        { status: 400 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.budgetCategory.aggregate({
      where: { budgetId: params.id },
      _max: { order: true }
    });

    const category = await prisma.budgetCategory.create({
      data: {
        budgetId: params.id,
        name,
        code,
        description,
        allocatedAmount,
        currency: currency || 'ETB',
        parentId,
        order: (maxOrder._max.order || 0) + 1
      }
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    logger.error('Category creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
