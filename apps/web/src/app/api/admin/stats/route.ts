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
      totalIssues,
      activeOrgs,
      recentUsers,
      orgsByPlan,
      orgsByStatus,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.project.count(),
      prisma.issue.count(),
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
        totalIssues,
        activeOrgs,
        recentUsers,
        planBreakdown,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
