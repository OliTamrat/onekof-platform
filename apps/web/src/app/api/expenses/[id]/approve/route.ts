import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { canApproveExpense, checkBudgetAccess } from '@/lib/budget-access';
import { BudgetAccess } from '@prisma/client';
import { authOptions } from '@/lib/auth';

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
        }
      }
    });

    return NextResponse.json({
      expense: updated,
      message: action === 'APPROVE'
        ? 'Expense approved successfully'
        : 'Expense rejected'
    });
  } catch (error) {
    console.error('Expense approval error:', error);
    return NextResponse.json({ error: 'Failed to process expense' }, { status: 500 });
  }
}
