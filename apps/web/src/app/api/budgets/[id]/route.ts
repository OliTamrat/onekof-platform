import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/budgets/[id]
 * Get detailed budget information
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

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            key: true,
          },
        },
        categories: {
          include: {
            expenses: {
              where: {
                deletedAt: null,
              },
              include: {
                attachments: true,
              },
              orderBy: {
                transactionDate: 'desc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        watchers: {
          include: {
            // TODO: Add user relation when available
          },
        },
        expenses: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            transactionDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Calculate statistics
    const stats = {
      totalAllocated: budget.categories.reduce(
        (sum, cat) => sum + Number(cat.allocatedAmount),
        0
      ),
      totalSpent: 0,
      totalPending: 0,
      totalApproved: 0,
      categoryStats: budget.categories.map(category => {
        const spent = category.expenses
          .filter(e => e.status === 'APPROVED' || e.status === 'PAID')
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        const pending = category.expenses
          .filter(e => e.status === 'PENDING')
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        return {
          categoryId: category.id,
          name: category.name,
          allocated: Number(category.allocatedAmount),
          spent,
          pending,
          remaining: Number(category.allocatedAmount) - spent,
          utilization: (spent / Number(category.allocatedAmount)) * 100,
        };
      }),
    };

    stats.totalSpent = stats.categoryStats.reduce((sum, cat) => sum + cat.spent, 0);
    stats.totalPending = stats.categoryStats.reduce((sum, cat) => sum + cat.pending, 0);

    return NextResponse.json({
      budget: {
        ...budget,
        stats,
      },
    });
  } catch (error) {
    console.error('Budget fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/budgets/[id]
 * Update budget
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { totalBudget, status, fiscalYearStart, fiscalYearEnd, settings } = body;

    // Get current budget for audit trail
    const currentBudget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!currentBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget;
    if (status !== undefined) updateData.status = status;
    if (fiscalYearStart !== undefined) updateData.fiscalYearStart = new Date(fiscalYearStart);
    if (fiscalYearEnd !== undefined) updateData.fiscalYearEnd = new Date(fiscalYearEnd);
    if (settings !== undefined) updateData.settings = settings;

    // Update budget and create revision
    const [updatedBudget] = await prisma.$transaction([
      prisma.budget.update({
        where: { id: params.id },
        data: updateData,
        include: {
          categories: true,
        },
      }),
      // Create revision record
      prisma.budgetRevision.create({
        data: {
          budgetId: params.id,
          revisionNumber: 1, // TODO: Calculate actual revision number
          changeType: 'BUDGET_UPDATED',
          before: currentBudget,
          after: { ...currentBudget, ...updateData },
          changedBy: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      budget: updatedBudget,
      message: 'Budget updated successfully',
    });
  } catch (error) {
    console.error('Budget update error:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete budget (requires confirmation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if budget has expenses
    const expenseCount = await prisma.expense.count({
      where: {
        budgetId: params.id,
        deletedAt: null,
      },
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete budget with existing expenses. Archive it instead.' },
        { status: 400 }
      );
    }

    // Delete budget (cascade will delete categories)
    await prisma.budget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Budget deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
