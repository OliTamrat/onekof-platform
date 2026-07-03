import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { verifyCronAuth } from '@/lib/cron-auth';
import { getPlanLimits } from '@/lib/billing/plans';
import {
  sendRenewalReminderEmail,
  sendPastDueEmail,
  sendTrialExpiredEmail,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

const GRACE_PERIOD_DAYS = 3;

/**
 * POST /api/cron/subscription-renewal
 *
 * Daily cron job (07:00 UTC) that handles subscription renewal lifecycle:
 * 1. Chapa renewal reminders (7 days and 3 days before period end)
 * 2. Chapa grace period: mark PAST_DUE when period ends, send dunning
 * 3. Chapa expired: downgrade to FREE after 3-day grace
 * 4. Stripe sync: send dunning for PAST_DUE Stripe subs
 *
 * All Ethiopian local payments (Telebirr, CBE Birr, Awash) go through Chapa.
 * Chapa does not support auto-recurring — manual renewal required.
 */
export async function POST(request: NextRequest) {
  const { authorized, error } = verifyCronAuth(request);
  if (!authorized) return error!;

  const now = new Date();
  const results = {
    chapaReminders: 0,
    chapaPastDue: 0,
    chapaExpired: 0,
    stripeDunning: 0,
    errors: [] as string[],
  };

  // --- 1. Chapa renewal reminders (7 days and 3 days before) ---
  try {
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const chapaExpiring = await prisma.subscription.findMany({
      where: {
        provider: 'CHAPA',
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now, lte: sevenDays },
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    for (const sub of chapaExpiring) {
      try {
        const owner = sub.organization.members[0]?.user;
        if (!owner?.email || !sub.currentPeriodEnd) continue;

        const daysLeft = Math.ceil(
          (sub.currentPeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        // Send at 7 days and 3 days (daily cron, use windows to catch each once)
        if ((daysLeft >= 6 && daysLeft <= 7) || (daysLeft >= 2 && daysLeft <= 3)) {
          await sendRenewalReminderEmail(
            owner.email,
            sub.organization.name,
            sub.plan,
            daysLeft
          );
          results.chapaReminders++;
        }
      } catch (err) {
        results.errors.push(`Chapa reminder failed for sub ${sub.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Chapa reminder query failed: ${err}`);
  }

  // --- 2. Chapa grace period: period ended, within 3-day grace ---
  try {
    const graceEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const chapaGrace = await prisma.subscription.findMany({
      where: {
        provider: 'CHAPA',
        status: 'ACTIVE',
        currentPeriodEnd: { lt: now, gte: graceEnd },
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    for (const sub of chapaGrace) {
      try {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'PAST_DUE' },
        });

        await prisma.organization.update({
          where: { id: sub.organizationId },
          data: { status: 'ACTIVE' }, // keep accessible during grace
        });

        const owner = sub.organization.members[0]?.user;
        if (owner?.email && sub.currentPeriodEnd) {
          const graceDaysLeft = Math.ceil(
            (sub.currentPeriodEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000 - now.getTime()) /
              (24 * 60 * 60 * 1000)
          );
          await sendPastDueEmail(owner.email, sub.organization.name, sub.plan, graceDaysLeft);
        }

        results.chapaPastDue++;
      } catch (err) {
        results.errors.push(`Chapa grace failed for sub ${sub.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Chapa grace query failed: ${err}`);
  }

  // --- 3. Chapa expired: grace period over, downgrade to FREE ---
  try {
    const graceEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const chapaExpired = await prisma.subscription.findMany({
      where: {
        provider: 'CHAPA',
        status: { in: ['ACTIVE', 'PAST_DUE'] },
        currentPeriodEnd: { lt: graceEnd },
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    const freeLimits = getPlanLimits('FREE');

    for (const sub of chapaExpired) {
      try {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        await prisma.organization.update({
          where: { id: sub.organizationId },
          data: {
            plan: 'FREE',
            status: 'ACTIVE',
            maxMembers: freeLimits.maxMembers,
            maxProjects: freeLimits.maxProjects,
            maxStorage: freeLimits.maxStorageGB,
            currentPeriodEnd: null,
          },
        });

        const owner = sub.organization.members[0]?.user;
        if (owner?.email) {
          await sendTrialExpiredEmail(owner.email, sub.organization.name);
        }

        results.chapaExpired++;
      } catch (err) {
        results.errors.push(`Chapa expiry failed for sub ${sub.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Chapa expiry query failed: ${err}`);
  }

  // --- 4. Stripe sync: dunning for PAST_DUE subs ---
  try {
    const stripePastDue = await prisma.subscription.findMany({
      where: {
        provider: 'STRIPE',
        status: 'PAST_DUE',
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'OWNER' },
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    for (const sub of stripePastDue) {
      try {
        const owner = sub.organization.members[0]?.user;
        if (!owner?.email) continue;

        await sendPastDueEmail(owner.email, sub.organization.name, sub.plan, GRACE_PERIOD_DAYS);
        results.stripeDunning++;
      } catch (err) {
        results.errors.push(`Stripe dunning failed for sub ${sub.id}: ${err}`);
      }
    }
  } catch (err) {
    results.errors.push(`Stripe dunning query failed: ${err}`);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
