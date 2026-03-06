'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, Lock, Building2, CheckCircle2, Calendar, Globe, Sparkles, Info, ArrowRight } from 'lucide-react';

interface OrganizationInfo {
  name: string;
  slug: string;
  plan: string;
}

// SignIn content component that uses useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  // Detect organization from subdomain
  useEffect(() => {
    const detectOrganization = async () => {
      const hostname = window.location.hostname;

      // Check if we're on a subdomain
      const isSubdomain = hostname.includes('.') &&
                         !hostname.startsWith('www.') &&
                         (hostname.endsWith('.onekof.com') || hostname.endsWith('.localhost'));

      if (isSubdomain) {
        setIsMainDomain(false);

        // Extract subdomain
        let subdomain = '';
        if (hostname.endsWith('.onekof.com')) {
          subdomain = hostname.replace('.onekof.com', '');
        } else if (hostname.endsWith('.localhost')) {
          subdomain = hostname.replace('.localhost', '');
        }

        // Fetch organization info
        try {
          const response = await fetch(`/api/organizations/${subdomain}`);
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
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(result.error);
        }
      } else {
        // Check if user has access to this organization
        if (!isMainDomain && organization) {
          router.push(callbackUrl);
        } else {
          // Redirect to organization selector
          router.push('/select-organization');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding & Promotion */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#0369A1] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">O</span>
            </div>
            <span className="text-2xl font-bold text-white">Onekof</span>
          </Link>
        </div>

        <div className="space-y-8">
          {/* Organization Badge (if on subdomain) */}
          {organization && (
            <div className="rounded-2xl border-2 border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/80">Signing in to</div>
                  <div className="mt-1 text-xl font-bold text-white">{organization.name}</div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                    {organization.plan} Plan
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Features */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white">
              {organization ? `Welcome to ${organization.name}` : 'Built for Ethiopian Teams. Loved Worldwide.'}
            </h1>
            <p className="text-lg text-white/90">
              The only project management platform with Ethiopian calendar, 4 native languages, and AI-powered workflows.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Ethiopian Calendar</div>
                <div className="text-sm text-white/70">የካቲት, መጋቢት, ሚያዚያ...</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">4 Native Languages</div>
                <div className="text-sm text-white/70">አማርኛ • Afaan Oromo • ትግርኛ • English</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">AI-Powered</div>
                <div className="text-sm text-white/70">Smart automation included</div>
              </div>
            </div>
          </div>

          {/* Multi-tenant Info */}
          {!organization && (
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-white/80 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/90">
                  <strong>Multi-Organization Support:</strong> If you belong to multiple organizations,
                  you'll be able to choose which one to access after signing in.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          {/* Organization badge (mobile) */}
          {organization && (
            <div className="mb-6 rounded-xl border-2 border-blue-100 bg-blue-50 p-4 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-blue-600">Signing in to</div>
                  <div className="font-semibold text-gray-900">{organization.name}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {organization ? 'Welcome back' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-[#0EA5E9] hover:text-[#0284C7]">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Sign in form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#0EA5E9] focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/10"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-[#0EA5E9] focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0EA5E9] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0284C7] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>

            <button
              onClick={() => signIn('azure-ad', { callbackUrl })}
              disabled={isLoading}
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-[#0EA5E9]/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00A4EF"/>
              </svg>
              Microsoft
            </button>
          </div>

          {/* Info message for multi-tenant */}
          {!organization && (
            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-blue-800">
                  <strong className="font-semibold">Tip:</strong> You can access your organization directly at{' '}
                  <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded">your-org.onekof.com</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">Loading sign in page...</p>
        <p className="mt-1 text-xs text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
