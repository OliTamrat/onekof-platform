import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  try {
    const url = request.nextUrl;
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const plan = url.searchParams.get('plan') || '';

    const { page, limit, skip } = parsePaginationParams(request);

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (plan) where.plan = plan;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: where as any,
        include: {
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where: where as any }),
    ]);

    const formattedOrgs = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      type: org.type,
      maxMembers: org.maxMembers,
      maxProjects: org.maxProjects,
      memberCount: org._count.members,
      projectCount: org._count.projects,
      createdAt: org.createdAt,
      trialEndsAt: org.trialEndsAt,
    }));

    return NextResponse.json(buildPaginatedResponse(formattedOrgs, total, { page, limit, skip }));
  } catch (error) {
    logger.error('Admin organizations error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireSuperAdmin('ADMIN');
  if (!auth.authorized) return auth.error;

  try {
    const body = await request.json();
    const { id, status, plan, maxMembers, maxProjects } = body;

    if (!id) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (plan) updateData.plan = plan;
    if (maxMembers !== undefined) updateData.maxMembers = maxMembers;
    if (maxProjects !== undefined) updateData.maxProjects = maxProjects;

    const updated = await prisma.organization.update({
      where: { id },
      data: updateData as any,
    });

    return NextResponse.json({ organization: updated });
  } catch (error) {
    logger.error('Admin update org error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}
