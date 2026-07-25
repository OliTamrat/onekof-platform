import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { updateSprintSchema } from '@/lib/validation/schemas';
import { logActivity } from '@/lib/activity-logger';
import { logOrgAction, OrgActions } from '@/lib/security/org-audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

async function loadSprint(id: string) {
  return prisma.sprint.findFirst({
    where: { id, deletedAt: null },
    include: { project: { select: { organizationId: true, name: true } } },
  });
}

/**
 * PATCH /api/sprints/[id]
 * Edit name/goal/dates/position. COMPLETED sprints are immutable —
 * their snapshots are historical record.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;
    const userId = auth.session.user.id;

    const sprint = await loadSprint(params.id);
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, userId, 'MEMBER');
    if (!access.authorized) return access.error;

    if (sprint.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Completed sprints cannot be edited' },
        { status: 409 }
      );
    }

    const parsed = updateSprintSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid sprint payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, goal, startDate, endDate, position } = parsed.data;
    const updated = await prisma.sprint.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(goal !== undefined && { goal }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(position !== undefined && { position }),
      },
    });

    logActivity({
      organizationId: sprint.project.organizationId,
      userId,
      entityType: 'SPRINT',
      entityId: sprint.id,
      action: 'UPDATED',
      metadata: { changes: parsed.data },
    });

    return NextResponse.json({ sprint: updated });
  } catch (error) {
    logger.error('Error updating sprint', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/sprints/[id]
 * Soft delete, PLANNED sprints only (ACTIVE must be completed; COMPLETED is
 * history). Tasks return to the backlog — never destroyed with the sprint.
 * Project ADMIN+ only; org-audited as a destructive action.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;
    const userId = auth.session.user.id;

    const sprint = await loadSprint(params.id);
    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    const access = await requireProjectAccess(sprint.projectId, userId, 'ADMIN');
    if (!access.authorized) return access.error;

    if (sprint.status !== 'PLANNED') {
      return NextResponse.json(
        { error: 'Only planned sprints can be deleted. Complete an active sprint instead.' },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      // Soft delete keeps the FK intact, so explicitly return tasks to backlog
      prisma.task.updateMany({
        where: { sprintId: params.id },
        data: { sprintId: null, sprintOrder: null },
      }),
      prisma.sprint.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      }),
    ]);

    logActivity({
      organizationId: sprint.project.organizationId,
      userId,
      entityType: 'SPRINT',
      entityId: sprint.id,
      action: 'DELETED',
      metadata: { projectId: sprint.projectId, name: sprint.name },
    });

    logOrgAction({
      organizationId: sprint.project.organizationId,
      actorId: userId,
      actorEmail: auth.session.user.email || '',
      actorRole: access.membership?.role || 'MEMBER',
      action: OrgActions.SPRINT_DELETED,
      resource: 'sprint',
      resourceId: sprint.id,
      resourceName: sprint.name,
      before: { status: sprint.status, projectId: sprint.projectId },
      request: req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting sprint', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
