import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { checkBudgetAccess, canApproveExpense } from '@/lib/budget-access';
import { BudgetAccess } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budgets/[id]/expenses
 * List expenses with filters
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
        { error: 'Insufficient permissions to view expenses' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build where clause
    const where: any = { budgetId: params.id };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: limit,
      include: {
        category: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    logger.error('Expenses fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

/**
 * POST /api/budgets/[id]/expenses
 * Create expense (submit for approval)
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
        { error: 'Insufficient permissions to create expenses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      categoryId,
      description,
      amount,
      currency,
      type,
      transactionDate,
      invoiceNumber,
      vendor,
      receiptUrl,
      notes
    } = body;

    // Validate
    if (!description || !amount || !transactionDate) {
      return NextResponse.json(
        { error: 'Description, amount, and transaction date are required' },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount cannot be negative' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        budgetId: params.id,
        categoryId,
        description,
        amount,
        currency: currency || 'ETB',
        type: type || 'ACTUAL',
        transactionDate: new Date(transactionDate),
        invoiceNumber,
        vendor,
        receiptUrl,
        notes,
        status: 'PENDING',
        submittedBy: user.id
      },
      include: {
        category: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    logger.error('Expense creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
