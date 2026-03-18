'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  AlertCircle, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2,
  Calendar, Languages, Wallet, Brain, Kanban, Shield, Check,
} from 'lucide-react';

interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

export default function SignUpPage() {
  const router = useRouter();

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
      const isSubdomain =
        hostname.includes('.') &&
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
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

      if (data.hasPendingInvitations) {
        // Invited user — skip onboarding, go to select-organization to see/accept invitations
        router.push('/select-organization');
      } else {
        // New user — proceed to onboarding to set up workspace
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
  ];

  return (
    <div className="flex min-h-screen bg-[#1B1F23]">
      {/* LEFT — Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#0B3A34]" />
        <div className="absolute left-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-primary-500/[0.08] blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-primary-700/[0.06] blur-[120px]" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[16px] font-semibold text-white">Onekof</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-white xl:text-5xl">
              Start building
              <br />
              <span className="text-white/30">with your team</span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-white/30">
              Join hundreds of Ethiopian organizations using Onekof to
              manage projects, track budgets in ETB, and collaborate in
              their preferred language.
            </p>

            {/* What you get */}
            <div className="mt-8 space-y-3">
              {[
                'Ethiopian calendar & Gregorian toggle',
                'Amharic, Oromoo, Tigrinya, English UI',
                'Budget tracking in Ethiopian Birr',
                'AI-powered document processing',
                'Free forever for teams up to 10',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                    <Check className="h-3 w-3 text-primary-400" />
                  </div>
                  <span className="text-[13px] text-white/35">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 border-t border-white/[0.06] pt-6 xl:gap-10">
            {[
              { value: '500+', label: 'Teams' },
              { value: '2 min', label: 'Setup time' },
              { value: 'Free', label: 'To start' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="text-[12px] text-white/20">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Sign up form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold text-white">Onekof</span>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">Create your account</h3>
            <p className="mt-2 text-[14px] text-white/30">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
                Sign in
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
              <label htmlFor="name" className="mb-2 block text-[13px] font-medium text-white/50">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-white/50">
                Email address
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
              <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-white/50">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-11 text-[14px] text-white placeholder-white/20 transition-all focus:border-primary-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white/40"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {passwordChecks.map((check) => (
                    <span key={check.label} className={`text-[11px] ${check.met ? 'text-emerald-400' : 'text-white/15'}`}>
                      {check.met ? '✓' : '○'} {check.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-medium text-white/50">
                Confirm password
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white/40"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full rounded-xl bg-primary-500 py-3.5 text-[14px] font-medium text-white shadow-lg transition-all hover:bg-primary-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
              <div>
                <p className="text-[13px] font-medium text-white/50">Quick 2-minute setup</p>
                <p className="text-[12px] text-white/25">
                  After signup, we&apos;ll help you create your workspace and invite your team
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-white/15">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="mt-2 text-center text-[12px] text-white/15">
            &copy; 2026 Onekof &middot; Built for Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
}
