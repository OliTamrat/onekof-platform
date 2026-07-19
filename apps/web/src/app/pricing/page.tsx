'use client';

import { useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Star,
  Zap,
  Shield,
  Crown,
  ArrowRight,
  Loader2,
  CreditCard,
  Landmark,
  X,
  Globe,
  Smartphone,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface PlanDef {
  id: string;
  name: string;
  description: string;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  monthlyPriceETB: number;
  yearlyPriceETB: number;
  limits: { maxMembers: number; maxProjects: number; maxStorageGB: number };
  features: string[];
  popular?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'For individuals getting started',
    monthlyPriceUSD: 0, yearlyPriceUSD: 0, monthlyPriceETB: 0, yearlyPriceETB: 0,
    limits: { maxMembers: 5, maxProjects: 3, maxStorageGB: 1 },
    features: ['Up to 5 team members', 'Up to 3 projects', '1 GB storage', 'Basic Kanban board', 'Ethiopian calendar', 'Email support'],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    description: 'For growing teams',
    monthlyPriceUSD: 12, yearlyPriceUSD: 120, monthlyPriceETB: 600, yearlyPriceETB: 6000,
    limits: { maxMembers: 25, maxProjects: 15, maxStorageGB: 10 },
    features: ['Up to 25 team members', 'Up to 15 projects', '10 GB storage', 'Advanced Kanban + Gantt', 'Budget tracking (ETB/USD)', 'Team goals & OKRs', 'Priority email support'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    description: 'For organizations that need full power',
    monthlyPriceUSD: 29, yearlyPriceUSD: 290, monthlyPriceETB: 1450, yearlyPriceETB: 14500,
    limits: { maxMembers: 100, maxProjects: 50, maxStorageGB: 50 },
    features: ['Up to 100 team members', 'Up to 50 projects', '50 GB storage', 'AI document analysis', 'Custom workflows & automation', 'Advanced reporting & analytics', 'Compliance & audit logs', 'API access', 'Priority support + onboarding'],
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For large-scale deployments',
    monthlyPriceUSD: 79, yearlyPriceUSD: 790, monthlyPriceETB: 3950, yearlyPriceETB: 39500,
    limits: { maxMembers: 500, maxProjects: 200, maxStorageGB: 200 },
    features: ['Up to 500 team members', 'Up to 200 projects', '200 GB storage', 'On-premise deployment option', 'Data sovereignty (Ethiopian hosting)', 'SSO / SAML integration', 'Dedicated account manager', 'SLA guarantee (99.9%)', 'Custom integrations'],
  },
];

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'ETB'>('ETB');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showProviderModal, setShowProviderModal] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const canceled = searchParams.get('canceled');

  async function handleCheckout(planId: string, provider: 'stripe' | 'chapa') {
    if (!session?.user) {
      router.push(`/auth/signin?callbackUrl=/pricing`);
      return;
    }

    setLoadingPlan(planId);
    setShowProviderModal(null);
    setCheckoutError(null);

    try {
      const orgsRes = await fetch('/api/organizations');
      const orgsData = await orgsRes.json();
      const orgs = orgsData.organizations || orgsData;

      if (!orgs || orgs.length === 0) {
        router.push('/onboarding');
        return;
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgs[0].id, planId, interval: billing, provider }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Checkout failed. Please try again.');
      }
    } catch {
      setCheckoutError('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  function getPrice(plan: PlanDef) {
    if (currency === 'ETB') return billing === 'yearly' ? plan.yearlyPriceETB : plan.monthlyPriceETB;
    return billing === 'yearly' ? plan.yearlyPriceUSD : plan.monthlyPriceUSD;
  }

  function formatPrice(amount: number) {
    if (amount === 0) return 'Free';
    return currency === 'ETB' ? `${amount.toLocaleString()}` : `$${amount}`;
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Nav — matches landing page */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0B0E11]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-mark.png?v=2" alt="Onekof" className="h-12 w-12 md:hidden" />
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-14 hidden md:block" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {session?.user ? (
              <Link href="/dashboard" className="rounded-full border border-white/[0.15] px-4 py-2 text-[13px] font-medium hover:border-primary-500 transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="px-4 py-2 text-[13px] font-medium text-white/70 hover:text-white transition-all">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="rounded-full bg-gradient-to-r from-primary-500 to-[#2BB5A2] px-5 py-2 text-[13px] font-semibold shadow-lg shadow-primary-500/20 hover:brightness-110 transition-all flex items-center gap-1.5">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-4 text-center">
        <div className="mb-5 inline-flex items-center gap-2">
          <span className="h-px w-6 bg-primary-500" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">Pricing</span>
        </div>
        <h1 className="mb-4 font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
          Plans that scale with your team
        </h1>
        <p className="mx-auto max-w-xl text-[16px] leading-[1.7] text-white/70">
          Start free. Upgrade when you need more. All plans include Ethiopian calendar, 5 languages, and ETB support.
        </p>

        {canceled && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[13px] text-amber-400">
            Checkout was canceled. You can try again whenever you&apos;re ready.
          </div>
        )}

        {checkoutError && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[13px] text-red-400">
            {checkoutError}
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {/* Billing toggle — matches landing */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#12161B] p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300',
                billing === 'monthly' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300',
                billing === 'yearly' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
              )}
            >
              Yearly
              {billing !== 'yearly' && <span className="ml-1.5 text-[11px] font-semibold text-primary-400">Save 17%</span>}
            </button>
          </div>

          {/* Currency toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#12161B] p-1">
            <button
              onClick={() => setCurrency('ETB')}
              className={cn(
                'rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300',
                currency === 'ETB' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
              )}
            >
              ETB (Br)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={cn(
                'rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300',
                currency === 'USD' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
              )}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards — matches landing page grid */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = getPrice(plan);

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border transition-all duration-400 p-7',
                  plan.popular
                    ? 'scale-[1.02] border-primary-500 bg-[#12161B] shadow-[0_0_40px_rgba(28,140,125,0.25)]'
                    : 'border-white/[0.08] bg-[#12161B] hover:border-white/[0.15]'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-1 text-[11px] font-semibold tracking-[0.05em] shadow-lg">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-[16px] font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-[12px] text-white/70">{plan.description}</p>
                </div>

                <div className="mb-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-[2.5rem] font-semibold">
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className="ml-1 text-[14px] text-white/60">
                        {currency === 'ETB' ? 'ETB' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-6 text-[12px] text-white/60">
                  {price === 0
                    ? 'Free forever, no card required'
                    : `per ${billing === 'yearly' ? 'year' : 'month'}`}
                </p>

                {/* CTA */}
                {plan.id === 'FREE' ? (
                  <Link
                    href={session ? '/dashboard' : '/auth/signup'}
                    className="mb-6 block w-full rounded-full border border-white/[0.15] py-2.5 text-center text-[13px] font-semibold transition-all hover:border-primary-500 hover:shadow-[0_0_20px_rgba(28,140,125,0.25)]"
                  >
                    {session ? 'Current Plan' : 'Get Started Free'}
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowProviderModal(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className={cn(
                      'mb-6 w-full rounded-full py-2.5 text-center text-[13px] font-semibold transition-all duration-300',
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-500 to-[#2BB5A2] text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:brightness-110'
                        : 'border border-white/[0.15] text-white hover:border-primary-500 hover:shadow-[0_0_20px_rgba(28,140,125,0.25)]'
                    )}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                )}

                {/* Limits */}
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {[
                    { value: plan.limits.maxMembers, label: 'Members' },
                    { value: plan.limits.maxProjects, label: 'Projects' },
                    { value: `${plan.limits.maxStorageGB}GB`, label: 'Storage' },
                  ].map(({ value, label }) => (
                    <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
                      <div className="text-[13px] font-bold">{value}</div>
                      <div className="text-[10px] text-white/30">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-white/70">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#2BB5A2]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-[12px] text-white/30">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 256-bit SSL encryption</span>
          <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Stripe + Chapa secure payments</span>
          <span className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Telebirr, CBE Birr, Awash accepted</span>
        </div>
      </div>

      {/* Payment Provider Modal */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#12161B] p-6 shadow-2xl">
            <button
              onClick={() => setShowProviderModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="mb-1 text-[16px] font-semibold">Choose payment method</h3>
            <p className="mb-5 text-[13px] text-white/60">
              Select how you&apos;d like to pay for the{' '}
              <span className="font-medium text-white/70">
                {PLANS.find((p) => p.id === showProviderModal)?.name}
              </span>{' '}
              plan.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleCheckout(showProviderModal, 'stripe')}
                disabled={!!loadingPlan}
                className="flex w-full items-center gap-3.5 rounded-xl border border-white/[0.08] p-4 text-left transition-all hover:border-primary-500/50 hover:bg-primary-500/[0.03] hover:shadow-[0_0_20px_rgba(28,140,125,0.1)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">International Card</div>
                  <div className="text-[12px] text-white/60">Visa, Mastercard, Amex — USD</div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/20" />
              </button>

              <button
                onClick={() => handleCheckout(showProviderModal, 'chapa')}
                disabled={!!loadingPlan}
                className="flex w-full items-center gap-3.5 rounded-xl border border-white/[0.08] p-4 text-left transition-all hover:border-primary-500/50 hover:bg-primary-500/[0.03] hover:shadow-[0_0_20px_rgba(28,140,125,0.1)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Landmark className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">Ethiopian Payment</div>
                  <div className="text-[12px] text-white/60">Telebirr, CBE Birr, Awash — ETB</div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/20" />
              </button>
            </div>

            {loadingPlan && (
              <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-white/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Redirecting to payment...
              </div>
            )}

            <p className="mt-4 text-center text-[11px] text-white/20">
              Payments processed securely. Cancel anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
