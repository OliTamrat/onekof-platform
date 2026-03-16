import { NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return auth.error;

  try {
    const [
      totalUsers,
      totalOrgs,
      totalProjects,
      totalTasks,
      activeOrgs,
      recentUsers,
      orgsByPlan,
      orgsByStatus,
      recentOrgs,
      totalMembers,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.organization.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          deletedAt: null,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.organization.groupBy({
        by: ['plan'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.organization.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.organization.count({
        where: {
          deletedAt: null,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.organizationMember.count(),
    ]);

    const planBreakdown = Object.fromEntries(
      orgsByPlan.map(g => [g.plan, g._count])
    );

    const statusBreakdown = Object.fromEntries(
      orgsByStatus.map(g => [g.status, g._count])
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrgs,
        totalProjects,
        totalTasks,
        activeOrgs,
        recentUsers,
        recentOrgs,
        totalMembers,
        planBreakdown,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
