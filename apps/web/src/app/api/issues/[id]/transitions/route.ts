import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveAuthUser } from '@/lib/api-organization';
import { getAllowedTransitions, WORKFLOW_STATUSES, type TaskStatus } from '@/lib/workflow-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { status: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const currentStatus = task.status as TaskStatus;
    const allowed = getAllowedTransitions(currentStatus);

    return NextResponse.json({
      currentStatus,
      allowedTransitions: allowed.map(status => {
        const info = WORKFLOW_STATUSES.find(s => s.id === status);
        return {
          status,
          label: info?.label || status,
          color: info?.color || '#6B7280',
        };
      }),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get transitions' }, { status: 500 });
  }
}
