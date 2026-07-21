'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, Shield,
  Calendar, Languages, Wallet, Brain, Kanban, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import { findSubdomainBase, getTenantSlugFromHostname } from '@/lib/routing/subdomain';

interface OrganizationInfo {
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  useEffect(() => {
    const detectOrganization = async () => {
      const hostname = window.location.hostname;
      // Treat .localhost as a subdomain routing host for dev convenience,
      // in addition to any bases configured via NEXT_PUBLIC_SUBDOMAIN_DOMAINS.
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
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totpCode: totpCode || undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('TWO_FACTOR_REQUIRED')) {
          setRequiresTwoFactor(true);
          setError('');
        } else if (result.error === 'CredentialsSignin') {
          setError(t('auth.invalidCredentials'));
        } else {
          setError(result.error);
        }
      } else {
        router.push('/select-organization');
      }
    } catch (err) {
      setError(t('errors.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: '/select-organization' });
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* LEFT — Brand panel (desktop only) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E11] via-[#12161B] to-[#0B3A34]" />
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-primary-500/[0.08] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-primary-700/[0.06] blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-16" />
          </Link>

          <div className="max-w-md">
            <h2 className="font-serif font-medium text-4xl leading-[1.1] tracking-[-0.03em] text-white xl:text-5xl">
              {t('auth.welcomeBack')}
              <br />
              <span className="text-white/60">{t('auth.toYourWorkspace')}</span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/70">
              {t('auth.projectsDescription')}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { icon: Calendar, label: t('auth.ethiopianCalendar') },
                { icon: Languages, label: t('auth.languages') },
                { icon: Wallet, label: t('auth.etbBudgets') },
                { icon: Brain, label: t('auth.aiDocuments') },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                  <f.icon className="h-3.5 w-3.5 text-primary-400" />
                  <span className="text-[12px] text-white/70">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 border-t border-white/[0.06] pt-6 xl:gap-10">
            {[
              { value: '500+', label: t('teams.title') },
              { value: '10K+', label: t('projects.title') },
              { value: '99.9%', label: t('auth.uptime') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-[12px] text-white/30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Sign in form */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Mobile ambient glow */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute -right-[20%] -top-[10%] h-[400px] w-[400px] rounded-full bg-primary-500/[0.06] blur-[120px]" />
          <div className="absolute -left-[15%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-primary-700/[0.04] blur-[100px]" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            {t('common.back')}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-6 sm:px-8 sm:py-10">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="mb-10 lg:hidden">
              <Link href="/">
                <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-12" />
              </Link>
            </div>

            <div className="mb-8">
              <h3 className="font-serif font-medium text-[28px] tracking-[-0.02em] text-white sm:text-3xl">{t('auth.signInTitle')}</h3>
              <p className="mt-3 text-[15px] text-white/60">
                {t('auth.noAccount')}{' '}
                <Link href="/auth/signup" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
                  {t('common.signUp')}
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <p className="text-[13px] text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-white/70">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder-white/25 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-medium text-white/70">
                    {t('auth.password')}
                  </label>
                  <Link href="/auth/forgot-password" className="text-[12px] text-primary-400 transition-colors hover:text-primary-300">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-11 text-[15px] text-white placeholder-white/25 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('auth.enterPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-white/30 hover:bg-transparent hover:text-white/60"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {requiresTwoFactor && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-primary-500/20 bg-primary-500/[0.06] p-3">
                    <Shield className="h-4 w-4 text-primary-400" />
                    <span className="text-[12px] text-primary-300">{t('auth.twoFactorCode')}</span>
                  </div>
                  <input
                    id="totpCode"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 9))}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-center font-mono text-lg tracking-[0.3em] text-white placeholder-white/25 transition-all focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="000000"
                    autoFocus
                    autoComplete="one-time-code"
                  />
                  <p className="text-[11px] text-white/30">{t('auth.backupCode')}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (requiresTwoFactor && totpCode.length < 6)}
                className="group w-full rounded-full bg-gradient-to-r from-primary-500 to-[#2BB5A2] py-4 text-[15px] font-semibold shadow-lg shadow-primary-500/20 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {requiresTwoFactor ? t('auth.verifying') : t('auth.signingIn')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {requiresTwoFactor ? t('auth.verifyAndSignIn') : t('common.continueBtn')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/25">{t('common.or')}</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {/* OAuth providers */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                onClick={() => handleOAuthSignIn('azure-ad')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#00A4EF">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                Microsoft
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
              <button
                onClick={() => handleOAuthSignIn('linkedin')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
            </div>

            {/* Mobile app promotion */}
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#2BB5A2] shadow-lg shadow-[#1C8C7D]/20">
                  <Kanban className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-white">Onekof Mobile App</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                    Manage projects on the go with native Ethiopian calendar, offline access, and push notifications.
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-primary-400">Coming soon to App Store & Google Play</p>
                </div>
              </div>
            </div>

            {isMainDomain && (
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[13px] text-white/50">
                  <span className="font-medium text-white/60">{t('auth.directAccess')}</span>{' '}
                  <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-primary-400">
                    your-org.onekof.com
                  </code>
                </p>
              </div>
            )}

            <p className="mt-6 text-center text-[12px] text-white/25">
              &copy; 2026 Onekof &middot; {t('auth.builtForEthiopia')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E11]">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
