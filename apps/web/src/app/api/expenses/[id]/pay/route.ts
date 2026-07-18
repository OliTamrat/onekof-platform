import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireExpenseAccess } from '@/lib/security/authorization';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = await requireExpenseAccess(params.id, session.user.id, 'approve');
    if (!auth.authorized) return auth.error!;

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
      include: { budget: { select: { id: true } } },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved expenses can be marked as paid' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const lastRevision = await prisma.budgetRevision.findFirst({
      where: { budgetId: expense.budgetId },
      orderBy: { revisionNumber: 'desc' },
      select: { revisionNumber: true },
    });

    await prisma.$transaction([
      prisma.expense.update({
        where: { id: params.id },
        data: {
          status: 'PAID' as any,
          paymentStatus: 'PAID' as any,
          paidDate: new Date(),
          paymentMethod: body.paymentMethod || null,
        },
      }),
      prisma.budgetRevision.create({
        data: {
          budgetId: expense.budgetId,
          revisionNumber: (lastRevision?.revisionNumber || 0) + 1,
          changeType: 'EXPENSE_PAID',
          before: { status: 'APPROVED' },
          after: { status: 'PAID', paymentMethod: body.paymentMethod },
          reason: body.reason || 'Payment confirmed',
          changedBy: session.user.id,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Expense marked as paid' });
  } catch (error) {
    logger.error('Mark expense as paid error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to mark as paid' }, { status: 500 });
  }
}
