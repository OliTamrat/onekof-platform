import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/expenses/[id]
 * Get expense details
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
    console.error('Expense fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/expenses/[id]
 * Update expense
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

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        budget: true,
      },
    });

    if (!expense || expense.deletedAt) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions: Can only edit if:
    // - Status is DRAFT or REJECTED
    // - User is submitter or budget manager/admin
    const canEdit =
      expense.submittedBy === user.id &&
      (expense.status === 'PENDING' || expense.status === 'REJECTED');

    // TODO: Add check for budget manager/admin role

    if (!canEdit) {
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
        revisionNumber: 1, // TODO: Calculate
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
    console.error('Expense update error:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * Soft delete expense
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

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: {
        budget: true,
      },
    });

    if (!expense || expense.deletedAt) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Check permissions: Can only delete if:
    // - Expense is not PAID
    // - User is submitter or budget manager/admin
    if (expense.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid expenses' },
        { status: 403 }
      );
    }

    const canDelete = expense.submittedBy === user.id;
    // TODO: Add check for budget manager/admin role

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason');

    // Create revision record
    await prisma.budgetRevision.create({
      data: {
        budgetId: expense.budgetId,
        revisionNumber: 1, // TODO: Calculate
        changeType: 'EXPENSE_DELETED',
        before: expense,
        after: null,
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
    console.error('Expense deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
