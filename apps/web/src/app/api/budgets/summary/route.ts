import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budgets/summary
 * Aggregate budget totals across all org budgets (mobile-compatible via Bearer JWT)
 */
export async function GET() {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    // Fetch all budgets for the org with their approved expenses
    const budgets = await prisma.budget.findMany({
      where: { project: { organizationId } },
      select: {
        totalBudget: true,
        expenses: {
          where: { deletedAt: null, status: 'APPROVED' },
          select: { amount: true },
        },
      },
    });

    let totalBudget = 0;
    let totalSpent = 0;

    for (const b of budgets) {
      totalBudget += Number(b.totalBudget);
      for (const exp of b.expenses) {
        totalSpent += Number(exp.amount);
      }
    }

    // Income = totalBudget (allocated funds). Remaining = budget - spent.
    return NextResponse.json({
      totalBudget,
      totalSpent,
      totalIncome: totalBudget,
      remaining: totalBudget - totalSpent,
    });
  } catch (err) {
    logger.error('Budget summary error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to fetch budget summary' }, { status: 500 });
  }
}
