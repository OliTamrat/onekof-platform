import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma, Prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import { requireAuth, requireExpenseAccess } from '@/lib/security/authorization';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/expenses/[id]
 * Get expense details
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user has access to expense
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // SECURITY FIX: Verify user has access to read this expense
    const expenseAuthResult = await requireExpenseAccess(params.id, user.id, 'read');
    if (!expenseAuthResult.authorized) {
      return expenseAuthResult.error!;
    }

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        budget: {
          select: {
            id: true,
            totalBudget: true,
            project: {
              select: {
                id: true,
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
            allocatedAmount: true,
          },
        },
        attachments: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!expense || expense.deletedAt) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    log.error('Expense fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update expense
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user can update expense
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
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

    // SECURITY FIX: Verify user can update this expense
    // requireExpenseAccess checks if user is submitter or has approval permission
    const expenseAuthResult = await requireExpenseAccess(params.id, user.id, 'update');
    if (!expenseAuthResult.authorized) {
      return expenseAuthResult.error!;
    }

    // Additional business logic: Check expense status
    if (expense.status === 'APPROVED' || expense.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot edit approved or paid expenses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      description,
      amount,
      categoryId,
      transactionDate,
      invoiceNumber,
      vendor,
      notes,
    } = body;

    // Build update data
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (transactionDate !== undefined) updateData.transactionDate = new Date(transactionDate);
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (notes !== undefined) updateData.notes = notes;

    // Create revision record
    await prisma.budgetRevision.create({
      data: {
        budgetId: expense.budgetId,
        revisionNumber: await prisma.budgetRevision.count({ where: { budgetId: expense.budgetId } }) + 1,
        changeType: 'EXPENSE_UPDATED',
        before: expense,
        after: { ...expense, ...updateData },
        changedBy: user.id,
        reason: 'Expense edited by submitter',
      },
    });

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        attachments: true,
      },
    });

    return NextResponse.json({
      expense: updatedExpense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    log.error('Expense update error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * Soft delete expense
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user can delete expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
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

    // SECURITY FIX: Verify user can update/delete this expense
    // requireExpenseAccess with 'update' action checks if user is submitter or has approval permission
    const expenseAuthResult = await requireExpenseAccess(params.id, user.id, 'update');
    if (!expenseAuthResult.authorized) {
      return expenseAuthResult.error!;
    }

    // Additional business logic: Cannot delete paid expenses
    if (expense.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid expenses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');

    // Create revision record
    await prisma.budgetRevision.create({
      data: {
        budgetId: expense.budgetId,
        revisionNumber: await prisma.budgetRevision.count({ where: { budgetId: expense.budgetId } }) + 1,
        changeType: 'EXPENSE_DELETED',
        before: expense,
        after: Prisma.JsonNull,
        changedBy: user.id,
        reason: reason || 'Expense deleted by submitter',
      },
    });

    // Soft delete
    await prisma.expense.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    log.error('Expense deletion error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
