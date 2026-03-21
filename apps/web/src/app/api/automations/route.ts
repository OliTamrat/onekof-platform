import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/automations - List all automation rules
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const isEnabled = searchParams.get('isEnabled');
    const entityType = searchParams.get('entityType');
    const isTemplate = searchParams.get('isTemplate');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build filter
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (isEnabled !== null && isEnabled !== undefined) {
      where.isEnabled = isEnabled === 'true';
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (isTemplate !== null && isTemplate !== undefined) {
      where.isTemplate = isTemplate === 'true';
    }

    // Fetch automation rules
    const automations = await prisma.automationRule.findMany({
      where,
      orderBy: [
        { isEnabled: 'desc' },
        { executionOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Get execution statistics
    const statistics = {
      total: automations.length,
      enabled: automations.filter((a) => a.isEnabled).length,
      disabled: automations.filter((a) => !a.isEnabled).length,
      totalExecutions: automations.reduce((sum, a) => sum + a.executionCount, 0),
    };

    return NextResponse.json({
      automations,
      statistics,
    });
  } catch (error) {
    logger.error('Error fetching automations', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST /api/automations - Create new automation rule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      name,
      description,
      icon,
      color,
      scope,
      entityType,
      triggerEvent,
      runMode,
      executionOrder,
      conditions,
      actions,
      isEnabled,
      isTemplate,
      naturalLanguage,
    } = body;

    // Validate required fields
    if (!organizationId || !name || !entityType || !triggerEvent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.user.id,
        },
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create automation rule
    const automation = await prisma.automationRule.create({
      data: {
        organizationId,
        name,
        description,
        icon: icon || 'Zap',
        color: color || '#1C8C7D',
        scope: scope || 'ORGANIZATION',
        entityType,
        triggerEvent,
        runMode: runMode || 'AUTOMATIC',
        executionOrder: executionOrder || 0,
        conditions: conditions || [],
        actions: actions || [],
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        isTemplate: isTemplate || false,
        naturalLanguage,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    logger.error('Error creating automation', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
