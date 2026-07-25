import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireAuth, requireProjectAccess } from '@/lib/security/authorization';
import { createSprintSchema } from '@/lib/validation/schemas';
import { logActivity } from '@/lib/activity-logger';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects/[id]/sprints
 * List a project's sprints (optionally filtered by ?status=), with live
 * task counts. Snapshot columns are returned as stored — never recomputed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;

    const access = await requireProjectAccess(params.id, auth.session.user.id);
    if (!access.authorized) return access.error;

    const statusParam = req.nextUrl.searchParams.get('status');
    const statusFilter =
      statusParam && ['PLANNED', 'ACTIVE', 'COMPLETED'].includes(statusParam)
        ? { status: statusParam as 'PLANNED' | 'ACTIVE' | 'COMPLETED' }
        : {};

    const sprints = await prisma.sprint.findMany({
      where: { projectId: params.id, deletedAt: null, ...statusFilter },
      include: {
        _count: { select: { tasks: { where: { deletedAt: null } } } },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      sprints: sprints.map((s) => ({
        id: s.id,
        projectId: s.projectId,
        name: s.name,
        goal: s.goal,
        status: s.status,
        position: s.position,
        startDate: s.startDate?.toISOString() ?? null,
        endDate: s.endDate?.toISOString() ?? null,
        committedCount: s.committedCount,
        committedEstimate: s.committedEstimate,
        completedCount: s.completedCount,
        completedEstimate: s.completedEstimate,
        completedAt: s.completedAt?.toISOString() ?? null,
        rolloverTargetId: s.rolloverTargetId,
        taskCount: s._count.tasks,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error('Error listing sprints', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[id]/sprints
 * Create a sprint in PLANNED state. Dates are optional here — they become
 * required at start. Position appends to the end of the project's list.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.error;
    const userId = auth.session.user.id;

    const access = await requireProjectAccess(params.id, userId, 'MEMBER');
    if (!access.authorized) return access.error;

    const parsed = createSprintSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid sprint payload', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { organizationId: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const last = await prisma.sprint.findFirst({
      where: { projectId: params.id, deletedAt: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const sprint = await prisma.sprint.create({
      data: {
        projectId: params.id,
        name: parsed.data.name,
        goal: parsed.data.goal ?? null,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        position: (last?.position ?? -1) + 1,
        createdBy: userId,
      },
    });

    logActivity({
      organizationId: project.organizationId,
      userId,
      entityType: 'SPRINT',
      entityId: sprint.id,
      action: 'CREATED',
      metadata: { projectId: params.id, name: sprint.name },
    });

    return NextResponse.json({ sprint }, { status: 201 });
  } catch (error) {
    logger.error('Error creating sprint', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
