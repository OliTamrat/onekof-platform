'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, Lock, Building2, ArrowRight, Sparkles, Shield, Zap, Users } from 'lucide-react';

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
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
      } else {
        if (!isMainDomain && organization) {
          router.push(callbackUrl);
        } else {
          router.push('/select-organization');
        }
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

            {/* Left Section - Branding & Features */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50">
                  <span className="text-2xl font-bold text-white">O</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Onekof</h1>
                  <p className="text-sm text-gray-600">Project Management Platform</p>
                </div>
              </div>

              {/* Organization Badge - if on subdomain */}
              {!isMainDomain && organization && (
                <div className="inline-flex items-center gap-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl px-6 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Signing in to</div>
                    <div className="text-lg font-bold text-gray-900">{organization.name}</div>
                    <div className="text-xs text-gray-500">{organization.memberCount} team members</div>
                  </div>
                </div>
              )}

              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                  {!isMainDomain && organization ? (
                    <>Welcome back to <br /><span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{organization.name}</span></>
                  ) : (
                    <>Manage Projects <br />the <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ethiopian Way</span></>
                  )}
                </h2>
                <p className="text-lg text-gray-600">
                  Built for Ethiopian teams. Loved worldwide. Experience project management with Ethiopian calendar, 4 native languages, and AI-powered workflows.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/20 px-4 py-2 shadow-lg">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Secure & Isolated</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/20 px-4 py-2 shadow-lg">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">AI-Powered</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/20 px-4 py-2 shadow-lg">
                  <Users className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-gray-700">Multi-Tenant</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Teams</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Section - Sign In Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">Sign in</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign up for free
                      </Link>
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Sign In Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                          Password
                        </label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Sign in</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Or continue with</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  </div>

                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOAuthSignIn('google')}
                      disabled={isLoading}
                      className="group flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-white hover:border-gray-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="hidden sm:inline">Google</span>
                    </button>

                    <button
                      onClick={() => handleOAuthSignIn('azure-ad')}
                      disabled={isLoading}
                      className="group flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-white hover:border-gray-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00A4EF">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                      </svg>
                      <span className="hidden sm:inline">Microsoft</span>
                    </button>
                  </div>

                  {/* Bottom Tip */}
                  {isMainDomain && (
                    <div className="mt-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-indigo-900 mb-1">Access your organization directly</p>
                          <p className="text-indigo-700">
                            Use <span className="font-mono text-xs bg-indigo-100 px-1.5 py-0.5 rounded">your-org.onekof.com</span> for faster access
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                  © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
