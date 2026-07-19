'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  AlertCircle, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2,
  Calendar, Languages, Wallet, Brain, Kanban, Shield, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import { findSubdomainBase, getTenantSlugFromHostname } from '@/lib/routing/subdomain';

interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  useEffect(() => {
    const detectOrganization = async () => {
      const hostname = window.location.hostname;
      let subdomain: string | null = null;
      if (hostname.endsWith('.localhost')) {
        subdomain = hostname.replace('.localhost', '');
      } else if (findSubdomainBase(hostname)) {
        subdomain = getTenantSlugFromHostname(hostname);
      }

      if (subdomain) {
        setIsMainDomain(false);
        try {
          const response = await fetch(`/api/organizations/by-slug/${subdomain}`);
          if (response.ok) {
            const data = await response.json();
            setOrganization(data.organization);
          }
        } catch (err) {
          console.error('Failed to fetch organization:', err);
        }
      }
    };

    detectOrganization();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.atLeast8Chars'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Auto-sign in so the user has a session for onboarding/invitation flows
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but auto-signin failed — send to manual signin
        router.push('/auth/signin?message=Account created. Please sign in.');
        return;
      }

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (data.hasPendingInvitations) {
        router.push('/select-organization');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordChecks = [
    { label: t('auth.atLeast8Chars'), met: password.length >= 8 },
    { label: t('auth.containsNumber'), met: /\d/.test(password) },
    { label: t('auth.containsUppercase'), met: /[A-Z]/.test(password) },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Top bar — back + language */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-4">
        <Link href="/" className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {t('common.back')}
        </Link>
        <LanguageSwitcher />
      </div>

      {/* LEFT — Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E11] via-[#12161B] to-[#0B3A34]" />
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-primary-500/[0.08] blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-primary-700/[0.06] blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-12" />
          </Link>

          <div className="max-w-md">
            <h2 className="font-serif font-medium text-4xl leading-[1.1] tracking-[-0.03em] text-white xl:text-5xl">
              {t('auth.startBuilding')}
              <br />
              <span className="text-white/30">{t('auth.withYourTeam')}</span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/70">
              {t('auth.signupDescription')}
            </p>

            {/* What you get */}
            <div className="mt-8 space-y-3">
              {[
                t('auth.featureCalendar'),
                t('auth.featureLanguages'),
                t('auth.featureBudget'),
                t('auth.featureAI'),
                t('auth.featureFree'),
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                    <Check className="h-3 w-3 text-primary-400" />
                  </div>
                  <span className="text-[13px] text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 border-t border-white/[0.06] pt-6 xl:gap-10">
            {[
              { value: '500+', label: t('teams.title') },
              { value: '2 min', label: t('auth.setupTime') },
              { value: t('pricing.free'), label: t('auth.toStart') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-[12px] text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Sign up form */}
      <div className="flex w-full items-center justify-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-12" />
          </div>

          <div className="mb-8">
            <h3 className="font-serif font-medium text-2xl tracking-[-0.02em] text-white">{t('auth.createAccount')}</h3>
            <p className="mt-2 text-[14px] text-white/70">
              {t('auth.hasAccount')}{' '}
              <Link href="/auth/signin" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
                {t('common.signIn')}
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-[13px] text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-[13px] font-medium text-white/70">
                {t('auth.fullName')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={t('auth.yourFullName')}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-white/70">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-white/70">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-11 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder={t('auth.atLeast8Chars')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-white/20 hover:bg-transparent hover:text-white/60"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {passwordChecks.map((check) => (
                    <span key={check.label} className={`text-[11px] ${check.met ? 'text-emerald-400' : 'text-white/25'}`}>
                      {check.met ? '✓' : '○'} {check.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-medium text-white/70">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-11 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-white/20 hover:bg-transparent hover:text-white/60"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group w-full rounded-full bg-gradient-to-r from-primary-500 to-[#2BB5A2] py-3.5 text-[14px] font-medium shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.creatingAccount')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t('auth.createAccount')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
              <div>
                <p className="text-[13px] font-medium text-white/60">{t('auth.quickSetup')}</p>
                <p className="text-[12px] text-white/60">
                  {t('auth.afterSignup')}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-white/20">
            {t('auth.termsAgreement')}
          </p>
          <p className="mt-2 text-center text-[12px] text-white/20">
            &copy; 2026 Onekof &middot; {t('auth.builtForEthiopia')}
          </p>
        </div>
      </div>
    </div>
  );
}


export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0B0E11]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
