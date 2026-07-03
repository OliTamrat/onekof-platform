import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/billing/stripe';
import { prisma } from '@onekof/database';
import { getPlanById, getPlanLimits } from '@/lib/billing/plans';

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed -> create subscription record, upgrade org plan
 * - invoice.payment_succeeded -> record payment
 * - customer.subscription.updated -> sync status changes
 * - customer.subscription.deleted -> downgrade to FREE
 *
 * Webhook payloads are typed as `any` because Stripe SDK types change
 * frequently but the runtime JSON shape is stable (snake_case fields).
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: any) {
  const orgId = session.metadata?.onekof_org_id;
  const planId = session.metadata?.onekof_plan_id;
  const interval = session.metadata?.onekof_interval as 'monthly' | 'yearly';

  if (!orgId || !planId) return;

  const plan = getPlanById(planId);
  if (!plan) return;

  const stripe = getStripe();
  const subscription: any = await stripe.subscriptions.retrieve(session.subscription as string);

  const amount = interval === 'yearly' ? plan.yearlyPriceUSD * 100 : plan.monthlyPriceUSD * 100;

  // Idempotency: skip if subscription already exists for this Stripe sub ID
  const existingSub = await prisma.subscription.findFirst({
    where: { providerSubId: subscription.id },
  });
  if (existingSub) return;

  await prisma.subscription.create({
    data: {
      organizationId: orgId,
      plan: planId as any,
      interval: interval === 'yearly' ? 'YEARLY' : 'MONTHLY',
      status: 'ACTIVE',
      provider: 'STRIPE',
      providerSubId: subscription.id,
      providerCustId: subscription.customer as string,
      currentPeriodStart: new Date((subscription.current_period_start || Math.floor(Date.now() / 1000)) * 1000),
      currentPeriodEnd: new Date((subscription.current_period_end || Math.floor(Date.now() / 1000) + 2592000) * 1000),
      amount,
      currency: 'USD',
    },
  });

  // Upgrade organization
  const limits = getPlanLimits(planId);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      plan: planId as any,
      status: 'ACTIVE',
      subscriptionId: subscription.id,
      currentPeriodEnd: periodEnd,
      maxMembers: limits.maxMembers,
      maxProjects: limits.maxProjects,
      maxStorage: limits.maxStorageGB,
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subId = invoice.subscription;
  if (!subId) return;

  const sub = await prisma.subscription.findFirst({
    where: { providerSubId: subId },
  });

  if (!sub) return;

  // Idempotency: skip if payment already recorded for this invoice
  const payId = invoice.payment_intent || invoice.id;
  const existingPayment = await prisma.payment.findFirst({
    where: { providerPayId: payId, provider: 'STRIPE' },
  });
  if (existingPayment) return;

  await prisma.payment.create({
    data: {
      organizationId: sub.organizationId,
      subscriptionId: sub.id,
      amount: invoice.amount_paid || 0,
      currency: (invoice.currency || 'usd').toUpperCase(),
      status: 'SUCCEEDED',
      provider: 'STRIPE',
      providerPayId: payId,
      invoiceUrl: invoice.hosted_invoice_url || null,
      receiptUrl: invoice.invoice_pdf || null,
      description: `Invoice ${invoice.number || invoice.id}`,
    },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubId: subscription.id },
  });

  if (!sub) return;

  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    trialing: 'TRIALING',
  };

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: (statusMap[subscription.status] || 'ACTIVE') as any,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : undefined,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubId: subscription.id },
  });

  if (!sub) return;

  // Mark subscription canceled
  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: 'CANCELED', canceledAt: new Date() },
  });

  // Downgrade org to FREE
  const freeLimits = getPlanLimits('FREE');
  await prisma.organization.update({
    where: { id: sub.organizationId },
    data: {
      plan: 'FREE',
      status: 'ACTIVE',
      subscriptionId: null,
      currentPeriodEnd: null,
      maxMembers: freeLimits.maxMembers,
      maxProjects: freeLimits.maxProjects,
      maxStorage: freeLimits.maxStorageGB,
    },
  });
}
