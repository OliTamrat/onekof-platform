import { NextRequest, NextResponse } from 'next/server';
import { resolveUserOrganization, buildProjectAccessFilter } from '@/lib/api-organization';
import { prisma } from '@onekof/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await resolveUserOrganization();
    if (!result.data) {
      return result.error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = result.data;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ issues: [], projects: [], members: [] });
    }

    const organizationId = ctx.organizationId;

    const projectWhere: any = {
      organizationId,
      deletedAt: null,
    };

    if (ctx.role as string === 'GUEST') {
      const allowed = await prisma.project.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [
            { members: { some: { userId: ctx.user.id } } },
            { leadId: ctx.user.id },
            { ownerId: ctx.user.id },
          ],
        },
        select: { id: true },
      });
      projectWhere.id = { in: allowed.map((p: { id: string }) => p.id) };
    }

    const [issues, projects, members] = await Promise.all([
      prisma.task.findMany({
        where: {
          deletedAt: null,
          project: { organizationId, deletedAt: null, ...(projectWhere.id ? { id: projectWhere.id } : {}) },
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { key: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          key: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          project: { select: { id: true, name: true, key: true, color: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),

      prisma.project.findMany({
        where: {
          ...projectWhere,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { key: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          key: true,
          color: true,
          description: true,
          _count: { select: { tasks: { where: { deletedAt: null } } } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      prisma.organizationMember.findMany({
        where: {
          organizationId,
          user: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        select: {
          role: true,
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      issues,
      projects,
      members: members.map(m => ({ ...m.user, role: m.role })),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
