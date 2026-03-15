import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { ActivityLogger } from '@onekof/database/src/services/activity-logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/issues/[id]/watchers
 * Returns all watchers for an issue
 */
export async function GET(
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

    // Verify issue exists and user has access
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

    // Get all watchers with user details
    const watchers = await prisma.taskWatcher.findMany({
      where: {
        taskId: params.id,
      },
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
      orderBy: {
        addedAt: 'asc',
      },
    });

    return NextResponse.json({
      watchers: watchers.map(w => ({
        id: w.id,
        userId: w.userId,
        user: w.user,
        watchReason: w.watchReason,
        notifyOnComment: w.notifyOnComment,
        notifyOnStatusChange: w.notifyOnStatusChange,
        notifyOnAssignment: w.notifyOnAssignment,
        notifyOnPriorityChange: w.notifyOnPriorityChange,
        notifyOnDueDate: w.notifyOnDueDate,
        addedAt: w.addedAt,
        addedBy: w.addedBy,
      })),
    });
  } catch (error) {
    console.error('Watchers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues/[id]/watchers
 * Adds a watcher to an issue
 *
 * INNOVATION: Smart auto-watch with reason tracking
 * Jira just has "watch" - we track WHY they're watching
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

    // Parse request body
    const body = await request.json();
    const {
      userId,
      watchReason = 'MANUAL',
      notifyOnComment = true,
      notifyOnStatusChange = true,
      notifyOnAssignment = true,
      notifyOnPriorityChange = false,
      notifyOnDueDate = true,
    } = body;

    // If no userId provided, use current user
    const targetUserId = userId || currentUser.id;

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
            name: true,
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

    // Check if already watching
    const existing = await prisma.taskWatcher.findUnique({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: targetUserId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already watching this issue' },
        { status: 409 }
      );
    }

    // Create watcher
    const watcher = await prisma.taskWatcher.create({
      data: {
        taskId: params.id,
        userId: targetUserId,
        watchReason,
        notifyOnComment,
        notifyOnStatusChange,
        notifyOnAssignment,
        notifyOnPriorityChange,
        notifyOnDueDate,
        addedBy: currentUser.id,
      },
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

    // Log activity
    await ActivityLogger.log({
      userId: currentUser.id,
      organizationId: issue.project.organizationId,
      activityType: 'TASK_WATCHED',
      entityType: 'TASK',
      entityId: params.id,
      action: 'WATCH_ADDED',
      after: {
        watcherId: targetUserId,
        watchReason,
      },
      metadata: {
        addedByCurrentUser: targetUserId === currentUser.id,
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
    console.error('Add watcher error:', error);
    return NextResponse.json(
      { error: 'Failed to add watcher' },
      { status: 500 }
    );
  }
}
