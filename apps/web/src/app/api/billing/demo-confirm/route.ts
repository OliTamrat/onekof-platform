import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import { getPlanById, getPlanLimits } from '@/lib/billing/plans';
import { z } from 'zod';

const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
const isChapaConfigured = !!process.env.CHAPA_SECRET_KEY;

const DemoConfirmSchema = z.object({
  organizationId: z.string().min(1),
  planId: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  interval: z.enum(['monthly', 'yearly']),
  provider: z.enum(['stripe', 'chapa']),
  cardLast4: z.string().length(4).optional(),
});

/**
 * POST /api/billing/demo-confirm
 *
 * Demo mode payment confirmation. Creates real Subscription and Payment
 * records in the database and upgrades the organization plan.
 *
 * SECURITY:
 * - Disabled when real Stripe/Chapa keys are configured (production)
 * - Restricted to OWNER/ADMIN roles only
 * - Input validated with Zod schema
 */
export async function POST(req: NextRequest) {
  // P0: Block in production when real payment providers are configured
  if (isStripeConfigured || isChapaConfigured) {
    return NextResponse.json(
      { error: 'Demo mode is disabled when payment providers are configured' },
      { status: 403 }
    );
  }

  const user = await resolveAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = DemoConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { organizationId, planId, interval, provider, cardLast4 } = parsed.data;

  // P0: Restrict to OWNER/ADMIN only — MEMBER cannot upgrade billing
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden — only org owners and admins can manage billing' }, { status: 403 });
  }

  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const isChapa = provider === 'chapa';
  const currency = isChapa ? 'ETB' : 'USD';
  const priceRaw = isChapa
    ? (interval === 'yearly' ? plan.yearlyPriceETB : plan.monthlyPriceETB)
    : (interval === 'yearly' ? plan.yearlyPriceUSD : plan.monthlyPriceUSD);
  const amountCents = priceRaw * 100;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (interval === 'yearly' ? 12 : 1));

  const demoSubId = `demo_sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const demoPayId = `demo_pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const subscription = await prisma.subscription.create({
    data: {
      organizationId,
      plan: planId as any,
      interval: interval === 'yearly' ? 'YEARLY' : 'MONTHLY',
      status: 'ACTIVE',
      provider: isChapa ? 'CHAPA' : 'STRIPE',
      providerSubId: demoSubId,
      providerCustId: `demo_cust_${organizationId.slice(0, 8)}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      amount: amountCents,
      currency,
    },
  });

  await prisma.payment.create({
    data: {
      organizationId,
      subscriptionId: subscription.id,
      amount: amountCents,
      currency,
      status: 'SUCCEEDED',
      provider: isChapa ? 'CHAPA' : 'STRIPE',
      providerPayId: demoPayId,
      providerMethod: isChapa ? 'telebirr' : `card ending ${cardLast4 || '4242'}`,
      description: `Onekof ${plan.name} Plan — ${interval === 'yearly' ? 'Yearly' : 'Monthly'} (Demo)`,
    },
  });

  const limits = getPlanLimits(planId);
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      plan: planId as any,
      status: 'ACTIVE',
      subscriptionId: demoSubId,
      currentPeriodEnd: periodEnd,
      maxMembers: limits.maxMembers,
      maxProjects: limits.maxProjects,
      maxStorage: limits.maxStorageGB,
    },
  });

  return NextResponse.json({
    success: true,
    subscription: {
      id: subscription.id,
      plan: planId,
      interval,
      periodEnd: periodEnd.toISOString(),
    },
  });
}
