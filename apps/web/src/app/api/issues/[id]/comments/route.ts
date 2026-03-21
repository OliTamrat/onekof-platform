import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { autoWatchMentionedUsers } from '@/lib/mention-parser';
import { logTaskActivity } from '@/lib/activity-logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/issues/[id]/comments
 * Creates a new comment on an issue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create comment and auto-watch in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the comment
      const comment = await tx.comment.create({
        data: {
          content,
          taskId: params.id,
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Smart Auto-Watch: User who comments automatically watches the task
      await tx.taskWatcher.upsert({
        where: {
          taskId_userId: {
            taskId: params.id,
            userId: user.id,
          },
        },
        create: {
          taskId: params.id,
          userId: user.id,
          watchReason: 'AUTO_PARTICIPATED',
          addedBy: user.id,
        },
        update: {}, // Keep existing preferences if already watching
      });

      return comment;
    });

    // Smart Auto-Watch: Parse @mentions in comment content
    // Get organization ID from task's project
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            organization: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (task?.project?.organization) {
      await autoWatchMentionedUsers(
        params.id,
        content,
        task.project.organization.id,
        user.id
      ).catch(err => {
        logger.error('Auto-watch mentioned users in comment error', { error: err instanceof Error ? err.message : err });
      });

      // Log comment activity
      logTaskActivity({
        organizationId: task.project.organization.id,
        userId: user.id,
        taskId: params.id,
        taskTitle: task.title || '',
        action: 'COMMENTED',
        metadata: { commentId: result.id, preview: content.slice(0, 100) },
      }).catch(() => {});
    }

    return NextResponse.json({
      comment: result,
    }, { status: 201 });
  } catch (error) {
    logger.error('Comment creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
