import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { requireSuperAdmin } from '@/lib/security/superadmin';
import { logAdminAction, AdminActions } from '@/lib/security/admin-audit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/cleanup
 *
 * Deletes UserActivity records older than the configured retention period.
 * Default: 90 days. Override with ?days=N query parameter.
 *
 * This endpoint can be called:
 * - Manually from the admin panel
 * - Via Vercel Cron (vercel.json: { "crons": [{ "path": "/api/admin/cleanup", "schedule": "0 3 * * *" }] })
 * - Via system cron on Tier 2: curl -X POST http://localhost:3000/api/admin/cleanup
 *
 * Requires superadmin authentication OR a matching CRON_SECRET header for automated runs.
 */
export async function POST(request: NextRequest) {
  // Allow cron jobs with CRON_SECRET header (Vercel Cron sends this automatically)
  const cronSecret = request.headers.get('authorization');
  const isCronJob = cronSecret === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCronJob) {
    const { authorized, error } = await requireSuperAdmin();
    if (!authorized) return error!;
  }

  const url = new URL(request.url);
  const retentionDays = parseInt(url.searchParams.get('days') || '90', 10);

  if (isNaN(retentionDays) || retentionDays < 7) {
    return NextResponse.json(
      { error: 'Retention period must be at least 7 days' },
      { status: 400 }
    );
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  try {
    // Count before delete for reporting
    const countBefore = await prisma.userActivity.count({
      where: { createdAt: { lt: cutoffDate } },
    });

    if (countBefore === 0) {
      return NextResponse.json({
        message: 'No records to clean up',
        deleted: 0,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
      });
    }

    // Delete in batches to avoid long-running transactions
    let totalDeleted = 0;
    const BATCH_SIZE = 5000;

    while (totalDeleted < countBefore) {
      const batch = await prisma.userActivity.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      totalDeleted += batch.count;

      if (batch.count < BATCH_SIZE) break;
    }

    const countAfter = await prisma.userActivity.count();

    logAdminAction({
      adminUsername: isCronJob ? 'cron' : 'superadmin',
      adminRole: isCronJob ? 'SYSTEM' : 'OWNER',
      action: AdminActions.CLEANUP,
      resource: 'user_activity',
      details: { deleted: totalDeleted, remaining: countAfter, retentionDays },
    });

    return NextResponse.json({
      message: `Cleaned up ${totalDeleted} activity records older than ${retentionDays} days`,
      deleted: totalDeleted,
      remaining: countAfter,
      retentionDays,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (err) {
    console.error('Cleanup error:', err);
    return NextResponse.json(
      { error: 'Failed to clean up activity records' },
      { status: 500 }
    );
  }
}
