import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/goals/[id]/projects/[projectId] - Unlink a project from a goal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const projectId = params.projectId;

    // Verify goal exists and get organization
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { organizationId: true },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can unlink projects from goals' },
        { status: 403 }
      );
    }

    // Find and delete the link
    const link = await prisma.goalProject.findUnique({
      where: {
        goalId_projectId: {
          goalId,
          projectId,
        },
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Project is not linked to this goal' },
        { status: 404 }
      );
    }

    await prisma.goalProject.delete({
      where: {
        id: link.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking project from goal:', error);
    return NextResponse.json(
      { error: 'Failed to unlink project from goal' },
      { status: 500 }
    );
  }
}

// PATCH /api/goals/[id]/projects/[projectId] - Update contribution weight
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const projectId = params.projectId;
    const body = await req.json();
    const { contributionWeight } = body;

    if (contributionWeight === undefined || contributionWeight < 0 || contributionWeight > 100) {
      return NextResponse.json(
        { error: 'Contribution weight must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Verify goal exists and get organization
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { organizationId: true },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can update project contribution' },
        { status: 403 }
      );
    }

    // Update the link
    const updatedLink = await prisma.goalProject.update({
      where: {
        goalId_projectId: {
          goalId,
          projectId,
        },
      },
      data: {
        contributionWeight,
      },
    });

    return NextResponse.json({
      contributionWeight: updatedLink.contributionWeight
    });
  } catch (error) {
    console.error('Error updating project contribution:', error);
    return NextResponse.json(
      { error: 'Failed to update project contribution' },
      { status: 500 }
    );
  }
}
