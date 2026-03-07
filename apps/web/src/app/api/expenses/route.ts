import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/expenses
 * List expenses with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      deletedAt: null,
    };

    if (budgetId) where.budgetId = budgetId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          budget: {
            select: {
              id: true,
              project: {
                select: {
                  name: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          attachments: {
            where: {
              deletedAt: null,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + expenses.length < total,
      },
    });
  } catch (error) {
    console.error('Expenses list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Create new expense
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      budgetId,
      categoryId,
      description,
      amount,
      currency = 'ETB',
      transactionDate,
      invoiceNumber,
      vendor,
      receiptUrl,
      type = 'ACTUAL',
      notes,
    } = body;

    // Validate required fields
    if (!budgetId || !description || !amount || !transactionDate) {
      return NextResponse.json(
        { error: 'Missing required fields: budgetId, description, amount, transactionDate' },
        { status: 400 }
      );
    }

    // Check budget exists
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        budgetId,
        categoryId,
        description,
        amount,
        currency,
        type,
        transactionDate: new Date(transactionDate),
        invoiceNumber,
        vendor,
        receiptUrl,
        status: 'PENDING', // Always starts as pending
        submittedBy: user.id,
        notes,
      },
      include: {
        budget: {
          select: {
            id: true,
            project: {
              select: {
                name: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // TODO: Send notification to budget approvers

    return NextResponse.json({
      expense,
      message: 'Expense submitted for approval',
    }, { status: 201 });
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
