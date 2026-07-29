import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveAuthUser } from '@/lib/api-organization';
import { requireTaskAccess } from '@/lib/security/authorization';
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
      select: { status: true, projectId: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Lower severity than the write routes — this only leaks a task's
    // existence and status — but it is the same missing check, and an
    // enumerable "does this id exist and what state is it in" endpoint is
    // still a disclosure. Scoped for the same reason as the others.
    //
    // requireTaskAccess rather than requireProjectAccess: for a care item,
    // "does this id exist and what state is it in" is precisely the question
    // a viewer without patient access must not be able to ask.
    const access = await requireTaskAccess(params.id, authUser.id);
    if (!access.authorized) return access.error!;

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
