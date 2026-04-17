import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/goals/[id] - Get a specific goal with key results
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        keyResults: {
          orderBy: { createdAt: 'asc' },
        },
        team: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user has access to this goal's organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        ownerId: goal.ownerId,
        team: goal.team,
        startDate: goal.startDate?.toISOString(),
        dueDate: goal.dueDate?.toISOString(),
        keyResults: goal.keyResults.map((kr: { id: string; description: string; unit: string; target: number; current: number; isCompleted: boolean; createdAt: Date; updatedAt: Date }) => ({
          id: kr.id,
          description: kr.description,
          unit: kr.unit,
          target: kr.target,
          current: kr.current,
          isCompleted: kr.isCompleted,
          createdAt: kr.createdAt.toISOString(),
          updatedAt: kr.updatedAt.toISOString(),
        })),
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        completedAt: goal.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching goal', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    );
  }
}

// PATCH /api/goals/[id] - Update a goal
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, priority, progress, dueDate, teamId } = body;

    // Get goal to verify access
    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only owner, admin, or goal owner can update
    const isOrgAdmin = membership.role === 'ADMIN' || membership.role === 'OWNER';
    const isGoalOwner = goal.ownerId === authUser.id;

    if (!isOrgAdmin && !isGoalOwner) {
      return NextResponse.json(
        { error: 'Only goal owners and organization admins can update goals' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(progress !== undefined && { progress }),
      ...(teamId !== undefined && { teamId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    };

    // If status is changed to COMPLETED, set completedAt
    if (status === 'COMPLETED' && goal.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        keyResults: true,
        team: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      goal: {
        id: updatedGoal.id,
        title: updatedGoal.title,
        description: updatedGoal.description,
        status: updatedGoal.status,
        priority: updatedGoal.priority,
        progress: updatedGoal.progress,
        ownerId: updatedGoal.ownerId,
        team: updatedGoal.team,
        startDate: updatedGoal.startDate?.toISOString(),
        dueDate: updatedGoal.dueDate?.toISOString(),
        keyResults: updatedGoal.keyResults,
        createdAt: updatedGoal.createdAt.toISOString(),
        updatedAt: updatedGoal.updatedAt.toISOString(),
        completedAt: updatedGoal.completedAt?.toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error updating goal', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get goal to verify access
    const goal = await prisma.goal.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is an admin/owner or goal owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const isOrgAdmin = membership.role === 'ADMIN' || membership.role === 'OWNER';
    const isGoalOwner = goal.ownerId === authUser.id;

    if (!isOrgAdmin && !isGoalOwner) {
      return NextResponse.json(
        { error: 'Only goal owners and organization admins can delete goals' },
        { status: 403 }
      );
    }

    // Soft delete goal (and cascade to key results)
    await prisma.goal.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting goal', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
