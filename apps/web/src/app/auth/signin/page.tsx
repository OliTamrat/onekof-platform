'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle, Loader2, ArrowRight, Eye, EyeOff, Shield,
  Calendar, Languages, Wallet, Brain, Kanban, BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrganizationInfo {
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const isSubdomain = hostname.includes('.') &&
                         !hostname.startsWith('www.') &&
                         (hostname.endsWith('.onekof.com') || hostname.endsWith('.localhost'));

      if (isSubdomain) {
        setIsMainDomain(false);
        let subdomain = '';
        if (hostname.endsWith('.onekof.com')) {
          subdomain = hostname.replace('.onekof.com', '');
        } else if (hostname.endsWith('.localhost')) {
          subdomain = hostname.replace('.localhost', '');
        }

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
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
      } else {
        router.push('/select-organization');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex min-h-screen bg-[#1B1F23]">
      {/* LEFT — Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#0B3A34]" />
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-primary-500/[0.08] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-primary-700/[0.06] blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[16px] font-semibold text-white">Onekof</span>
          </Link>

          {/* Main content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-white xl:text-5xl">
              Welcome back
              <br />
              <span className="text-white/30">to your workspace</span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/30">
              Projects, budgets, documents, and dashboards — all with native
              Ethiopian calendar and language support.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { icon: Calendar, label: 'Ethiopian Calendar' },
                { icon: Languages, label: '4 Languages' },
                { icon: Wallet, label: 'ETB Budgets' },
                { icon: Brain, label: 'AI Documents' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                  <f.icon className="h-3.5 w-3.5 text-primary-400" />
                  <span className="text-[12px] text-white/40">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 border-t border-white/[0.06] pt-6 xl:gap-10">
            {[
              { value: '500+', label: 'Teams' },
              { value: '10K+', label: 'Projects' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-[12px] text-white/20">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Sign in form */}
      <div className="flex w-full items-center justify-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold text-white">Onekof</span>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">Sign in</h3>
            <p className="mt-2 text-[14px] text-white/30">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
                Sign up
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
              <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-white/50">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-[13px] font-medium text-white/50">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-[12px] text-primary-400 transition-colors hover:text-primary-300">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-11 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-white/20 hover:bg-transparent hover:text-white/40"
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
                  <span className="text-[12px] text-primary-300">Enter the 6-digit code from your authenticator</span>
                </div>
                <input
                  id="totpCode"
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 9))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-center font-mono text-lg tracking-[0.3em] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="000000"
                  autoFocus
                  autoComplete="one-time-code"
                />
                <p className="text-[11px] text-white/20">You can also use a backup code (format: XXXX-XXXX)</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || (requiresTwoFactor && totpCode.length < 6)}
              className="group w-full rounded-xl py-3.5 text-[14px] font-medium shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {requiresTwoFactor ? 'Verifying...' : 'Signing in...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {requiresTwoFactor ? 'Verify & Sign In' : 'Continue'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/15">Or</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 rounded-xl border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/50 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/70"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignIn('azure-ad')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 rounded-xl border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] font-medium text-white/50 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/70"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#00A4EF">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              Microsoft
            </Button>
          </div>

          {isMainDomain && (
            <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[13px] text-white/30">
                <span className="font-medium text-white/50">Direct access:</span>{' '}
                <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-primary-400">
                  your-org.onekof.com
                </code>
              </p>
            </div>
          )}

          <p className="mt-10 text-center text-[12px] text-white/15">
            &copy; 2026 Onekof &middot; Built for Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#1B1F23]">
        <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
