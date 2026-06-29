import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/billing/plans';

/**
 * GET /api/billing/plans
 *
 * Returns all plan definitions (public endpoint, no auth required).
 * Strips server-only fields (Stripe price IDs).
 */
export async function GET() {
  const publicPlans = PLANS.map(({ stripePriceIdMonthly, stripePriceIdYearly, ...plan }) => plan);
  return NextResponse.json({ plans: publicPlans });
}
