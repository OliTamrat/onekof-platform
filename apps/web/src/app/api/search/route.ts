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
      return NextResponse.json({ issues: [], projects: [], members: [], teams: [], goals: [], documents: [] });
    }

    const organizationId = ctx.organizationId;

    const projectAccessFilter = buildProjectAccessFilter({
      organizationId,
      userId: ctx.user.id,
      orgRole: ctx.role,
    });

    const [issues, projects, members, teams, goals, documents] = await Promise.all([
      prisma.task.findMany({
        where: {
          deletedAt: null,
          project: projectAccessFilter,
          AND: [
            {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { key: { contains: q, mode: 'insensitive' } },
              ],
            },
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
          ...projectAccessFilter,
          AND: [
            {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { key: { contains: q, mode: 'insensitive' } },
              ],
            },
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

      prisma.team.findMany({
        where: {
          organizationId,
          AND: [{
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }],
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { members: true } },
        },
        take: 5,
      }),

      prisma.goal.findMany({
        where: {
          organizationId,
          AND: [{
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          progress: true,
        },
        take: 5,
      }),

      prisma.document.findMany({
        where: {
          organizationId,
          AND: [{
            OR: [
              { fileName: { contains: q, mode: 'insensitive' } },
            ],
          }],
        },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          createdAt: true,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      issues,
      projects,
      members: members.map(m => ({ ...m.user, role: m.role })),
      teams: teams.map((t: any) => ({ ...t, memberCount: t._count?.members || 0, _count: undefined })),
      goals,
      documents,
    });
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Search failed', detail: error instanceof Error ? error.message : 'Unknown error', issues: [], projects: [], members: [], teams: [], goals: [], documents: [] },
      { status: 500 }
    );
  }
}
