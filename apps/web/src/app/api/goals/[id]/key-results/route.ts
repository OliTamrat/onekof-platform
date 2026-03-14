import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/goals/[id]/key-results - Get all key results for a goal
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;

    // Verify goal exists and user has access
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { organizationId: true },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: goal.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get key results
    const keyResults = await prisma.keyResult.findMany({
      where: { goalId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ keyResults });
  } catch (error) {
    console.error('Error fetching key results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key results' },
      { status: 500 }
    );
  }
}

// POST /api/goals/[id]/key-results - Create a new key result
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const body = await req.json();
    const { description, unit, target, current = 0 } = body;

    if (!description || !unit || target === undefined) {
      return NextResponse.json(
        { error: 'Description, unit, and target are required' },
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
        { error: 'Only admins and owners can add key results' },
        { status: 403 }
      );
    }

    // Create key result
    const keyResult = await prisma.keyResult.create({
      data: {
        goalId,
        description,
        unit,
        target: parseFloat(target),
        current: parseFloat(current),
      },
    });

    return NextResponse.json({ keyResult });
  } catch (error) {
    console.error('Error creating key result:', error);
    return NextResponse.json(
      { error: 'Failed to create key result' },
      { status: 500 }
    );
  }
}
