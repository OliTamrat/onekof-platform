import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { ActivityLogger } from '@onekof/database/src/services/activity-logger';

/**
 * DELETE /api/issues/[id]/watchers/[userId]
 * Removes a watcher from an issue
 *
 * INNOVATION: Smart unwatch with reason tracking
 * Tracks who removed whom and why
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify issue exists
    const issue = await prisma.task.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            organizationId: true,
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

    // Get the watcher record
    const watcher = await prisma.taskWatcher.findUnique({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: params.userId,
        },
      },
    });

    if (!watcher) {
      return NextResponse.json(
        { error: 'Watcher not found' },
        { status: 404 }
      );
    }

    // Only allow removing yourself OR if you're an admin/owner
    // TODO: Add proper role checking here
    const canRemove =
      params.userId === currentUser.id || // Removing yourself
      issue.reporterId === currentUser.id; // Issue creator

    if (!canRemove) {
      return NextResponse.json(
        { error: 'You can only remove yourself as a watcher' },
        { status: 403 }
      );
    }

    // Delete the watcher
    await prisma.taskWatcher.delete({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: params.userId,
        },
      },
    });

    // Log activity
    await ActivityLogger.log({
      userId: currentUser.id,
      organizationId: issue.project.organizationId,
      activityType: 'TASK_UNWATCHED',
      entityType: 'TASK',
      entityId: params.id,
      action: 'WATCH_REMOVED',
      before: {
        watcherId: params.userId,
        watchReason: watcher.watchReason,
      },
      metadata: {
        removedSelf: params.userId === currentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Watcher removed successfully',
    });
  } catch (error) {
    console.error('Remove watcher error:', error);
    return NextResponse.json(
      { error: 'Failed to remove watcher' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/issues/[id]/watchers/[userId]
 * Updates watcher notification preferences
 *
 * INNOVATION: Granular notification control (beats Jira's all-or-nothing)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow updating your own preferences
    if (params.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'You can only update your own notification preferences' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      notifyOnComment,
      notifyOnStatusChange,
      notifyOnAssignment,
      notifyOnPriorityChange,
      notifyOnDueDate,
    } = body;

    // Build update data
    const updateData: any = {};
    if (notifyOnComment !== undefined) updateData.notifyOnComment = notifyOnComment;
    if (notifyOnStatusChange !== undefined) updateData.notifyOnStatusChange = notifyOnStatusChange;
    if (notifyOnAssignment !== undefined) updateData.notifyOnAssignment = notifyOnAssignment;
    if (notifyOnPriorityChange !== undefined) updateData.notifyOnPriorityChange = notifyOnPriorityChange;
    if (notifyOnDueDate !== undefined) updateData.notifyOnDueDate = notifyOnDueDate;

    // Update watcher preferences
    const watcher = await prisma.taskWatcher.update({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: params.userId,
        },
      },
      data: updateData,
      include: {
        user: {
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
      watcher: {
        id: watcher.id,
        userId: watcher.userId,
        user: watcher.user,
        watchReason: watcher.watchReason,
        notifyOnComment: watcher.notifyOnComment,
        notifyOnStatusChange: watcher.notifyOnStatusChange,
        notifyOnAssignment: watcher.notifyOnAssignment,
        notifyOnPriorityChange: watcher.notifyOnPriorityChange,
        notifyOnDueDate: watcher.notifyOnDueDate,
        addedAt: watcher.addedAt,
        addedBy: watcher.addedBy,
      },
    });
  } catch (error) {
    console.error('Update watcher preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update watcher preferences' },
      { status: 500 }
    );
  }
}
