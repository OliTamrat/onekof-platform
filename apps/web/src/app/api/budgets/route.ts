import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/budgets
 * List all budgets for an organization/project
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {
      project: { organizationId },
    };
    if (projectId) where.projectId = projectId;

    const includeClause = {
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
      categories: {
        include: {
          expenses: {
            where: {
              status: 'APPROVED' as const,
              deletedAt: null,
            },
          },
        },
      },
      _count: {
        select: {
          expenses: true,
          watchers: true,
        },
      },
    };

    const orderByClause = {
      createdAt: 'desc' as const,
    };

    const transformBudget = (budget: any, userMap: Map<string, { name: string | null; email: string }>) => {
      const totalSpent = budget.categories.reduce((sum: number, category: any) => {
        const categorySpent = category.expenses.reduce(
          (expSum: number, exp: any) => expSum + Number(exp.amount),
          0
        );
        return sum + categorySpent;
      }, 0);

      const totalAllocated = budget.categories.reduce(
        (sum: number, cat: any) => sum + Number(cat.allocatedAmount),
        0
      );

      const creator = budget.createdBy ? userMap.get(budget.createdBy) : null;
      const approver = budget.approvedBy ? userMap.get(budget.approvedBy) : null;

      return {
        ...budget,
        totalSpent,
        totalAllocated,
        utilization: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
        creatorName: creator?.name || creator?.email || null,
        approverName: approver?.name || approver?.email || null,
      };
    };

    // Helper to resolve user IDs to names
    const resolveUsers = async (budgets: any[]) => {
      const userIds = new Set<string>();
      for (const b of budgets) {
        if (b.createdBy) userIds.add(b.createdBy);
        if (b.approvedBy) userIds.add(b.approvedBy);
      }
      if (userIds.size === 0) return new Map();
      const users = await prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: { id: true, name: true, email: true },
      });
      return new Map(users.map(u => [u.id, { name: u.name, email: u.email }]));
    };

    const url = request.nextUrl;
    const hasPagination = url.searchParams.has('page') || url.searchParams.has('limit');

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [budgets, total] = await Promise.all([
        prisma.budget.findMany({
          where,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.budget.count({ where }),
      ]);

      const userMap = await resolveUsers(budgets);
      const budgetsWithStats = budgets.map(b => transformBudget(b, userMap));
      return NextResponse.json(buildPaginatedResponse(budgetsWithStats, total, { page, limit, skip }));
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: includeClause,
      orderBy: orderByClause,
    });

    const userMap = await resolveUsers(budgets);
    const budgetsWithStats = budgets.map(b => transformBudget(b, userMap));

    return NextResponse.json({
      budgets: budgetsWithStats,
      count: budgets.length,
    });
  } catch (error) {
    logger.error('Budget list error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets
 * Create a new budget
 */
export async function POST(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const orgId = ctx.organizationId;

    const body = await request.json();
    const {
      projectId,
      totalBudget,
      currency = 'ETB',
      fiscalYearStart,
      fiscalYearEnd,
      categories = [],
    } = body;

    if (!projectId || !totalBudget) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, totalBudget' },
        { status: 400 }
      );
    }

    // Validate project belongs to user's organization
    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const budget = await prisma.budget.create({
      data: {
        projectId,
        totalBudget,
        currency,
        fiscalYearStart: fiscalYearStart ? new Date(fiscalYearStart) : null,
        fiscalYearEnd: fiscalYearEnd ? new Date(fiscalYearEnd) : null,
        status: 'DRAFT',
        createdBy: ctx.user.id,
        settings: {},
        visibilitySettings: {},
        categories: {
          create: categories.map((cat: any, index: number) => ({
            name: cat.name,
            code: cat.code,
            description: cat.description,
            allocatedAmount: cat.allocatedAmount,
            currency: currency,
            order: index,
          })),
        },
      },
      include: {
        categories: true,
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    return NextResponse.json({
      budget,
      message: 'Budget created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('Budget creation error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
