import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, TaskLinkType } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Reciprocal link types for automatic bidirectional linking
const RECIPROCAL: Record<string, string> = {
  BLOCKS: 'IS_BLOCKED_BY',
  IS_BLOCKED_BY: 'BLOCKS',
  CLONES: 'IS_CLONED_BY',
  IS_CLONED_BY: 'CLONES',
  DUPLICATES: 'IS_DUPLICATED_BY',
  IS_DUPLICATED_BY: 'DUPLICATES',
  CAUSES: 'IS_CAUSED_BY',
  IS_CAUSED_BY: 'CAUSES',
  RELATES_TO: 'RELATES_TO',
};

/**
 * GET /api/tasks/[id]/links
 * List all links for a task (both directions)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify task access
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { project: { select: { organizationId: true } } },
    });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: task.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const links = await prisma.taskLink.findMany({
      where: { fromTaskId: params.id },
      include: {
        toTask: {
          select: {
            id: true,
            key: true,
            title: true,
            status: true,
            priority: true,
            project: { select: { id: true, name: true, key: true, color: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ links });
  } catch (error) {
    logger.error('Error fetching task links', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

/**
 * POST /api/tasks/[id]/links
 * Create a task link. Body: { toTaskId: string, type: TaskLinkType }
 * Automatically creates reciprocal link for bidirectional types.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { toTaskId, type } = body;

    if (!toTaskId || !type) {
      return NextResponse.json({ error: 'toTaskId and type required' }, { status: 400 });
    }

    if (toTaskId === params.id) {
      return NextResponse.json({ error: 'Cannot link task to itself' }, { status: 400 });
    }

    // Verify both tasks exist and belong to the same organization
    const [fromTask, toTask] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.id },
        select: { id: true, project: { select: { organizationId: true } } },
      }),
      prisma.task.findUnique({
        where: { id: toTaskId },
        select: { id: true, project: { select: { organizationId: true } } },
      }),
    ]);

    if (!fromTask || !toTask) {
      return NextResponse.json({ error: 'One or both tasks not found' }, { status: 404 });
    }

    if (fromTask.project.organizationId !== toTask.project.organizationId) {
      return NextResponse.json({ error: 'Cannot link tasks across organizations' }, { status: 400 });
    }

    // Verify user has org access
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: fromTask.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Create forward link
    const link = await prisma.taskLink.upsert({
      where: {
        fromTaskId_toTaskId_type: {
          fromTaskId: params.id,
          toTaskId,
          type: type as TaskLinkType,
        },
      },
      create: {
        fromTaskId: params.id,
        toTaskId,
        type: type as TaskLinkType,
        createdById: session.user.id,
      },
      update: {},
    });

    // Create reciprocal link
    const reciprocalType = RECIPROCAL[type];
    if (reciprocalType) {
      await prisma.taskLink.upsert({
        where: {
          fromTaskId_toTaskId_type: {
            fromTaskId: toTaskId,
            toTaskId: params.id,
            type: reciprocalType as TaskLinkType,
          },
        },
        create: {
          fromTaskId: toTaskId,
          toTaskId: params.id,
          type: reciprocalType as TaskLinkType,
          createdById: session.user.id,
        },
        update: {},
      });
    }

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    logger.error('Error creating task link', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]/links?linkId=xxx
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const linkId = request.nextUrl.searchParams.get('linkId');
    if (!linkId) return NextResponse.json({ error: 'linkId required' }, { status: 400 });

    const link = await prisma.taskLink.findUnique({
      where: { id: linkId },
      include: { fromTask: { select: { project: { select: { organizationId: true } } } } },
    });
    if (!link || link.fromTaskId !== params.id) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: link.fromTask.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Delete forward and reciprocal
    await prisma.taskLink.delete({ where: { id: linkId } });
    const reciprocalType = RECIPROCAL[link.type];
    if (reciprocalType) {
      await prisma.taskLink.deleteMany({
        where: {
          fromTaskId: link.toTaskId,
          toTaskId: link.fromTaskId,
          type: reciprocalType as TaskLinkType,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting task link', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
