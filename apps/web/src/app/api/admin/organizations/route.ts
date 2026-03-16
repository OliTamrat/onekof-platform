import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.organization.count({ where: where as any }),
    ]);

    return NextResponse.json({
      organizations: organizations.map(org => ({
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
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin organizations error:', error);
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
    console.error('Admin update org error:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}
