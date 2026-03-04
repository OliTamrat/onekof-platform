import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';

// GET /api/automations/[id]/executions - Get execution history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automation = await prisma.automationRule.findUnique({
      where: { id: params.id },
    });

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: automation.organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      ruleId: params.id,
    };

    if (status) {
      where.status = status;
    }

    // Fetch executions
    const [executions, total] = await Promise.all([
      prisma.automationExecution.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.automationExecution.count({ where }),
    ]);

    // Calculate statistics
    const stats = await prisma.automationExecution.groupBy({
      by: ['status'],
      where: { ruleId: params.id },
      _count: true,
    });

    const statistics = {
      total,
      byStatus: stats.reduce((acc: any, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      executions,
      statistics,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
