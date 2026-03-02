import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';

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
      },
    });

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      issue,
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
