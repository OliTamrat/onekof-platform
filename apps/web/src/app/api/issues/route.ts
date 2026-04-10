import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { autoWatchMentionedUsers, extractMentions, resolveMentionsToUserIds } from '@/lib/mention-parser';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import { sendTaskAssignmentEmail, sendMentionEmail } from '@/lib/email';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/issues
 * Returns all issues for a project or organization
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const teamId = searchParams.get('teamId');
    const goalId = searchParams.get('goalId');
    const type = searchParams.get('type');

    const organizationId = ctx.organizationId;

    // SECURITY: scope tasks to projects the user is actually allowed to see.
    // This reuses the project access filter so the rules stay consistent with
    // /api/projects (MEMBERs only see public projects or projects they're in).
    const projectAccessFilter = buildProjectAccessFilter({
      organizationId,
      userId: ctx.user.id,
      orgRole: ctx.role,
    });

    const where: any = {
      deletedAt: null,
      project: projectAccessFilter,
    };

    // Filter by specific project if specified — but still enforce access.
    // If the user requests a project they can't access, they'll just get no
    // results (better than a 403 that leaks the project's existence).
    if (projectId) {
      where.projectId = projectId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by assignee
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // TODO: Add team filtering when TeamTask relation is added to schema
    // if (teamId) {
    //   where.teamId = teamId;
    // }

    // TODO: Add goal filtering when TaskGoal model is added to schema
    // if (goalId) {
    //   where.goals = {
    //     some: {
    //       goalId: goalId,
    //     },
    //   };
    // }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Note: label filtering is done client-side after fetching since
    // Prisma Json field filtering varies by database provider

    // Use _count for comment/attachment counts instead of loading full rows.
    // This alone saves loading hundreds of objects on busy boards.
    const includeClause = {
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
      _count: {
        select: {
          comments: { where: { deletedAt: null } },
          attachments: true,
        },
      },
    };

    const orderByClause = {
      createdAt: 'desc' as const,
    };

    const transformIssue = (issue: any) => ({
      ...issue,
      commentCount: issue._count?.comments ?? 0,
      attachmentCount: issue._count?.attachments ?? 0,
      _count: undefined,
    });

    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [issues, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

      const issuesWithCounts = issues.map(transformIssue);
      return NextResponse.json(buildPaginatedResponse(issuesWithCounts, total, { page, limit, skip }));
    }

    const issues = await prisma.task.findMany({
      where,
      include: includeClause,
      orderBy: orderByClause,
    });

    const issuesWithCounts = issues.map(transformIssue);

    return NextResponse.json({
      issues: issuesWithCounts,
    });
  } catch (error) {
    logger.error('Issues list error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues
 * Creates a new issue
 */
export async function POST(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Parse request body
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      teamId,
      labels,
      dueDate,
      estimate,
      parentId,
      watchers, // Array of user IDs to watch this task
      goalIds,  // Array of goal IDs to link this task to
    } = body;

    // Validate required fields
    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    // Get project to generate issue key
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
        organization: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project || project.organization.id !== ctx.organizationId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate next issue key (e.g., PROJ-1, PROJ-2, etc.)
    let nextNumber = 1;
    if (project.tasks.length > 0) {
      const lastKey = project.tasks[0].key;
      const lastNumber = parseInt(lastKey.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    const issueKey = `${project.key}-${nextNumber}`;

    // Create issue with transaction for watchers and goal links
    const issue = await prisma.$transaction(async (tx) => {
      // Create the task
      const newTask = await tx.task.create({
        data: {
          key: issueKey,
          title,
          description: description || null,
          type: type || 'TASK',
          status: status || 'TODO',
          priority: priority || 'MEDIUM',
          projectId,
          assigneeId: assigneeId || null,
          // TODO: Add teamId when TeamTask relation is added to schema
          // teamId: teamId || null,
          reporterId: ctx.user.id,
          labels: labels || [],
          dueDate: dueDate ? new Date(dueDate) : null,
          estimate: estimate || null,
          parentId: parentId || null,
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
        },
      });

      // Smart Auto-Watch: Creator automatically watches their own task
      await tx.taskWatcher.create({
        data: {
          taskId: newTask.id,
          userId: ctx.user.id,
          watchReason: 'AUTO_CREATED',
          addedBy: ctx.user.id,
        },
      });

      // Smart Auto-Watch: If assignee is different from creator, auto-add them as watcher
      if (assigneeId && assigneeId !== ctx.user.id) {
        await tx.taskWatcher.create({
          data: {
            taskId: newTask.id,
            userId: assigneeId,
            watchReason: 'AUTO_ASSIGNED',
            addedBy: ctx.user.id,
          },
        });
      }

      // Add additional manual watchers if provided
      if (watchers && Array.isArray(watchers) && watchers.length > 0) {
        await tx.taskWatcher.createMany({
          data: watchers
            .filter((userId: string) => userId !== ctx.user.id && userId !== assigneeId) // Avoid duplicates
            .map((userId: string) => ({
              taskId: newTask.id,
              userId,
              watchReason: 'MANUAL',
              addedBy: ctx.user.id,
            })),
          skipDuplicates: true,
        });
      }

      // TODO: Link to goals when TaskGoal model is added to schema
      // if (goalIds && Array.isArray(goalIds) && goalIds.length > 0) {
      //   await tx.taskGoal.createMany({
      //     data: goalIds.map((goalId: string) => ({
      //       taskId: newTask.id,
      //       goalId,
      //       addedBy: user.id,
      //     })),
      //     skipDuplicates: true,
      //   });
      // }

      return newTask;
    });

    // Smart Auto-Watch: Parse @mentions in title and description
    if (description || title) {
      const contentToCheck = `${title} ${description || ''}`;
      await autoWatchMentionedUsers(
        issue.id,
        contentToCheck,
        project.organization.id,
        ctx.user.id
      ).catch(err => {
        logger.error('Auto-watch mentioned users error', { error: err instanceof Error ? err.message : err });
      });
    }

    // Email the assignee if one was set at creation — fire-and-forget, skip self-assignment
    if (assigneeId && assigneeId !== ctx.user.id) {
      (async () => {
        try {
          const newAssignee = await prisma.user.findUnique({
            where: { id: assigneeId },
            select: { name: true, email: true },
          });
          if (!newAssignee?.email) return;

          const baseUrl = process.env.NEXTAUTH_URL || 'https://onekof.com';
          const taskUrl = `${baseUrl}/dashboard/issues?taskId=${issue.id}`;

          await sendTaskAssignmentEmail({
            to: newAssignee.email,
            assigneeName: newAssignee.name,
            assignerName: ctx.user.name || ctx.user.email,
            taskKey: issue.key,
            taskTitle: issue.title,
            taskDescription: issue.description,
            priority: issue.priority,
            dueDate: issue.dueDate,
            taskUrl,
          });
        } catch (emailErr) {
          logger.error('Failed to send task assignment email on create', {
            error: emailErr instanceof Error ? emailErr.message : emailErr,
            taskId: issue.id,
          });
        }
      })();
    }

    return NextResponse.json({
      issue: {
        ...issue,
        commentCount: 0,
        attachmentCount: 0,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Issue creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
