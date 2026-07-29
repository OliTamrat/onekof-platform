import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { canApproveExpense } from '@/lib/budget-access';
import { authOptions } from '@/lib/auth';
import { sendExpenseDecisionEmail } from '@/lib/email';
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

    // Authorization. This route previously checked only that the caller was
    // signed in — not that they belonged to the expense's organization, let
    // alone that they could approve expenses. Any authenticated user of the
    // platform could reject any expense by id, across tenants, which marked
    // it REJECTED, stamped their name on it, wrote a budget revision and
    // emailed the submitter.
    //
    // /approve applies canApproveExpense to its APPROVE *and* REJECT actions,
    // so this standalone route uses exactly the same gate. Rejecting is a
    // destructive decision on someone else's money and is not the lighter
    // half of the pair.
    const approvalCheck = await canApproveExpense(
      user.id,
      expense.budget.projectId,
      Number(expense.amount)
    );

    if (!approvalCheck.canApprove) {
      return NextResponse.json(
        { error: approvalCheck.reason || 'Cannot reject this expense' },
        { status: 403 }
      );
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
          budget: { select: { project: { select: { name: true } } } },
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

    // Notify the submitter — fire-and-forget
    (async () => {
      try {
        const submitter = await prisma.user.findUnique({
          where: { id: expense.submittedBy },
          select: { name: true, email: true },
        });
        if (!submitter?.email) return;
        const baseUrl = process.env.NEXTAUTH_URL || 'https://onekof.com';
        await sendExpenseDecisionEmail({
          to: submitter.email,
          submitterName: submitter.name,
          decision: 'REJECTED',
          expenseTitle: rejectedExpense.description,
          amount: Number(rejectedExpense.amount),
          currency: rejectedExpense.currency,
          budgetName: rejectedExpense.budget?.project?.name || 'Budget',
          decidedByName: user.name || user.email,
          reason,
          expenseUrl: `${baseUrl}/dashboard/budget`,
        });
      } catch (emailErr) {
        logger.error('Failed to notify expense submitter of rejection', {
          error: emailErr instanceof Error ? emailErr.message : emailErr,
          expenseId: rejectedExpense.id,
        });
      }
    })();

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
