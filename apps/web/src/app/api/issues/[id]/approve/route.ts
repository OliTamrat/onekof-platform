import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { requireTaskAccess } from '@/lib/security/authorization';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { logActivity } from '@/lib/activity-logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Board approval — the sign-off between review and completion.
 *
 * Approval is a recorded fact on the task rather than a new status. A new
 * TaskStatus value would ripple through every board column, filter and the
 * mobile app; a (who, when) pair plus a gate on the DONE transition delivers
 * the same workflow with none of that blast radius, and produces the audit
 * record — who approved, exactly when — that a status column never could.
 *
 * Approving is allowed even when the project does not require it: a recorded
 * sign-off is never wrong to have. The gate in the issue PATCH route is what
 * the setting controls.
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requireTaskAccess(params.id, ctx.user.id);
    if (!access.authorized) return access.error!;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { status: true, projectId: true, approvedBy: true, approvedAt: true },
    });
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [effective, approver] = await Promise.all([
      resolveProjectSettings(task.projectId),
      task.approvedBy
        ? prisma.user.findUnique({
            where: { id: task.approvedBy },
            select: { id: true, name: true, email: true },
          })
        : null,
    ]);

    return NextResponse.json({
      requireApproval: effective?.requireApproval ?? false,
      status: task.status,
      approval: task.approvedAt
        ? { approvedAt: task.approvedAt, approver }
        : null,
    });
  } catch (err) {
    logger.error('Approval state error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to load approval state' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimited = await checkRateLimit(request, 'dataMutation');
    if (rateLimited) return rateLimited;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Approval is a project-admin act. requireTaskAccess with ADMIN also
    // covers org admins/owners through the project-access ladder.
    const access = await requireTaskAccess(params.id, ctx.user.id, 'ADMIN');
    if (!access.authorized) return access.error!;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { status: true, approvedAt: true },
    });
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Approval means "the review passed", so it can only be granted while the
    // task is actually in review. Approving TODO work would let the gate be
    // pre-satisfied before anyone had anything to review.
    if (task.status !== 'IN_REVIEW') {
      return NextResponse.json(
        { error: 'Only items in review can be approved' },
        { status: 409 }
      );
    }
    if (task.approvedAt) {
      return NextResponse.json({ error: 'Already approved' }, { status: 409 });
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: { approvedBy: ctx.user.id, approvedAt: new Date() },
      select: { approvedAt: true },
    });

    logActivity({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      entityType: 'TASK',
      action: 'UPDATED',
      entityId: params.id,
      metadata: { approval: 'granted' },
    }).catch(() => {});

    return NextResponse.json({
      approval: {
        approvedAt: updated.approvedAt,
        approver: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email },
      },
    });
  } catch (err) {
    logger.error('Approve error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const access = await requireTaskAccess(params.id, ctx.user.id, 'ADMIN');
    if (!access.authorized) return access.error!;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { status: true, approvedAt: true },
    });
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!task.approvedAt) {
      return NextResponse.json({ error: 'Not approved' }, { status: 409 });
    }

    // Revocation is only meaningful before the approval has been consumed —
    // once the task is DONE, the record is history, and history is corrected
    // by reopening the task (which clears the approval), not by editing it.
    if (task.status === 'DONE') {
      return NextResponse.json(
        { error: 'Reopen the item to withdraw a consumed approval' },
        { status: 409 }
      );
    }

    await prisma.task.update({
      where: { id: params.id },
      data: { approvedBy: null, approvedAt: null },
    });

    logActivity({
      organizationId: ctx.organizationId,
      userId: ctx.user.id,
      entityType: 'TASK',
      action: 'UPDATED',
      entityId: params.id,
      metadata: { approval: 'revoked' },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error('Revoke approval error', { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: 'Failed to revoke approval' }, { status: 500 });
  }
}
