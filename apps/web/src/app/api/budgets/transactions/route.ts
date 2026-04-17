import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budgets/transactions
 * List all expenses across org budgets as transactions (mobile-compatible via Bearer JWT)
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 200);
    const offset = Number(searchParams.get('offset') || '0');

    // Get all budget IDs for this org
    const orgBudgets = await prisma.budget.findMany({
      where: { project: { organizationId } },
      select: { id: true },
    });
    const budgetIds = orgBudgets.map((b) => b.id);

    if (budgetIds.length === 0) {
      return NextResponse.json({ transactions: [] });
    }

    // Fetch expenses across all org budgets
    const expenses = await prisma.expense.findMany({
      where: {
        budgetId: { in: budgetIds },
        deletedAt: null,
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
      skip: offset,
    });

    // Resolve submitter names in one query
    const userIds = [...new Set(expenses.map((e) => e.submittedBy))];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const transactions = expenses.map((e) => {
      const user = userMap.get(e.submittedBy);
      return {
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        type: 'EXPENSE' as const,
        category: e.category?.name || 'Uncategorized',
        date: e.transactionDate.toISOString(),
        createdBy: user ? { name: user.name || user.email } : null,
      };
    });

    return NextResponse.json({ transactions });
  } catch (err) {
    logger.error('Budget transactions error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
