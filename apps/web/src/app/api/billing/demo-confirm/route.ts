import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import { getPlanById, getPlanLimits } from '@/lib/billing/plans';

/**
 * POST /api/billing/demo-confirm
 *
 * Demo mode payment confirmation. Creates real Subscription and Payment
 * records in the database and upgrades the organization plan.
 * This simulates what Stripe/Chapa webhooks would do.
 *
 * Body: { organizationId, planId, interval, provider, cardLast4 }
 */
export async function POST(req: NextRequest) {
  const user = await resolveAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organizationId, planId, interval, provider, cardLast4 } = await req.json();

  if (!organizationId || !planId || !interval || !provider) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify membership
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN', 'MEMBER'] },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

  // Create subscription
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

  // Create payment record
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

  // Upgrade organization
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
