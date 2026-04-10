import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { handleTaskStatusChange } from '@/lib/progress-aggregation';
import { autoWatchMentionedUsers } from '@/lib/mention-parser';
import { authOptions } from '@/lib/auth';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { log } from '@/lib/logger';
import { logTaskActivity } from '@/lib/activity-logger';
import { sendTaskAssignmentEmail } from '@/lib/email';
import { triggerAutomations, type TriggerEvent } from '@/lib/automation-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/issues/[id]
 * Returns a single issue with detailed information
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user has access to issue's project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get issue to verify project access
    const issue = await prisma.task.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      select: {
        projectId: true,
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // SECURITY FIX: Verify user has access to the issue's project
    const projectAuthResult = await requireProjectAccess(issue.projectId, user.id);
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
    }

    // Get issue with all details
    const issueDetailed = await prisma.task.findUnique({
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
      },
    });

    if (!issueDetailed) {
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
        ...issueDetailed,
        subtasks,
        subtaskProgress,
        commentCount: issueDetailed.comments.length,
        attachmentCount: issueDetailed.attachments.length,
      },
    });
  } catch (error) {
    log.error('Issue fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/issues/[id]
 * Updates an issue
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user can edit issue's project
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the current issue to check project access and track changes
    const currentIssue = await prisma.task.findUnique({
      where: { id: params.id },
      select: { assigneeId: true, projectId: true, status: true, priority: true, title: true },
    });

    if (!currentIssue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // SECURITY FIX: Verify user has MEMBER permission to edit this issue's project
    const projectAuthResult = await requireProjectAccess(currentIssue.projectId, currentUser.id, 'MEMBER');
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
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
      backlogOrder,
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
    if (backlogOrder !== undefined) updateData.backlogOrder = backlogOrder;

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
        log.error('Auto-watch on assignment error', { error: watcherError instanceof Error ? watcherError.message : watcherError });
      }

      // Email the new assignee — fire-and-forget, skip if assigning to self
      if (assigneeId !== currentUser.id) {
        (async () => {
          try {
            const newAssignee = await prisma.user.findUnique({
              where: { id: assigneeId },
              select: { name: true, email: true },
            });
            if (!newAssignee?.email) return;

            const baseUrl = process.env.NEXTAUTH_URL || 'https://onekof.com';
            const taskUrl = `${baseUrl}/dashboard/issues?taskId=${params.id}`;

            await sendTaskAssignmentEmail({
              to: newAssignee.email,
              assigneeName: newAssignee.name,
              assignerName: currentUser.name || currentUser.email,
              taskKey: issue.key,
              taskTitle: issue.title,
              taskDescription: issue.description,
              priority: issue.priority,
              dueDate: issue.dueDate,
              taskUrl,
            });
          } catch (emailErr) {
            log.error('Failed to send task assignment email', {
              error: emailErr instanceof Error ? emailErr.message : emailErr,
              taskId: params.id,
            });
          }
        })();
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
          log.error('Auto-watch mentioned users error', { error: err instanceof Error ? err.message : err });
        });
      }
    }

    // If status was changed, trigger progress aggregation
    if (status !== undefined) {
      // Run in background to avoid blocking the response
      handleTaskStatusChange(params.id, issue.projectId).catch(err => {
        log.error('Progress aggregation error', { error: err instanceof Error ? err.message : err });
      });
    }

    // Log activity for significant changes (non-blocking)
    const projectWithOrg2 = await prisma.project.findUnique({
      where: { id: issue.projectId },
      select: { organization: { select: { id: true } } },
    });

    if (projectWithOrg2?.organization) {
      const orgId = projectWithOrg2.organization.id;

      if (status !== undefined && status !== currentIssue.status) {
        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: issue.project?.key ? `${issue.project.key}-${currentIssue.title}` : currentIssue.title || '',
          action: 'UPDATED',
          metadata: { field: 'status', from: currentIssue.status, to: status },
        }).catch(() => {});
      }

      if (priority !== undefined && priority !== currentIssue.priority) {
        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: currentIssue.title || '',
          action: 'UPDATED',
          metadata: { field: 'priority', from: currentIssue.priority, to: priority },
        }).catch(() => {});
      }

      if (assigneeId !== undefined && assigneeId !== currentIssue.assigneeId) {
        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: currentIssue.title || '',
          action: 'ASSIGNED',
          metadata: { assigneeId },
        }).catch(() => {});
      }

      // Fire automation triggers — we emit the most specific trigger first
      // (STATUS_CHANGED / ASSIGNED / COMPLETED) and a general UPDATED trigger
      // so rules authored against either specificity can match.
      // All fire-and-forget.
      const triggers: TriggerEvent[] = ['UPDATED'];
      if (status !== undefined && status !== currentIssue.status) {
        triggers.push('STATUS_CHANGED');
        if (status === 'DONE') triggers.push('COMPLETED');
        if (status === 'BLOCKED') triggers.push('BLOCKED');
      }
      if (assigneeId !== undefined && assigneeId !== currentIssue.assigneeId) {
        triggers.push('ASSIGNED');
      }
      for (const trigger of triggers) {
        triggerAutomations({
          organizationId: orgId,
          trigger,
          entityType: 'TASK',
          entityId: params.id,
          projectId: issue.projectId,
          userId: currentUser.id,
        }).catch((err) => {
          log.error('Automation trigger on task update failed', {
            error: err instanceof Error ? err.message : err,
            trigger,
            taskId: params.id,
          });
        });
      }
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
    log.error('Issue update error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/issues/[id]
 * Soft deletes an issue
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user has MEMBER permission
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY FIX: Verify authentication
    const authResult = await requireAuth();
    if (!authResult.authorized || !authResult.session?.user) {
      return authResult.error!;
    }

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get issue to verify project access
    const issue = await prisma.task.findUnique({
      where: { id: params.id },
      select: { projectId: true },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // SECURITY FIX: Verify user has MEMBER permission to delete this issue
    const projectAuthResult = await requireProjectAccess(issue.projectId, user.id, 'MEMBER');
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
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
    log.error('Issue deletion error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
