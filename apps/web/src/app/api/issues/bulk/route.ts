import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { checkRateLimit } from '@/lib/security/rate-limit';
import logger from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bulkUpdateSchema = z.object({
  issueIds: z.array(z.string()).min(1, 'At least one issue ID required').max(100, 'Maximum 100 issues per batch'),
  action: z.enum(['updateStatus', 'updatePriority', 'updateAssignee', 'delete']),
  value: z.string().optional(),
});

/**
 * POST /api/issues/bulk
 * Performs bulk operations on multiple issues at once.
 * Supports: status change, priority change, assignee change, soft delete.
 * Max 100 issues per request.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(request, 'dataMutation');
    if (rateLimitError) return rateLimitError;

    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await request.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { issueIds, action, value } = validation.data;

    const issues = await prisma.task.findMany({
      where: {
        id: { in: issueIds },
        deletedAt: null,
        project: { organizationId: ctx.organizationId },
      },
      select: { id: true, projectId: true, status: true },
    });

    if (issues.length === 0) {
      return NextResponse.json(
        { error: 'No accessible issues found' },
        { status: 404 }
      );
    }

    const accessibleIds = issues.map(i => i.id);
    let updated = 0;

    switch (action) {
      case 'updateStatus': {
        if (!value) {
          return NextResponse.json({ error: 'Status value required' }, { status: 400 });
        }
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: {
            status: value as any,
            completedAt: value === 'DONE' ? new Date() : null,
          },
        });
        updated = result.count;
        break;
      }

      case 'updatePriority': {
        if (!value) {
          return NextResponse.json({ error: 'Priority value required' }, { status: 400 });
        }
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { priority: value as any },
        });
        updated = result.count;
        break;
      }

      case 'updateAssignee': {
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { assigneeId: value || null },
        });
        updated = result.count;
        break;
      }

      case 'delete': {
        const result = await prisma.task.updateMany({
          where: { id: { in: accessibleIds } },
          data: { deletedAt: new Date() },
        });
        updated = result.count;
        break;
      }
    }

    logger.info('Bulk operation completed', {
      action,
      requested: issueIds.length,
      accessible: accessibleIds.length,
      updated,
      userId: ctx.user.id,
      organizationId: ctx.organizationId,
    });

    return NextResponse.json({
      success: true,
      action,
      requested: issueIds.length,
      updated,
      skipped: issueIds.length - accessibleIds.length,
    });
  } catch (error) {
    logger.error('Bulk operation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
