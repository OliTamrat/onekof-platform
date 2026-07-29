import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import { requireAuthentication, requireProjectAccess } from '@/lib/security/authorization';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]
 * Returns a single project with detailed information
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user has access to project
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

    // SECURITY FIX: Verify user has access to this project
    const projectAuthResult = await requireProjectAccess(params.id, user.id);
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
    }

    // Get project with all details
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
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
        },
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todoTasks = project.tasks.filter(t => t.status === 'TODO').length;

    return NextResponse.json({
      project: {
        ...project,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          todo: todoTasks,
        },
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    log.error('Project fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Updates a project
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user can edit project
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

    const user = await prisma.user.findUnique({
      where: { email: authResult.session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // SECURITY FIX: Verify user has MEMBER permission to edit this project
    const projectAuthResult = await requireProjectAccess(params.id, user.id, 'MEMBER');
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
    }

    // Parse request body
    const body = await request.json();
    const { name, description, status, color, icon, visibility } = body;

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (visibility !== undefined) {
      // Only allow recognized enum values
      const validVisibilities = ['PUBLIC', 'INTERNAL', 'PRIVATE', 'CONFIDENTIAL'];
      if (!validVisibilities.includes(visibility)) {
        return NextResponse.json(
          { error: 'Invalid visibility value' },
          { status: 400 }
        );
      }
      updateData.visibility = visibility;
    }

    // Update settings if color or icon provided
    if (color !== undefined || icon !== undefined) {
      const project = await prisma.project.findUnique({
        where: { id: params.id },
      });

      if (project) {
        const currentSettings = (project.settings as any) || {};
        updateData.settings = {
          ...currentSettings,
          ...(color !== undefined && { color }),
          ...(icon !== undefined && { icon }),
        };
      }
    }

    // Update project
    const project = await prisma.project.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
        },
        members: true,
      },
    });

    // Calculate stats
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;

    return NextResponse.json({
      project: {
        ...project,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
          todo: project.tasks.filter(t => t.status === 'TODO').length,
        },
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    log.error('Project update error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Soft deletes a project
 *
 * SECURITY: Fixed IDOR vulnerability - now verifies user has ADMIN permission
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

    // SECURITY FIX: Verify user has ADMIN permission to delete this project
    const projectAuthResult = await requireProjectAccess(params.id, user.id, 'ADMIN');
    if (!projectAuthResult.authorized) {
      return projectAuthResult.error!;
    }

    // Soft delete project (set deletedAt)
    await prisma.project.update({
      where: {
        id: params.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    log.error('Project deletion error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
