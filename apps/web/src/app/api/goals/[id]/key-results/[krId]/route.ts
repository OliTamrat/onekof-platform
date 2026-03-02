import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/goals/[id]/key-results/[krId] - Update a key result
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; krId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, krId } = params;
    const body = await req.json();
    const { description, unit, target, current, isCompleted } = body;

    // Verify key result exists and belongs to this goal
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: krId },
      include: {
        goal: {
          select: { organizationId: true },
        },
      },
    });

    if (!keyResult || keyResult.goalId !== goalId) {
      return NextResponse.json(
        { error: 'Key result not found' },
        { status: 404 }
      );
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: keyResult.goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update key result
    const updatedKeyResult = await prisma.keyResult.update({
      where: { id: krId },
      data: {
        ...(description !== undefined && { description }),
        ...(unit !== undefined && { unit }),
        ...(target !== undefined && { target: parseFloat(target) }),
        ...(current !== undefined && { current: parseFloat(current) }),
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        }),
        updatedAt: new Date(),
      },
    });

    // Recalculate goal progress based on key results
    const allKeyResults = await prisma.keyResult.findMany({
      where: { goalId },
    });

    const totalProgress = allKeyResults.reduce((sum, kr) => {
      return sum + (kr.current / kr.target) * 100;
    }, 0);

    const avgProgress = allKeyResults.length > 0 ? totalProgress / allKeyResults.length : 0;

    // Update goal progress
    await prisma.goal.update({
      where: { id: goalId },
      data: { progress: Math.round(avgProgress) },
    });

    return NextResponse.json({ keyResult: updatedKeyResult });
  } catch (error) {
    console.error('Error updating key result:', error);
    return NextResponse.json(
      { error: 'Failed to update key result' },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id]/key-results/[krId] - Delete a key result
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; krId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: goalId, krId } = params;

    // Verify key result exists and belongs to this goal
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: krId },
      include: {
        goal: {
          select: { organizationId: true },
        },
      },
    });

    if (!keyResult || keyResult.goalId !== goalId) {
      return NextResponse.json(
        { error: 'Key result not found' },
        { status: 404 }
      );
    }

    // Verify user is an admin or owner
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: keyResult.goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json(
        { error: 'Only admins and owners can delete key results' },
        { status: 403 }
      );
    }

    // Delete key result
    await prisma.keyResult.delete({
      where: { id: krId },
    });

    // Recalculate goal progress
    const allKeyResults = await prisma.keyResult.findMany({
      where: { goalId },
    });

    const totalProgress = allKeyResults.reduce((sum, kr) => {
      return sum + (kr.current / kr.target) * 100;
    }, 0);

    const avgProgress = allKeyResults.length > 0 ? totalProgress / allKeyResults.length : 0;

    await prisma.goal.update({
      where: { id: goalId },
      data: { progress: Math.round(avgProgress) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting key result:', error);
    return NextResponse.json(
      { error: 'Failed to delete key result' },
      { status: 500 }
    );
  }
}
