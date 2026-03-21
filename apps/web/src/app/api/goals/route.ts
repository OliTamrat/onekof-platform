import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserOrganization } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';

export const dynamic = 'force-dynamic';

// GET /api/goals - Get all goals for the current organization
export async function GET(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    // Get status filter from query params
    const status = req.nextUrl.searchParams.get('status');

    const whereClause = {
      organizationId,
      deletedAt: null,
      ...(status && status !== 'all' && { status: status as any }),
    };

    const includeClause = {
      keyResults: {
        orderBy: { createdAt: 'asc' as const },
      },
      team: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    };

    const orderByClause = [
      { priority: 'desc' as const },
      { createdAt: 'desc' as const },
    ];

    const transformGoal = (goal: { id: string; organizationId: string; title: string; description: string | null; status: string; priority: string; progress: number; ownerId: string; team: { id: string; name: string; icon: string | null; color: string | null } | null; startDate: Date | null; dueDate: Date | null; keyResults: { id: string; description: string; unit: string; target: number; current: number; isCompleted: boolean }[]; createdAt: Date; updatedAt: Date; completedAt: Date | null }) => ({
      id: goal.id,
      organizationId: goal.organizationId,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      priority: goal.priority,
      progress: goal.progress,
      ownerId: goal.ownerId,
      team: goal.team ? {
        id: goal.team.id,
        name: goal.team.name,
        icon: goal.team.icon,
        color: goal.team.color,
      } : null,
      startDate: goal.startDate?.toISOString(),
      dueDate: goal.dueDate?.toISOString(),
      keyResults: goal.keyResults.map((kr: { id: string; description: string; unit: string; target: number; current: number; isCompleted: boolean }) => ({
        id: kr.id,
        description: kr.description,
        unit: kr.unit,
        target: kr.target,
        current: kr.current,
        isCompleted: kr.isCompleted,
      })),
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      completedAt: goal.completedAt?.toISOString(),
    });

    const url = req.nextUrl;
    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(req);

      const [goals, total] = await Promise.all([
        prisma.goal.findMany({
          where: whereClause,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.goal.count({ where: whereClause }),
      ]);

      const formattedGoals = goals.map(transformGoal);
      return NextResponse.json(buildPaginatedResponse(formattedGoals, total, { page, limit, skip }));
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: orderByClause,
    });

    const formattedGoals = goals.map(transformGoal);

    return NextResponse.json({ goals: formattedGoals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(req: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await req.json();
    const { title, description, priority, dueDate, teamId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }

    const organizationId = ctx.organizationId;

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        organizationId,
        title,
        description,
        priority: priority || 'MEDIUM',
        ownerId: ctx.user.id,
        createdBy: ctx.user.id,
        ...(teamId && { teamId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
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
        id: goal.id,
        organizationId: goal.organizationId,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        ownerId: goal.ownerId,
        team: goal.team,
        startDate: goal.startDate?.toISOString(),
        dueDate: goal.dueDate?.toISOString(),
        keyResults: goal.keyResults,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
