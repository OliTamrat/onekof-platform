import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { verifyCronAuth } from '@/lib/cron-auth';
import { sendTrialDay1Email, sendTrialDay3Email } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cron/trial-drip
 *
 * Daily cron job (05:00 UTC) — sends onboarding drip emails during trial:
 *
 *   Day 1: Welcome + quick start guide
 *   Day 3: Feature highlights + nudge to explore
 *   Day 5: (handled by trial-expiry cron — "trial ends in 2 days")
 *   Day 7: (handled by trial-expiry cron — expired + downgrade)
 *
 * Uses time-window filtering for idempotency — each org falls into a
 * 24-hour window exactly once per drip stage.
 */
export async function POST(request: NextRequest) {
  const { authorized, error } = verifyCronAuth(request);
  if (!authorized) return error!;

  const now = new Date();
  const results = { day1: 0, day3: 0, errors: [] as string[] };

  // --- Day 1: orgs created 0–24 hours ago ---
  try {
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const day1Orgs = await prisma.organization.findMany({
      where: {
        status: 'TRIAL',
        type: { not: 'government' },
        createdAt: { gte: oneDayAgo, lt: now },
      },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    for (const org of day1Orgs) {
      try {
        const owner = org.members[0]?.user;
        if (!owner?.email) continue;
        await sendTrialDay1Email(owner.email, owner.name || 'there', org.name);
        results.day1++;
      } catch (err) {
        results.errors.push(`Day 1 failed for org ${org.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Day 1 query failed: ${err}`);
  }

  // --- Day 3: orgs created 48–72 hours ago ---
  try {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const day3Orgs = await prisma.organization.findMany({
      where: {
        status: 'TRIAL',
        type: { not: 'government' },
        createdAt: { gte: threeDaysAgo, lt: twoDaysAgo },
      },
      include: {
        members: {
          where: { role: 'OWNER' },
          include: { user: { select: { email: true, name: true } } },
        },
      },
    });

    for (const org of day3Orgs) {
      try {
        const owner = org.members[0]?.user;
        if (!owner?.email) continue;
        await sendTrialDay3Email(owner.email, owner.name || 'there', org.name);
        results.day3++;
      } catch (err) {
        results.errors.push(`Day 3 failed for org ${org.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Day 3 query failed: ${err}`);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
