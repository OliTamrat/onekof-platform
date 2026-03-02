import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';

/**
 * GET /api/issues
 * Returns all issues for a project or organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const assigneeId = searchParams.get('assigneeId');
    const type = searchParams.get('type');

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Get the user's default organization or first organization
    const orgMembership = user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Build query filters
    const where: any = {
      deletedAt: null,
    };

    // Filter by project if specified
    if (projectId) {
      where.projectId = projectId;
    } else {
      // If no project specified, get all projects in org
      const orgProjects = await prisma.project.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        select: { id: true },
      });
      where.projectId = {
        in: orgProjects.map(p => p.id),
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by assignee
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Get all issues
    const issues = await prisma.task.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform issues with counts
    const issuesWithCounts = issues.map(issue => ({
      ...issue,
      commentCount: issue.comments.length,
      attachmentCount: issue.attachments.length,
      // Remove the arrays since we only need counts
      comments: undefined,
      attachments: undefined,
    }));

    return NextResponse.json({
      issues: issuesWithCounts,
    });
  } catch (error) {
    console.error('Issues list error:', error);
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
    // Get the current user's session
    const session = await getServerSession();

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
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      labels,
      dueDate,
      estimate,
      parentId,
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
      },
    });

    if (!project) {
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

    // Create issue
    const issue = await prisma.task.create({
      data: {
        key: issueKey,
        title,
        description: description || null,
        type: type || 'TASK',
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId,
        assigneeId: assigneeId || null,
        reporterId: user.id,
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

    return NextResponse.json({
      issue: {
        ...issue,
        commentCount: 0,
        attachmentCount: 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Issue creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
