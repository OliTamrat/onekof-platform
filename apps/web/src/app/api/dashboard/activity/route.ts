import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/activity
 * Returns recent activity for the current user's organization
 */
export async function GET(_request: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Get the user's default organization or first organization
    const orgMembership = user.organizations[0];
    const organizationId = orgMembership.organizationId;

    // Get recent tasks (last 20 updated)
    const recentTasks = await prisma.task.findMany({
      where: {
        project: {
          organizationId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
      include: {
        project: {
          select: {
            name: true,
            key: true,
          },
        },
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform to activity format
    const activities = recentTasks.map(task => ({
      id: task.id,
      type: 'task_updated',
      user: task.assignee?.name || task.assignee?.email || 'Unknown',
      action: `updated`,
      item: `${task.project.key}-${task.id.substring(0, 3)}`,
      itemTitle: task.title,
      status: task.status,
      timestamp: task.updatedAt,
      timeAgo: getTimeAgo(task.updatedAt),
    }));

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    );
  }
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
