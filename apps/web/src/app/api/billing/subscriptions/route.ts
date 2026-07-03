import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import { getStripe } from '@/lib/billing/stripe';

/**
 * GET /api/billing/subscriptions?organizationId=xxx
 *
 * Returns the organization's active subscription and recent payments.
 */
export async function GET(req: NextRequest) {
  const user = await resolveAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
  }

  // Verify membership
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, userId: user.id },
  });
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [subscription, payments, org] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        organizationId: orgId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        billingEmail: true,
        maxMembers: true,
        maxProjects: true,
        maxStorage: true,
      },
    }),
  ]);

  return NextResponse.json({
    organization: org,
    subscription,
    payments,
  });
}

/**
 * DELETE /api/billing/subscriptions
 *
 * Cancel the active subscription (at period end).
 * Body: { organizationId: string }
 */
export async function DELETE(req: NextRequest) {
  const user = await resolveAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organizationId } = await req.json();
  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
  }

  // SECURITY: Only OWNER/ADMIN can cancel subscriptions
  const membership = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      organizationId,
      status: 'ACTIVE',
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 });
  }

  // Cancel via provider
  if (subscription.provider === 'STRIPE' && subscription.providerSubId) {
    const stripe = getStripe();
    await stripe.subscriptions.update(subscription.providerSubId, {
      cancel_at_period_end: true,
    });
  }

  // Update local record
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, message: 'Subscription will cancel at period end' });
}
