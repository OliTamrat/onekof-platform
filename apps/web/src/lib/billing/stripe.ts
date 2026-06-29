/**
 * Stripe client — server-side only.
 *
 * Uses STRIPE_SECRET_KEY from environment. In test mode, this is the
 * sk_test_... key which creates real-looking test subscriptions without
 * charging real money.
 */
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/**
 * Create or retrieve a Stripe customer for an organization.
 */
export async function getOrCreateStripeCustomer(
  orgId: string,
  orgName: string,
  billingEmail: string
): Promise<string> {
  const stripe = getStripe();

  // Search for existing customer by metadata
  const existing = await stripe.customers.search({
    query: `metadata["onekof_org_id"]:"${orgId}"`,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    name: orgName,
    email: billingEmail,
    metadata: {
      onekof_org_id: orgId,
    },
  });

  return customer.id;
}
