/**
 * Plan definitions — single source of truth for pricing, limits, and features.
 *
 * Stripe price IDs are read from environment variables so the same code works
 * in test mode and production. Chapa uses inline amount-based checkout (no
 * pre-created products required).
 */

export interface PlanDefinition {
  id: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
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
];

export function getPlanById(planId: string): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function getPlanLimits(planId: string) {
  return getPlanById(planId)?.limits ?? PLANS[0].limits;
}
