'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Lock,
  Shield,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Landmark,
  Smartphone,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PaymentMethod = 'card' | 'telebirr' | 'cbe_birr' | 'awash';

const CHAPA_METHODS: { id: PaymentMethod; name: string; icon: typeof Smartphone }[] = [
  { id: 'telebirr', name: 'Telebirr', icon: Smartphone },
  { id: 'cbe_birr', name: 'CBE Birr', icon: Building2 },
  { id: 'awash', name: 'Awash Bank', icon: Landmark },
  { id: 'card', name: 'Debit/Credit Card', icon: CreditCard },
];

export default function DemoCheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();

  const orgId = params.get('orgId') || '';
  const orgName = params.get('orgName') || 'Organization';
  const planId = params.get('planId') || 'STARTER';
  const planName = params.get('planName') || 'Starter';
  const interval = (params.get('interval') || 'monthly') as 'monthly' | 'yearly';
  const provider = params.get('provider') || 'stripe';
  const amount = Number(params.get('amount') || '0');
  const currency = params.get('currency') || 'USD';

  const isChapa = provider === 'chapa';

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isChapa ? 'telebirr' : 'card');

  // Chapa mobile
  const [phoneNumber, setPhoneNumber] = useState('');

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  function validate(): boolean {
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        setError('Please enter expiry as MM/YY');
        return false;
      }
      if (cardCvc.length < 3) {
        setError('Please enter a valid CVC');
        return false;
      }
      if (!cardName.trim()) {
        setError('Please enter the cardholder name');
        return false;
      }
    } else {
      // Mobile payment
      const phone = phoneNumber.replace(/\D/g, '');
      if (phone.length < 9) {
        setError('Please enter a valid phone number');
        return false;
      }
    }
    setError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);
    setError('');

    // Brief visual feedback
    await new Promise((r) => setTimeout(r, 300));

    try {
      const res = await fetch('/api/billing/demo-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          planId,
          interval,
          provider,
          cardLast4: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/dashboard/settings/billing?success=true');
      } else {
        setError(data.error || 'Payment failed. Please try again.');
        setProcessing(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E11]">
      {/* Top bar */}
      <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link
            href="/pricing"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Payment Form */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {isChapa ? 'Pay with Chapa' : 'Pay with Card'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
              Complete your subscription to the {planName} plan
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {isChapa ? (
                <>
                  {/* Chapa payment method selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white/70">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CHAPA_METHODS.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all',
                              paymentMethod === method.id
                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-white/[0.1] dark:text-white/60 dark:hover:border-white/[0.2]'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {method.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {paymentMethod === 'card' ? (
                    <CardForm
                      cardNumber={cardNumber}
                      cardExpiry={cardExpiry}
                      cardCvc={cardCvc}
                      cardName={cardName}
                      onCardNumber={(v) => setCardNumber(formatCardNumber(v))}
                      onExpiry={(v) => setCardExpiry(formatExpiry(v))}
                      onCvc={(v) => setCardCvc(v.replace(/\D/g, '').slice(0, 4))}
                      onName={setCardName}
                    />
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/70">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 dark:border-white/[0.1] dark:bg-[#0B0E11] dark:text-white/50">
                          +251
                        </div>
                        <input
                          type="tel"
                          placeholder="9XX XXX XXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-11 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-[#12161B] dark:text-white dark:placeholder-white/30"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400 dark:text-white/30">
                        You will receive a payment confirmation on this number
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Stripe — card only */
                <CardForm
                  cardNumber={cardNumber}
                  cardExpiry={cardExpiry}
                  cardCvc={cardCvc}
                  cardName={cardName}
                  onCardNumber={(v) => setCardNumber(formatCardNumber(v))}
                  onExpiry={(v) => setCardExpiry(formatExpiry(v))}
                  onCvc={(v) => setCardCvc(v.replace(/\D/g, '').slice(0, 4))}
                  onName={setCardName}
                />
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay {currency === 'ETB' ? `${amount.toLocaleString()} ETB` : `$${amount}`}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-white/30">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  256-bit encrypted
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  PCI compliant
                </span>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="md:w-72">
            <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/[0.08] dark:bg-[#12161B]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/50">Plan</span>
                  <span className="font-medium text-gray-900 dark:text-white">{planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/50">Billing</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{interval}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/50">Organization</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{orgName}</span>
                </div>
              </div>

              <div className="my-4 border-t border-gray-100 dark:border-white/[0.05]" />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {currency === 'ETB' ? `${amount.toLocaleString()} ETB` : `$${amount}`}
                  <span className="text-xs font-normal text-gray-500 dark:text-white/40">
                    /{interval === 'yearly' ? 'yr' : 'mo'}
                  </span>
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">Test Mode</span> — This is a simulated payment
                  for demonstration. No real charges will be made. Use card{' '}
                  <code className="rounded bg-amber-100 dark:bg-amber-900/30 px-1 font-mono">4242 4242 4242 4242</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing overlay */}
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-8 text-center shadow-2xl dark:bg-[#12161B]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Processing Payment
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              {isChapa
                ? 'Verifying payment with Chapa...'
                : 'Authorizing card with Stripe...'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-white/30">
              <Lock className="h-3 w-3" />
              Encrypted & secure
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardForm({
  cardNumber,
  cardExpiry,
  cardCvc,
  cardName,
  onCardNumber,
  onExpiry,
  onCvc,
  onName,
}: {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  onCardNumber: (v: string) => void;
  onExpiry: (v: string) => void;
  onCvc: (v: string) => void;
  onName: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/70">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => onCardNumber(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-[#12161B] dark:text-white dark:placeholder-white/30"
          />
          <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/30" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/70">
            Expiry
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            value={cardExpiry}
            onChange={(e) => onExpiry(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-[#12161B] dark:text-white dark:placeholder-white/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/70">
            CVC
          </label>
          <input
            type="text"
            placeholder="123"
            value={cardCvc}
            onChange={(e) => onCvc(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-[#12161B] dark:text-white dark:placeholder-white/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/70">
          Cardholder Name
        </label>
        <input
          type="text"
          placeholder="Name on card"
          value={cardName}
          onChange={(e) => onName(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/[0.1] dark:bg-[#12161B] dark:text-white dark:placeholder-white/30"
        />
      </div>
    </div>
  );
}
