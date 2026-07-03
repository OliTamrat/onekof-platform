import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { verifyCronAuth } from '@/lib/cron-auth';
import { getPlanLimits } from '@/lib/billing/plans';
import { sendTrialWarningEmail, sendTrialExpiredEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/trial-expiry
 *
 * Daily cron job (06:00 UTC) that handles trial lifecycle:
 * 1. Sends warning emails 2 days before trial ends
 * 2. Downgrades expired trials to FREE plan
 *
 * Idempotent: filters on status=TRIAL — once downgraded, org won't be re-processed.
 */
export async function POST(request: NextRequest) {
  const { authorized, error } = verifyCronAuth(request);
  if (!authorized) return error!;

  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const results = { warnings: 0, expired: 0, errors: [] as string[] };

  // --- 1. Warning emails: trials ending in 24–48 hours ---
  try {
    const warningOrgs = await prisma.organization.findMany({
      where: {
        status: 'TRIAL',
        type: { not: 'government' },
        trialEndsAt: {
          gt: now,
          lte: twoDaysFromNow,
        },
      },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    for (const org of warningOrgs) {
      try {
        const owner = org.members[0]?.user;
        if (!owner?.email) continue;

        const daysRemaining = Math.ceil(
          (org.trialEndsAt!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        await sendTrialWarningEmail(owner.email, org.name, daysRemaining);
        results.warnings++;
      } catch (err) {
        results.errors.push(`Warning failed for org ${org.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Warning query failed: ${err}`);
  }

  // --- 2. Expire trials past due ---
  try {
    const expiredOrgs = await prisma.organization.findMany({
      where: {
        status: 'TRIAL',
        type: { not: 'government' },
        trialEndsAt: { lt: now },
      },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    const freeLimits = getPlanLimits('FREE');

    for (const org of expiredOrgs) {
      try {
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            plan: 'FREE',
            status: 'ACTIVE',
            trialEndsAt: null,
            maxMembers: freeLimits.maxMembers,
            maxProjects: freeLimits.maxProjects,
            maxStorage: freeLimits.maxStorageGB,
          },
        });

        const owner = org.members[0]?.user;
        if (owner?.email) {
          await sendTrialExpiredEmail(owner.email, org.name);
        }

        results.expired++;
      } catch (err) {
        results.errors.push(`Expiry failed for org ${org.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Expiry query failed: ${err}`);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
