import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { chapaVerify } from '@/lib/billing/chapa';
import { getPlanById, getPlanLimits } from '@/lib/billing/plans';

/**
 * POST /api/webhooks/chapa  (also handles GET for callback_url)
 *
 * Chapa sends a webhook after payment completes.
 * We verify the transaction and upgrade the organization.
 */
export async function POST(req: NextRequest) {
  return handleChapaCallback(req);
}

export async function GET(req: NextRequest) {
  return handleChapaCallback(req);
}

async function handleChapaCallback(req: NextRequest) {
  // Chapa sends tx_ref in body (POST) or query (GET callback)
  let txRef: string | null = null;

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      txRef = body.tx_ref || body.trx_ref;
    } catch {
      // Try query params
    }
  }

  if (!txRef) {
    txRef = req.nextUrl.searchParams.get('tx_ref') || req.nextUrl.searchParams.get('trx_ref');
  }

  if (!txRef) {
    return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
  }

  // Find the pending payment
  const payment = await prisma.payment.findFirst({
    where: { providerPayId: txRef, provider: 'CHAPA' },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status === 'SUCCEEDED') {
    return NextResponse.json({ message: 'Already processed' });
  }

  try {
    // Verify with Chapa API
    const verification = await chapaVerify(txRef);

    if (verification.data.status === 'success') {
      // Update payment record
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          providerMethod: verification.data.method || 'unknown',
        },
      });

      // Extract plan info from tx_ref: onekof-{orgId}-{planId}-{timestamp}-{random}
      const parts = txRef.split('-');
      const planId = parts[2]?.toUpperCase();
      const plan = getPlanById(planId || '');

      if (plan) {
        const limits = getPlanLimits(plan.id);

        // Determine interval from payment amount
        const amountETB = payment.amount / 100;
        const interval = amountETB === plan.yearlyPriceETB ? 'YEARLY' : 'MONTHLY';
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (interval === 'YEARLY' ? 12 : 1));

        // Create subscription record
        await prisma.subscription.create({
          data: {
            organizationId: payment.organizationId,
            plan: plan.id as any,
            interval: interval as any,
            status: 'ACTIVE',
            provider: 'CHAPA',
            providerSubId: txRef,
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
            amount: payment.amount,
            currency: 'ETB',
          },
        });

        // Upgrade organization
        await prisma.organization.update({
          where: { id: payment.organizationId },
          data: {
            plan: plan.id as any,
            status: 'ACTIVE',
            subscriptionId: txRef,
            currentPeriodEnd: periodEnd,
            maxMembers: limits.maxMembers,
            maxProjects: limits.maxProjects,
            maxStorage: limits.maxStorageGB,
          },
        });
      }

      return NextResponse.json({ message: 'Payment verified and subscription activated' });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Chapa verification error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
