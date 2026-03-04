import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { handleTaskStatusChange } from '@/lib/progress-aggregation';
import { autoWatchMentionedUsers } from '@/lib/mention-parser';

/**
 * GET /api/issues/[id]
 * Returns a single issue with detailed information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get issue with all details
    const issue = await prisma.task.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
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
        comments: {
          where: {
            deletedAt: null,
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
          orderBy: {
            createdAt: 'asc',
          },
        },
        attachments: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        watchers: {
          select: {
            userId: true,
          },
        },
        goals: {
          include: {
            goal: {
              select: {
                id: true,
                title: true,
                status: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Get subtasks (tasks with parentId matching this task's id)
    const subtasks = await prisma.task.findMany({
      where: {
        parentId: params.id,
        deletedAt: null,
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate subtask completion percentage
    const completedSubtasks = subtasks.filter(st => st.status === 'DONE').length;
    const subtaskProgress = subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : 0;

    return NextResponse.json({
      issue: {
        ...issue,
        subtasks,
        subtaskProgress,
        commentCount: issue.comments.length,
        attachmentCount: issue.attachments.length,
      },
    });
  } catch (error) {
    console.error('Issue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/issues/[id]
 * Updates an issue
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the current issue to check if assignee has changed
    const currentIssue = await prisma.task.findUnique({
      where: { id: params.id },
      select: { assigneeId: true },
    });

    if (!currentIssue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      estimate,
      timeSpent,
      parentId,
    } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) {
      updateData.status = status;
      // Set completedAt when status changes to DONE
      if (status === 'DONE') {
        updateData.completedAt = new Date();
      } else if (status !== 'DONE') {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (labels !== undefined) updateData.labels = labels;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (estimate !== undefined) updateData.estimate = estimate;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (parentId !== undefined) updateData.parentId = parentId;

    // Update issue
    const issue = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
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
        comments: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
        attachments: {
          select: {
            id: true,
          },
        },
      },
    });

    // Smart Auto-Watch: If assignee changed and there's a new assignee, auto-add them as watcher
    if (assigneeId !== undefined && assigneeId !== null && assigneeId !== currentIssue.assigneeId) {
      try {
        await prisma.taskWatcher.upsert({
          where: {
            taskId_userId: {
              taskId: params.id,
              userId: assigneeId,
            },
          },
          create: {
            taskId: params.id,
            userId: assigneeId,
            watchReason: 'AUTO_ASSIGNED',
            addedBy: currentUser.id,
          },
          update: {}, // Keep existing preferences if already watching
        });
      } catch (watcherError) {
        // Don't fail the update if watcher creation fails
        console.error('Auto-watch on assignment error:', watcherError);
      }
    }

    // Smart Auto-Watch: Parse @mentions in description/title if updated
    if (description !== undefined || title !== undefined) {
      // Get organization ID for mention resolution
      const projectWithOrg = await prisma.project.findUnique({
        where: { id: issue.projectId },
        select: {
          organization: {
            select: { id: true },
          },
        },
      });

      if (projectWithOrg?.organization) {
        const contentToCheck = `${title || ''} ${description || ''}`;
        await autoWatchMentionedUsers(
          params.id,
          contentToCheck,
          projectWithOrg.organization.id,
          currentUser.id
        ).catch(err => {
          console.error('Auto-watch mentioned users error:', err);
        });
      }
    }

    // If status was changed, trigger progress aggregation
    if (status !== undefined) {
      // Run in background to avoid blocking the response
      handleTaskStatusChange(params.id, issue.projectId).catch(err => {
        console.error('Progress aggregation error:', err);
      });
    }

    return NextResponse.json({
      issue: {
        ...issue,
        commentCount: issue.comments.length,
        attachmentCount: issue.attachments.length,
        comments: undefined,
        attachments: undefined,
      },
    });
  } catch (error) {
    console.error('Issue update error:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/issues/[id]
 * Soft deletes an issue
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete issue (set deletedAt)
    await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error('Issue deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
