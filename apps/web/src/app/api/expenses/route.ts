import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import { sendExpenseSubmittedEmail } from '@/lib/email';
import logger from '@/lib/logger';


export const dynamic = 'force-dynamic';

/**
 * GET /api/expenses
 * List expenses with filtering — scoped to the user's current organization
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const where: any = {
      deletedAt: null,
      budget: {
        project: {
          organizationId: ctx.organizationId,
        },
      },
    };

    if (budgetId) where.budgetId = budgetId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const includeClause = {
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
    };

    const orderByClause = {
      transactionDate: 'desc' as const,
    };

    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page');

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.expense.count({ where }),
      ]);

      return NextResponse.json(buildPaginatedResponse(expenses, total, { page, limit, skip }));
    }

    // Existing offset-based pagination (backward compatible)
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: includeClause,
        orderBy: orderByClause,
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
    logger.error('Expenses list error', { error: error instanceof Error ? error.message : error });
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
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

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

    // Check budget exists and belongs to user's organization
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { project: { select: { organizationId: true } } },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    if (budget.project.organizationId !== ctx.organizationId) {
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
        submittedBy: ctx.user.id,
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

    // Notify budget approvers (org members with budgetAccess='FULL', plus OWNER/ADMIN).
    // Fire-and-forget: don't block the response on email sending.
    (async () => {
      try {
        const approvers = await prisma.organizationMember.findMany({
          where: {
            organizationId: ctx.organizationId,
            OR: [
              { budgetAccess: 'FULL' as any },
              { role: 'OWNER' },
              { role: 'ADMIN' },
            ],
            userId: { not: ctx.user.id }, // don't email the submitter
          },
          select: {
            user: { select: { name: true, email: true } },
          },
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'https://onekof.com';
        const expenseUrl = `${baseUrl}/dashboard/budget`;

        await Promise.all(
          approvers
            .filter((m: any) => m.user?.email)
            .map((m: any) =>
              sendExpenseSubmittedEmail({
                to: m.user.email,
                approverName: m.user.name,
                submitterName: ctx.user.name || ctx.user.email,
                expenseTitle: description,
                amount: Number(amount),
                currency,
                budgetName: expense.budget?.project?.name || 'Budget',
                expenseUrl,
              })
            )
        );
      } catch (emailErr) {
        logger.error('Failed to notify budget approvers', {
          error: emailErr instanceof Error ? emailErr.message : emailErr,
          expenseId: expense.id,
        });
      }
    })();

    return NextResponse.json({
      expense,
      message: 'Expense submitted for approval',
    }, { status: 201 });
  } catch (error) {
    logger.error('Expense creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
