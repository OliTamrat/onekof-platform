import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/issues/[id]/subtasks
 * Creates a new subtask for an issue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, assigneeId, status, priority } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get parent task to get project info
    const parentTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            tasks: {
              where: {
                deletedAt: null,
              },
              select: { key: true },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!parentTask) {
      return NextResponse.json(
        { error: 'Parent task not found' },
        { status: 404 }
      );
    }

    // Generate next issue key
    let nextNumber = 1;
    if (parentTask.project.tasks.length > 0) {
      const lastKey = parentTask.project.tasks[0].key;
      const lastNumber = parseInt(lastKey.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    const issueKey = `${parentTask.project.key}-${nextNumber}`;

    // Create subtask
    const subtask = await prisma.task.create({
      data: {
        key: issueKey,
        title,
        description: description || null,
        type: 'SUBTASK',
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId: parentTask.projectId,
        parentId: params.id,
        assigneeId: assigneeId || null,
        reporterId: authUser.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      subtask,
    }, { status: 201 });
  } catch (error) {
    logger.error('Subtask creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}
