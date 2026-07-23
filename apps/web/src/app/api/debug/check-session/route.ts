import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import { requireSuperAdmin } from '@/lib/security/superadmin';

export const dynamic = 'force-dynamic';


export async function GET() {
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEBUG_ROUTES) {
      return NextResponse.json({ error: 'Debug routes disabled in production' }, { status: 404 });
    }

  // 🔒 SECURITY: Debug routes must require superadmin access
  const { authorized, error } = await requireSuperAdmin();
  if (!authorized) return error!;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user's organizations
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    // Get total counts
    const totalProjects = await prisma.project.count();
    const totalIssues = await prisma.task.count();
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        organizationsInSession: session.user.organizations?.length || 0
      },
      userOrganizations: userOrgs.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role
      })),
      databaseStats: {
        totalProjects,
        totalIssues,
        totalUsers
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
