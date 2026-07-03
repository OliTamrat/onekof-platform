import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { chapaVerify } from '@/lib/billing/chapa';
import { getPlanById, getPlanLimits } from '@/lib/billing/plans';
import { createHmac } from 'crypto';

/**
 * POST /api/webhooks/chapa  (also handles GET for callback_url)
 *
 * Chapa sends a webhook after payment completes.
 * We verify the transaction signature, validate the amount, and upgrade the org.
 *
 * SECURITY:
 * - HMAC signature verification via CHAPA_WEBHOOK_SECRET
 * - Payment amount verification against plan price
 * - Idempotency check (skip if already SUCCEEDED)
 * - Payment record must exist (created during checkout)
 */
export async function POST(req: NextRequest) {
  return handleChapaCallback(req);
}

export async function GET(req: NextRequest) {
  return handleChapaCallback(req);
}

async function handleChapaCallback(req: NextRequest) {
  // --- Signature verification for POST webhooks ---
  if (req.method === 'POST') {
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const chapaSignature = req.headers.get('x-chapa-signature') || req.headers.get('chapa-signature');
      if (!chapaSignature) {
        console.error('Chapa webhook: missing signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
      }

      const rawBody = await req.text();
      const expectedSignature = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

      if (chapaSignature !== expectedSignature) {
        console.error('Chapa webhook: signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }

      // Parse the verified body
      let body: any;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }

      const txRef = body.tx_ref || body.trx_ref;
      if (!txRef) {
        return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
      }

      return processPayment(txRef);
    }
  }

  // --- Fallback: extract tx_ref from body or query params ---
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

  return processPayment(txRef);
}

async function processPayment(txRef: string) {
  // Find the pending payment (must exist — created during checkout)
  const payment = await prisma.payment.findFirst({
    where: { providerPayId: txRef, provider: 'CHAPA' },
  });

  if (!payment) {
    console.error(`Chapa webhook: no payment record for tx_ref ${txRef}`);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Idempotency: skip if already processed
  if (payment.status === 'SUCCEEDED') {
    return NextResponse.json({ message: 'Already processed' });
  }

  try {
    // Verify with Chapa API (server-to-server, uses CHAPA_SECRET_KEY)
    const verification = await chapaVerify(txRef);

    if (verification.data.status === 'success') {
      // P1: Verify payment amount matches what we expected
      const verifiedAmountCents = Math.round(verification.data.amount * 100);
      if (verifiedAmountCents !== payment.amount) {
        console.error(
          `Chapa webhook: amount mismatch for ${txRef}. Expected ${payment.amount}, got ${verifiedAmountCents}`
        );
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

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

        // Idempotency: check if subscription already exists for this tx_ref
        const existingSub = await prisma.subscription.findFirst({
          where: { providerSubId: txRef },
        });

        if (!existingSub) {
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
