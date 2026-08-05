/**
 * Plan definitions — single source of truth for pricing, limits, and features.
 *
 * Stripe price IDs are read from environment variables so the same code works
 * in test mode and production. Chapa uses inline amount-based checkout (no
 * pre-created products required).
 */

/**
 * Stand-in for "no practical ceiling" on the negotiated tiers.
 *
 * Deliberately a large finite number rather than -1 or Infinity: the limits are
 * rendered as usage percentages (count / max * 100), and a sentinel would turn
 * those into negative or NaN values in the admin console.
 */
const UNLIMITED = 1_000_000;

export interface PlanDefinition {
  id:
    | 'FREE'
    | 'STARTER'
    | 'PROFESSIONAL'
    | 'BUSINESS'
    | 'REGIONAL'
    | 'ENTERPRISE'
    | 'GOVERNMENT';
  name: string;
  nameAm: string; // Amharic
  description: string;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  monthlyPriceETB: number;
  yearlyPriceETB: number;
  limits: {
    maxMembers: number;
    maxProjects: number;
    maxStorageGB: number;
  };
  features: string[];
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  popular?: boolean;
  /**
   * Tiers that are tender-procured or individually negotiated. These carry no
   * self-serve price, are never offered through checkout, and are assigned by
   * an administrator once a contract is signed.
   */
  contactSalesOnly?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'FREE',
    name: 'Free',
    nameAm: 'ነጻ',
    description: 'For individuals and small teams getting started',
    monthlyPriceUSD: 0,
    yearlyPriceUSD: 0,
    monthlyPriceETB: 0,
    yearlyPriceETB: 0,
    limits: {
      maxMembers: 5,
      maxProjects: 3,
      maxStorageGB: 1,
    },
    features: [
      'Up to 5 team members',
      'Up to 3 projects',
      '1 GB storage',
      'Basic Kanban board',
      'Ethiopian calendar',
      'Email support',
    ],
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    nameAm: 'ጀማሪ',
    description: 'For growing teams that need more power',
    monthlyPriceUSD: 12,
    yearlyPriceUSD: 120,
    monthlyPriceETB: 600,
    yearlyPriceETB: 6000,
    limits: {
      maxMembers: 25,
      maxProjects: 15,
      maxStorageGB: 10,
    },
    features: [
      'Up to 25 team members',
      'Up to 15 projects',
      '10 GB storage',
      'Advanced Kanban + Gantt',
      'Budget tracking (ETB/USD)',
      'Team goals & OKRs',
      'Priority email support',
    ],
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    nameAm: 'ሙያዊ',
    description: 'For organizations that need full capabilities',
    monthlyPriceUSD: 29,
    yearlyPriceUSD: 290,
    monthlyPriceETB: 1450,
    yearlyPriceETB: 14500,
    limits: {
      maxMembers: 100,
      maxProjects: 50,
      maxStorageGB: 50,
    },
    features: [
      'Up to 100 team members',
      'Up to 50 projects',
      '50 GB storage',
      'AI document analysis',
      'Custom workflows & automation',
      'Advanced reporting & analytics',
      'Compliance & audit logs',
      'API access',
      'Priority support + onboarding',
    ],
    stripePriceIdMonthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || '',
    popular: true,
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    nameAm: 'ቢዝነስ',
    description: 'For NGOs, universities and large organizations',
    monthlyPriceUSD: 165,
    yearlyPriceUSD: 1625,
    monthlyPriceETB: 26000,
    yearlyPriceETB: 260000,
    limits: {
      maxMembers: 200,
      maxProjects: 500,
      maxStorageGB: 200,
    },
    features: [
      'Up to 200 team members',
      'Up to 500 projects',
      '200 GB storage',
      'AI document processing (400 documents / month)',
      'Portfolio & programme management',
      'Budget revisions & audit trail',
      'Custom integrations',
      'Dedicated onboarding',
      'SLA guarantee (99.9%)',
    ],
    stripePriceIdMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
  },
  {
    id: 'REGIONAL',
    name: 'Regional',
    nameAm: 'ክልላዊ',
    description: 'For regional bureaus and sub-national agencies',
    monthlyPriceUSD: 115,
    yearlyPriceUSD: 1125,
    monthlyPriceETB: 18000,
    yearlyPriceETB: 180000,
    limits: {
      maxMembers: 100,
      maxProjects: 250,
      maxStorageGB: 100,
    },
    features: [
      'Up to 100 team members',
      'Up to 250 projects',
      '100 GB storage',
      'AI document processing (250 documents / month)',
      'Full interface in Amharic, Afaan Oromo, Tigrinya and Somali',
      'Budget revisions & audit trail',
      'Data sovereignty (Ethiopian hosting)',
      'Dedicated onboarding & training',
      'SLA guarantee (99.5%)',
    ],
    stripePriceIdMonthly: process.env.STRIPE_REGIONAL_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_REGIONAL_YEARLY_PRICE_ID || '',
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    nameAm: 'ድርጅት',
    description: 'For large organizations with custom needs',
    monthlyPriceUSD: 79,
    yearlyPriceUSD: 790,
    monthlyPriceETB: 3950,
    yearlyPriceETB: 39500,
    limits: {
      maxMembers: 500,
      maxProjects: 200,
      maxStorageGB: 200,
    },
    features: [
      'Up to 500 team members',
      'Up to 200 projects',
      '200 GB storage',
      'On-premise deployment option',
      'Data sovereignty (Ethiopian hosting)',
      'SSO / SAML integration',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'Custom integrations',
      'White-label branding',
    ],
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
  },
  {
    id: 'GOVERNMENT',
    name: 'Government',
    nameAm: 'መንግሥታዊ',
    description: 'For ministries, federal agencies and public programmes',
    // Zero, and never charged. Government agreements are tender-procured and
    // invoiced against a signed contract, so there is no self-serve price to
    // quote. checkoutablePlanIds() excludes this tier precisely so that these
    // zeroes can never reach a payment provider as an amount.
    monthlyPriceUSD: 0,
    yearlyPriceUSD: 0,
    monthlyPriceETB: 0,
    yearlyPriceETB: 0,
    limits: {
      maxMembers: UNLIMITED,
      maxProjects: UNLIMITED,
      maxStorageGB: UNLIMITED,
    },
    features: [
      'Unlimited members and projects',
      'AI document processing (2,000 documents / month)',
      'Multi-department portfolio management',
      'Full interface in Amharic, Afaan Oromo, Tigrinya and Somali',
      'Append-only audit logs for budget and administrative actions',
      'In-country deployment on sovereign infrastructure',
      'On-premise deployment option',
      'Dedicated implementation and account team',
      'Custom SLA',
    ],
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    contactSalesOnly: true,
  },
];

export function getPlanById(planId: string): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === planId);
}

/**
 * Plans a customer may buy through self-serve checkout.
 *
 * FREE has nothing to charge for, and the contact-sales tiers carry a price of
 * zero because their real price lives in a signed contract. Sending either to a
 * payment provider would attempt a zero-amount transaction, so checkout
 * validation is derived from this list rather than from the full plan set.
 */
export function checkoutablePlanIds(): string[] {
  return PLANS.filter((p) => p.id !== 'FREE' && !p.contactSalesOnly).map((p) => p.id);
}

export function getPlanLimits(planId: string) {
  return getPlanById(planId)?.limits ?? PLANS[0].limits;
}
