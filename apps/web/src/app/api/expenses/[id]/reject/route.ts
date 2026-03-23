import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/expenses/[id]/reject
 * Reject an expense
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
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        budget: true,
      },
    });

    if (!expense || expense.deletedAt) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending expenses can be rejected' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Calculate next revision number
    const lastRevision = await prisma.budgetRevision.findFirst({
      where: { budgetId: expense.budgetId },
      orderBy: { revisionNumber: 'desc' },
      select: { revisionNumber: true },
    });
    const nextRevisionNumber = (lastRevision?.revisionNumber || 0) + 1;

    // Reject expense and create revision
    const [rejectedExpense] = await prisma.$transaction([
      prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          approvedBy: user.id,
          approvedAt: new Date(),
          rejectionReason: reason,
        },
        include: {
          category: true,
        },
      }),
      prisma.budgetRevision.create({
        data: {
          budgetId: expense.budgetId,
          revisionNumber: nextRevisionNumber,
          changeType: 'EXPENSE_REJECTED',
          before: { status: expense.status, expenseId: expense.id },
          after: { status: 'REJECTED', rejectedBy: user.id, reason },
          changedBy: user.id,
          reason,
        },
      }),
    ]);

    // TODO: Send notification to submitter

    return NextResponse.json({
      expense: rejectedExpense,
      message: 'Expense rejected successfully',
    });
  } catch (error) {
    logger.error('Expense rejection error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to reject expense' },
      { status: 500 }
    );
  }
}
