import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { autoWatchMentionedUsers, extractMentions, resolveMentionsToUserIds } from '@/lib/mention-parser';
import { logTaskActivity } from '@/lib/activity-logger';
import { sendMentionEmail } from '@/lib/email';
import { triggerAutomations } from '@/lib/automation-engine';
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

      // Email notification to mentioned users — fire-and-forget.
      // Resolves the same @mentions the auto-watch logic picked up, then
      // sends an email to each (skipping the author).
      (async () => {
        try {
          const mentions = extractMentions(content);
          if (mentions.length === 0) return;
          const mentionedUserIds = await resolveMentionsToUserIds(
            mentions,
            task.project!.organization!.id
          );
          if (mentionedUserIds.length === 0) return;

          const mentionedUsers = await prisma.user.findMany({
            where: {
              id: { in: mentionedUserIds.filter((id) => id !== user.id) },
            },
            select: { id: true, name: true, email: true },
          });

          const baseUrl = process.env.NEXTAUTH_URL || 'https://onekof.com';
          const taskUrl = `${baseUrl}/dashboard/issues?taskId=${params.id}`;
          const snippet = content.length > 200 ? content.slice(0, 200) + '…' : content;

          await Promise.all(
            mentionedUsers.map((u: any) =>
              sendMentionEmail({
                to: u.email,
                mentionedName: u.name,
                authorName: user.name || user.email,
                taskKey: task.key || 'Task',
                taskTitle: task.title || '',
                commentSnippet: snippet,
                taskUrl,
              })
            )
          );
        } catch (err) {
          logger.error('Failed to send mention emails', {
            error: err instanceof Error ? err.message : err,
            taskId: params.id,
          });
        }
      })();

      // Log comment activity
      logTaskActivity({
        organizationId: task.project.organization.id,
        userId: user.id,
        taskId: params.id,
        taskTitle: task.title || '',
        action: 'COMMENTED',
        metadata: { commentId: result.id, preview: content.slice(0, 100) },
      }).catch(() => {});

      // Fire COMMENTED automation trigger — fire-and-forget
      triggerAutomations({
        organizationId: task.project.organization.id,
        trigger: 'COMMENTED',
        entityType: 'TASK',
        entityId: params.id,
        projectId: task.projectId,
        userId: user.id,
      }).catch((err) => {
        logger.error('Automation trigger on comment failed', {
          error: err instanceof Error ? err.message : err,
          taskId: params.id,
        });
      });
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
