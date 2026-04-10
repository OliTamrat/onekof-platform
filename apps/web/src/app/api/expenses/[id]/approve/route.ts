import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { canApproveExpense, checkBudgetAccess } from '@/lib/budget-access';
import { BudgetAccess } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import { sendExpenseDecisionEmail } from '@/lib/email';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/expenses/[id]/approve
 * Approve or reject an expense
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

    // Get expense
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        budget: {
          select: { projectId: true }
        }
      }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'APPROVE' or 'REJECT'

    // Validate action
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    // Check if user can approve expenses
    const approvalCheck = await canApproveExpense(
      user.id,
      expense.budget.projectId,
      Number(expense.amount)
    );

    if (!approvalCheck.canApprove) {
      return NextResponse.json(
        { error: approvalCheck.reason || 'Cannot approve this expense' },
        { status: 403 }
      );
    }

    // Update expense
    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        approvedBy: user.id,
        approvedAt: new Date(),
        rejectionReason: action === 'REJECT' ? rejectionReason : null
      },
      include: {
        category: {
          select: {
            name: true,
            code: true
          }
        },
        budget: {
          select: {
            project: { select: { name: true } },
          },
        },
      }
    });

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
          decision: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          expenseTitle: updated.description,
          amount: Number(updated.amount),
          currency: updated.currency,
          budgetName: updated.budget?.project?.name || 'Budget',
          decidedByName: user.name || user.email,
          reason: action === 'REJECT' ? rejectionReason : null,
          expenseUrl: `${baseUrl}/dashboard/budget`,
        });
      } catch (emailErr) {
        logger.error('Failed to notify expense submitter', {
          error: emailErr instanceof Error ? emailErr.message : emailErr,
          expenseId: updated.id,
        });
      }
    })();

    return NextResponse.json({
      expense: updated,
      message: action === 'APPROVE'
        ? 'Expense approved successfully'
        : 'Expense rejected'
    });
  } catch (error) {
    logger.error('Expense approval error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to process expense' }, { status: 500 });
  }
}
