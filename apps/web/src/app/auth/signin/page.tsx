'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Calendar, Languages, Bot, Shield, CheckCircle2, Sparkles } from 'lucide-react';

interface OrganizationInfo {
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

// SignIn content component that uses useSearchParams
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

  // Detect organization from subdomain
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
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIDE - Dark Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#1B1F23] relative overflow-hidden">
        {/* Ethiopian flag accent */}
        <div className="absolute top-0 left-0 right-0 h-1 flex z-50">
          <div className="flex-1 bg-[#078930]" />
          <div className="flex-1 bg-[#FCDD09]" />
          <div className="flex-1 bg-[#DA121A]" />
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#1C8C7D]/20 to-emerald-600/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[#1C8C7D]/15 to-teal-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-emerald-600 shadow-lg">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Onekof</h1>
              <p className="text-sm text-slate-300">Enterprise Project Management</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-10">
            {/* Heading */}
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Built for<br /><span className="bg-gradient-to-r from-[#1C8C7D] to-emerald-400 bg-clip-text text-transparent">Ethiopian Excellence</span>
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                The complete project management platform with Ethiopian calendar, native languages, and smart AI automation.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-lg">
              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Calendar className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Ethiopian Calendar</div>
                  <div className="text-xs text-slate-400">የኢትዮጵያ ዘመን አቆጣጠር</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Languages className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">4 Languages</div>
                  <div className="text-xs text-slate-400">አማርኛ, ትግርኛ, Afaan Oromo</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Bot className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AI-Powered</div>
                  <div className="text-xs text-slate-400">Smart automation</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30">
                  <Shield className="h-5 w-5 text-[#1C8C7D]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Secure</div>
                  <div className="text-xs text-slate-400">Multi-tenant isolation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center gap-8 pt-8 border-t border-slate-700/50">
            <div>
              <div className="text-2xl font-bold text-white mb-1">500+</div>
              <div className="text-xs text-slate-400">Organizations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">10K+</div>
              <div className="text-xs text-slate-400">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-slate-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Clean White Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-emerald-600">
              <span className="text-lg font-bold text-white">O</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Onekof</h1>
              <p className="text-xs text-gray-600">Enterprise Project Management</p>
            </div>
          </div>

          {/* Form Header - Premium Spacing */}
          <div className="mb-12">
            <h3 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">Welcome back</h3>
            <p className="text-gray-700 font-light">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-[#1C8C7D] hover:text-[#15725f] transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 rounded-xl bg-red-50 border border-red-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Sign In Form - Premium Inputs */}
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10 font-light"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#1C8C7D] hover:text-[#15725f] transition-colors"
                >
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10 font-light"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication Input */}
            {requiresTwoFactor && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>Enter the 6-digit code from your authenticator app</span>
                </div>
                <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700">
                  Authentication Code
                </label>
                <input
                  id="totpCode"
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z-]/g, '').slice(0, 9))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-center text-lg font-mono tracking-widest text-gray-900 placeholder-gray-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                  placeholder="000000"
                  autoFocus
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-gray-500">
                  You can also use a backup code (format: XXXX-XXXX)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (requiresTwoFactor && totpCode.length < 6)}
              className="w-full rounded-xl bg-gradient-to-r from-[#1C8C7D] to-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1C8C7D]/25 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/40 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{requiresTwoFactor ? 'Verifying...' : 'Signing in...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{requiresTwoFactor ? 'Verify & Sign In' : 'Continue'}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* OAuth Buttons - Refined */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('azure-ad')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00A4EF">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          {/* Footer Tip - Minimal */}
          {isMainDomain && (
            <div className="mt-12 rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
              <p className="text-sm text-gray-700 font-light">
                <span className="font-medium text-gray-900">Direct access:</span> Use{' '}
                <code className="font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200 text-[#1C8C7D]">
                  your-org.onekof.com
                </code>
              </p>
            </div>
          )}

          {/* Footer */}
          <p className="mt-12 text-center text-xs text-gray-400 font-light">
            © 2026 Onekof · Built with ❤️ for Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
