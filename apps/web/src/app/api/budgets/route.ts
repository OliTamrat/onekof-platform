import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';

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

    const budgets = await prisma.budget.findMany({
      where,
      include: {
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
                status: 'APPROVED',
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate spending for each budget
    const budgetsWithStats = budgets.map(budget => {
      const totalSpent = budget.categories.reduce((sum, category) => {
        const categorySpent = category.expenses.reduce(
          (expSum, exp) => expSum + Number(exp.amount),
          0
        );
        return sum + categorySpent;
      }, 0);

      const totalAllocated = budget.categories.reduce(
        (sum, cat) => sum + Number(cat.allocatedAmount),
        0
      );

      return {
        ...budget,
        totalSpent,
        totalAllocated,
        utilization: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      };
    });

    return NextResponse.json({
      budgets: budgetsWithStats,
      count: budgets.length,
    });
  } catch (error) {
    console.error('Budget list error:', error);
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
    console.error('Budget creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
