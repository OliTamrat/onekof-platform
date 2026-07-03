import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import { getPlanById } from '@/lib/billing/plans';
import { z } from 'zod';

const CheckoutSchema = z.object({
  organizationId: z.string().min(1),
  planId: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  interval: z.enum(['monthly', 'yearly']),
  provider: z.enum(['stripe', 'chapa']),
});

const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;
const isChapaConfigured = !!process.env.CHAPA_SECRET_KEY;

/**
 * POST /api/billing/checkout
 *
 * Creates a checkout session. If provider API keys are not configured,
 * falls back to demo mode with a simulated checkout page that creates
 * real database records for testing/INSA certification.
 */
export async function POST(req: NextRequest) {
  const user = await resolveAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { organizationId, planId, interval, provider } = parsed.data;

  const plan = getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // SECURITY: Only OWNER/ADMIN can initiate billing changes
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
    include: { organization: true },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden — must be org owner or admin' }, { status: 403 });
  }

  const org = membership.organization;
  const origin = req.nextUrl.origin;

  try {
    // Check if real provider is configured; otherwise use demo mode
    if (provider === 'stripe' && isStripeConfigured) {
      const { getStripe, getOrCreateStripeCustomer } = await import('@/lib/billing/stripe');
      return await handleStripeCheckout(getStripe, getOrCreateStripeCustomer, org, plan, interval, user, origin);
    } else if (provider === 'chapa' && isChapaConfigured) {
      const { chapaInitialize, generateTxRef } = await import('@/lib/billing/chapa');
      return await handleChapaCheckout(chapaInitialize, generateTxRef, org, plan, interval, user, origin);
    } else {
      // Demo mode — redirect to simulated checkout
      return handleDemoCheckout(org, plan, interval, provider, origin);
    }
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}

function handleDemoCheckout(
  org: any,
  plan: any,
  interval: 'monthly' | 'yearly',
  provider: string,
  origin: string
) {
  const params = new URLSearchParams({
    orgId: org.id,
    orgName: org.name,
    planId: plan.id,
    planName: plan.name,
    interval,
    provider,
    amount: provider === 'chapa'
      ? String(interval === 'yearly' ? plan.yearlyPriceETB : plan.monthlyPriceETB)
      : String(interval === 'yearly' ? plan.yearlyPriceUSD : plan.monthlyPriceUSD),
    currency: provider === 'chapa' ? 'ETB' : 'USD',
  });

  return NextResponse.json({
    url: `${origin}/billing/checkout?${params.toString()}`,
    demo: true,
  });
}

async function handleStripeCheckout(
  getStripe: any,
  getOrCreateStripeCustomer: any,
  org: any,
  plan: any,
  interval: 'monthly' | 'yearly',
  user: { id: string; email: string; name: string | null },
  origin: string
) {
  const stripe = getStripe();
  const billingEmail = org.billingEmail || user.email;
  const customerId = await getOrCreateStripeCustomer(org.id, org.name, billingEmail);

  const priceId = interval === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;

  let lineItems;
  if (priceId) {
    lineItems = [{ price: priceId, quantity: 1 }];
  } else {
    const unitAmount = interval === 'yearly' ? plan.yearlyPriceUSD * 100 : plan.monthlyPriceUSD * 100;
    lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Onekof ${plan.name} Plan`, description: plan.description },
        unit_amount: unitAmount,
        recurring: { interval: interval === 'yearly' ? 'year' as const : 'month' as const },
      },
      quantity: 1,
    }];
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${origin}/dashboard/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=true`,
    metadata: { onekof_org_id: org.id, onekof_plan_id: plan.id, onekof_interval: interval },
    subscription_data: { metadata: { onekof_org_id: org.id, onekof_plan_id: plan.id } },
  });

  return NextResponse.json({ url: session.url });
}

async function handleChapaCheckout(
  chapaInitialize: any,
  generateTxRef: any,
  org: any,
  plan: any,
  interval: 'monthly' | 'yearly',
  user: { id: string; email: string; name: string | null },
  origin: string
) {
  const amount = interval === 'yearly' ? plan.yearlyPriceETB : plan.monthlyPriceETB;
  const txRef = generateTxRef(org.id, plan.id);

  await prisma.payment.create({
    data: {
      organizationId: org.id,
      amount: amount * 100,
      currency: 'ETB',
      status: 'PENDING',
      provider: 'CHAPA',
      providerPayId: txRef,
      description: `Onekof ${plan.name} Plan — ${interval === 'yearly' ? 'Yearly' : 'Monthly'}`,
    },
  });

  const nameParts = (user.name || 'Customer').split(' ');
  const result = await chapaInitialize({
    amount,
    currency: 'ETB',
    email: user.email,
    first_name: nameParts[0] || 'Customer',
    last_name: nameParts.slice(1).join(' ') || '-',
    tx_ref: txRef,
    callback_url: `${origin}/api/webhooks/chapa`,
    return_url: `${origin}/dashboard/settings/billing?success=true&tx_ref=${txRef}`,
    customization: {
      title: `Onekof ${plan.name}`,
      description: `${interval === 'yearly' ? 'Yearly' : 'Monthly'} subscription`,
      logo: 'https://onekof.com/icon-192.png',
    },
    meta: { onekof_org_id: org.id, onekof_plan_id: plan.id, onekof_interval: interval },
  });

  return NextResponse.json({ url: result.data.checkout_url });
}
