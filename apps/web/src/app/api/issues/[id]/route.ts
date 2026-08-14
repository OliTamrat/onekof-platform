import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { handleTaskStatusChange } from '@/lib/progress-aggregation';
import { autoWatchMentionedUsers } from '@/lib/mention-parser';
import { authOptions } from '@/lib/auth';
import { requireAuthentication, requireProjectAccess } from '@/lib/security/authorization';
import { log } from '@/lib/logger';
import { logTaskActivity } from '@/lib/activity-logger';
import { sendTaskAssignmentEmail, userWantsNotification } from '@/lib/email';
import { updateIssueSchema } from '@/lib/validation/schemas';
import { validateClassification } from '@/lib/departments/catalog';
import { validateStatusTransition, getAllowedTransitions, type TaskStatus } from '@/lib/workflow-engine';
import { resolveProjectSettings } from '@/lib/settings/resolve';
import { deliverWebhook } from '@/lib/integrations/webhooks';
import { triggerAutomations, type TriggerEvent } from '@/lib/automation-engine';
import {
  getPatientAccessLevel,
  meetsPatientAccess,
  canLinkCareItem,
  type PatientAccessLevel,
} from '@/lib/security/patient-access';
import { applyCareItemVisibility, redactCareItem } from '@/lib/security/care-item-visibility';

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
    const authResult = await requireAuthentication();
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
        patientId: true,
        project: { select: { organizationId: true } },
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

    // M2 — a care item needs patient access on top of project access.
    //
    // Resolved lazily and at most once. The overwhelming majority of tasks
    // carry no patient, and those requests must not pay for a membership
    // lookup whose answer nothing would use. But it cannot be decided from
    // the parent alone: an ordinary task can have a care item as a subtask,
    // and that subtask still has to be judged.
    let patientLevel: PatientAccessLevel | null = null;
    let patientLevelResolved = false;
    const resolvePatientLevel = async (): Promise<PatientAccessLevel | null> => {
      if (!patientLevelResolved) {
        patientLevel = await getPatientAccessLevel(issue.project.organizationId, user.id);
        patientLevelResolved = true;
      }
      return patientLevel;
    };

    if (issue.patientId) {
      // Below LIMITED the care item is not "forbidden", it is not there. The
      // list route omits it; answering 404 here keeps the two consistent, so
      // a caller cannot learn from a direct fetch that a row the board never
      // showed them exists.
      if (!meetsPatientAccess(await resolvePatientLevel(), 'LIMITED')) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
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

    // Subtasks are tasks, so a subtask can be a care item in its own right —
    // including under an ordinary parent. Apply the same rule rather than
    // assuming a child of a visible task is itself visible.
    const visibleSubtasks = subtasks.some((st) => st.patientId)
      ? applyCareItemVisibility(subtasks, await resolvePatientLevel())
      : subtasks;

    // Progress is computed over what the caller can actually see. Counting
    // hidden subtasks would show "2 of 5 done" beside a list of three, which
    // both looks broken and discloses that two rows were withheld.
    const completedSubtasks = visibleSubtasks.filter(st => st.status === 'DONE').length;
    const subtaskProgress = visibleSubtasks.length > 0
      ? Math.round((completedSubtasks / visibleSubtasks.length) * 100)
      : 0;

    return NextResponse.json({
      issue: redactCareItem(
        {
          ...issueDetailed,
          subtasks: visibleSubtasks,
          subtaskProgress,
          commentCount: issueDetailed.comments.length,
          attachmentCount: issueDetailed.attachments.length,
        },
        patientLevel
      ),
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
    const authResult = await requireAuthentication();
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
      select: {
        assigneeId: true, projectId: true, status: true, priority: true, title: true,
        sprintId: true, department: true, workstream: true, patientId: true,
        // Loaded so an edit can be COMPARED, not just applied. Without the
        // prior value there is nothing to record a change against, which is
        // why renaming a task, rewriting its description or moving its due
        // date produced no activity at all: the route never knew what the
        // field used to be.
        description: true, dueDate: true, estimate: true, timeSpent: true,
        storyPoints: true, type: true, labels: true,
        approvedAt: true,
        project: { select: { organizationId: true } },
      },
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

    // M2 — editing an existing care item. Same 404 as GET: a task the caller
    // may not see is a task that does not exist as far as they are concerned,
    // and a PATCH that answered 403 would confirm what the GET denied.
    const organizationId = currentIssue.project.organizationId;
    if (currentIssue.patientId) {
      const level = await getPatientAccessLevel(organizationId, currentUser.id);
      if (!meetsPatientAccess(level, 'LIMITED')) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateIssueSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      startDate,
      estimate,
      timeSpent,
      parentId,
      sprintId,
      sprintOrder,
      storyPoints,
      department,
      workstream,
      patientId,
    } = validation.data as any;
    const { backlogOrder } = body;

    // M2 — changing the patient link. Attaching and detaching are both FULL
    // operations: a LIMITED member is not allowed to know which patient a
    // care item concerns, so they must not be able to sever that link either.
    // Detaching would otherwise be a way to launder a care item into an
    // ordinary task and make it visible to everybody.
    if (patientId !== undefined) {
      const level = await getPatientAccessLevel(organizationId, currentUser.id);
      if (patientId === null) {
        if (!meetsPatientAccess(level, 'FULL')) {
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
      } else if (!(await canLinkCareItem(organizationId, patientId, level))) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
    }

    // Build update data
    const updateData: any = {};
    if (patientId !== undefined) updateData.patientId = patientId;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) {
      // Validate status transition against the project's effective workflow
      // settings (org default ← project override) — Phase 4 wires the engine.
      if (currentIssue.status !== status) {
        const effective = await resolveProjectSettings(currentIssue.projectId);
        const transition = validateStatusTransition(
          currentIssue.status as TaskStatus,
          status as TaskStatus,
          {
            enforceWorkflow: effective?.enforceWorkflow ?? false,
            transitions: effective?.workflowTransitions ?? null,
          }
        );
        if (!transition.allowed) {
          return NextResponse.json(
            {
              error: transition.reason,
              allowedTransitions: getAllowedTransitions(
                currentIssue.status as TaskStatus,
                effective?.workflowTransitions ?? null
              ),
            },
            { status: 422 }
          );
        }
      }

      // Board approval gate: entering DONE on a project that requires
      // approval demands a recorded sign-off. Checked after the workflow
      // rules so a caller failing both sees the more fundamental error.
      if (status === 'DONE' && currentIssue.status !== 'DONE') {
        const effective = await resolveProjectSettings(currentIssue.projectId);
        if (effective?.requireApproval && !currentIssue.approvedAt) {
          return NextResponse.json(
            {
              error: 'This project requires approval before an item can be completed',
              requiresApproval: true,
            },
            { status: 400 }
          );
        }
      }

      updateData.status = status;
      // Set completedAt only on the transition INTO DONE (an already-DONE
      // task keeps its original completion date); clear it when leaving DONE.
      if (status === 'DONE' && currentIssue.status !== 'DONE') {
        updateData.completedAt = new Date();
      } else if (status !== 'DONE') {
        updateData.completedAt = null;
      }
      // A sign-off belongs to one review cycle. The moment the item returns
      // to active work — reopened from DONE, or pulled back out of review —
      // the approval is void, so a stale one can never satisfy a later gate.
      // Entering DONE keeps it as the audit record of who approved.
      if (
        currentIssue.status !== status &&
        status !== 'DONE' &&
        status !== 'IN_REVIEW' &&
        currentIssue.approvedAt
      ) {
        updateData.approvedBy = null;
        updateData.approvedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (labels !== undefined) updateData.labels = labels;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (estimate !== undefined) updateData.estimate = estimate;
    if (timeSpent !== undefined) updateData.timeSpent = timeSpent;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (backlogOrder !== undefined) updateData.backlogOrder = backlogOrder;
    if (storyPoints !== undefined) updateData.storyPoints = storyPoints;
    if (sprintOrder !== undefined) updateData.sprintOrder = sprintOrder;
    if (sprintId !== undefined) {
      // null = back to backlog; otherwise the sprint must be a live sprint
      // in the SAME project (sprints are project-scoped by design)
      if (sprintId !== null) {
        const targetSprint = await prisma.sprint.findFirst({
          where: { id: sprintId, deletedAt: null, status: { not: 'COMPLETED' } },
          select: { projectId: true },
        });
        if (!targetSprint || targetSprint.projectId !== currentIssue.projectId) {
          return NextResponse.json(
            { error: 'Sprint not found in this project (or already completed)' },
            { status: 400 }
          );
        }
      }
      updateData.sprintId = sprintId;
      if (sprintOrder === undefined) updateData.sprintOrder = null;
    }
    if (department !== undefined || workstream !== undefined) {
      // Validate the pair as it will exist AFTER the update (a workstream
      // sent alone must still belong to the task's resulting department).
      const nextDepartment = department !== undefined ? department : currentIssue.department;
      let nextWorkstream = workstream !== undefined ? workstream : currentIssue.workstream;
      // Changing department without naming a workstream clears the old one —
      // a stale workstream from another department is never kept silently.
      if (department !== undefined && workstream === undefined) nextWorkstream = null;
      const classification = validateClassification(nextDepartment, nextWorkstream);
      if (!classification.ok) {
        return NextResponse.json({ error: classification.error }, { status: 400 });
      }
      updateData.department = nextDepartment;
      updateData.workstream = nextWorkstream;
    }

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
      // Also respect the assignee's notification preferences
      if (assigneeId !== currentUser.id) {
        (async () => {
          try {
            const wantsEmail = await userWantsNotification(assigneeId, 'emailOnAssignment');
            if (!wantsEmail) return;

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

      // Every remaining editable field, recorded generically.
      //
      // Before this, five things were logged (status, priority, assignee,
      // sprint, classification) out of fifteen the route can change. A member
      // could rename an assigned task, rewrite its description, move its due
      // date and revise the estimate, and the activity feed showed NOTHING —
      // so a project admin had no way to see what had been done. That is the
      // gap this closes; the drill-down was never the problem.
      //
      // Written as a table rather than another eight hand-copied blocks: the
      // hand-written ones are how five got covered and ten did not.
      const FIELD_CHANGES: Array<{
        field: string;
        next: unknown;
        prev: unknown;
        /** Long text is recorded as "changed" without the body. */
        elide?: boolean;
      }> = [
        { field: 'title', next: title, prev: currentIssue.title },
        { field: 'description', next: description, prev: currentIssue.description, elide: true },
        { field: 'type', next: type, prev: currentIssue.type },
        { field: 'due date', next: dueDate, prev: currentIssue.dueDate },
        { field: 'estimate', next: estimate, prev: currentIssue.estimate },
        { field: 'time spent', next: timeSpent, prev: currentIssue.timeSpent },
        { field: 'story points', next: storyPoints, prev: currentIssue.storyPoints },
        { field: 'labels', next: labels, prev: currentIssue.labels },
      ];

      // Dates arrive as ISO strings and are stored as Date; arrays need a
      // value comparison. Normalising both sides prevents an activity being
      // recorded for a field the user did not actually change — noise that
      // would make the feed useless faster than silence does.
      const norm = (v: unknown): string | null => {
        if (v === null || v === undefined) return null;
        if (v instanceof Date) return v.toISOString();
        if (Array.isArray(v)) return v.join(', ');
        return String(v);
      };

      for (const { field, next, prev, elide } of FIELD_CHANGES) {
        if (next === undefined) continue;
        const before = norm(prev);
        const after = norm(next);
        if (before === after) continue;

        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: currentIssue.title || '',
          action: 'UPDATED',
          metadata: elide
            // The description can be thousands of characters. Recording it
            // in full would bloat every activity row and put arbitrary user
            // text into a feed rendered elsewhere; recording that it changed
            // is what an admin needs in order to go and look.
            ? { field, changed: true }
            : { field, from: before, to: after },
        }).catch(() => {});
      }

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

      // Scope-churn signal: sprint membership changes are first-class events
      // (velocity/predictability reporting queries these against the
      // commitment snapshot written at sprint start)
      if (sprintId !== undefined && sprintId !== currentIssue.sprintId) {
        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: currentIssue.title || '',
          action: 'SPRINT_CHANGED',
          metadata: { from: currentIssue.sprintId, to: sprintId },
        }).catch(() => {});
      }

      // Classification changes are audited (D2): old -> new, both levels
      if (
        updateData.department !== undefined &&
        (updateData.department !== currentIssue.department ||
          updateData.workstream !== currentIssue.workstream)
      ) {
        logTaskActivity({
          organizationId: orgId,
          userId: currentUser.id,
          taskId: params.id,
          taskTitle: currentIssue.title || '',
          action: 'DEPARTMENT_CHANGED',
          metadata: {
            from: { department: currentIssue.department, workstream: currentIssue.workstream },
            to: { department: updateData.department, workstream: updateData.workstream },
          },
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

    // Deliver webhooks (fire-and-forget)
    if (projectWithOrg2?.organization) {
      deliverWebhook(projectWithOrg2.organization.id, 'issue.updated', {
        issue: { id: issue.id, key: issue.key, title: issue.title, status: issue.status, priority: issue.priority },
        changes: Object.keys(updateData),
      }).catch(() => {});
    }

    // The echo of the updated row is a read like any other: a LIMITED editor
    // who just moved a care item across the board must not learn from the
    // response whose task they moved.
    return NextResponse.json({
      issue: redactCareItem(
        {
          ...issue,
          commentCount: issue.comments.length,
          attachmentCount: issue.attachments.length,
          comments: undefined,
          attachments: undefined,
        },
        issue.patientId ? await getPatientAccessLevel(organizationId, currentUser.id) : null
      ),
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
    const authResult = await requireAuthentication();
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
      select: {
        projectId: true,
        patientId: true,
        project: { select: { organizationId: true } },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // SECURITY FIX: Verify user has MEMBER permission to delete this issue
    const projectAuthResult = await requireProjectAccess(issue.projectId, user.id, 'MEMBER');
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
    }

    // M2 — you cannot delete what you are not allowed to see. Without this a
    // NO_ACCESS member could destroy every care item on the board by id
    // without ever being shown one.
    if (issue.patientId) {
      const level = await getPatientAccessLevel(issue.project.organizationId, user.id);
      if (!meetsPatientAccess(level, 'LIMITED')) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }
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
