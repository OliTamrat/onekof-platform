'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader2, Mail, Lock, User, CheckCircle2, Calendar, Globe, Sparkles, Smartphone, ArrowRight, Building2, Info } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  // Detect organization from subdomain
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

    // Validation
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

      // Show email verification message instead of auto sign-in
      setVerificationSent(true);
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: string) => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Promotional Content */}
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
          {/* Organization Badge - shown on subdomain */}
          {!isMainDomain && organization && (
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-white/70">Joining</div>
                <div className="text-sm font-semibold text-white">{organization.name}</div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white">
              {!isMainDomain && organization ? (
                <>
                  Join {organization.memberCount}+ Team Members
                  <br />
                  at {organization.name}
                </>
              ) : (
                <>
                  Join 500+ Teams
                  <br />
                  Building Better
                </>
              )}
            </h1>
            <p className="text-lg text-white/90">
              {!isMainDomain && organization ? (
                <>Create your account to collaborate with {organization.name}'s team on Onekof.</>
              ) : (
                <>Start shipping faster with the project management platform built for Ethiopian teams.</>
              )}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Free forever for 10 users</div>
                <div className="text-sm text-white/70">No credit card required to start</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Setup in 2 minutes</div>
                <div className="text-sm text-white/70">Get started immediately, no learning curve</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Ethiopian calendar & 4 languages</div>
                <div className="text-sm text-white/70">Work your way, in your language</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">AI-powered workflows included</div>
                <div className="text-sm text-white/70">Smart automation, no extra cost</div>
              </div>
            </div>
          </div>

          {/* App Download */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Download Our Mobile App</h3>
              <p className="mt-1 text-sm text-white/80">
                Get instant access to your projects on the go
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-black px-5 py-3 transition-opacity hover:opacity-90"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] leading-none text-white/80">Download on the</span>
                  <span className="text-lg font-semibold leading-tight text-white">App Store</span>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-black px-5 py-3 transition-opacity hover:opacity-90"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                </svg>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] leading-none text-white/80">GET IT ON</span>
                  <span className="text-lg font-semibold leading-tight text-white">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          {/* Organization badge on mobile */}
          {!isMainDomain && organization && (
            <div className="mb-6 lg:hidden inline-flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 border border-blue-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-blue-600">Joining</div>
                <div className="text-sm font-semibold text-gray-900">{organization.name}</div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {!isMainDomain && organization ? 'Join the team' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold text-[#0EA5E9] hover:text-[#0284C7]">
                Sign in
              </Link>
            </p>
          </div>

          {/* Multi-tenant info box */}
          {!isMainDomain && organization && (
            <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-900 mb-1">
                    Organization Signup
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    You're signing up for <span className="font-semibold text-gray-900">{organization.name}</span>'s workspace.
                    After verification, you'll be able to collaborate with their team on projects and goals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal - Email verification sent */}
          {verificationSent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md animate-in fade-in zoom-in duration-200 rounded-2xl bg-white shadow-2xl">
                {/* Success Icon */}
                <div className="flex flex-col items-center border-b border-gray-100 px-6 pt-8 pb-6">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome to Onekof!</h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    Your account has been created successfully
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="mb-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Check your email</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          We've sent a verification link to:
                        </p>
                        <p className="mt-1 text-sm font-semibold text-blue-900">{email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">Next steps:</h4>
                    <ol className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-semibold text-white">1</span>
                        <span>Open your email inbox</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-semibold text-white">2</span>
                        <span>Click the verification link</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-xs font-semibold text-white">3</span>
                        <span>Start managing your projects!</span>
                      </li>
                    </ol>
                  </div>

                  {/* Dev Mode Quick Access - Only in development */}
                  {verificationUrl && process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 rounded-lg border-2 border-dashed border-orange-200 bg-orange-50 p-3">
                      <p className="mb-2 text-xs font-semibold text-orange-800">⚡ Quick Access (Dev Mode)</p>
                      <a
                        href={verificationUrl}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Verify Email Now
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 px-6 py-4">
                  <Link
                    href="/auth/signin"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0EA5E9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0284C7]"
                  >
                    Go to Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    Didn't receive the email? Check your spam folder
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Sign up form */}
          {!verificationSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-[#0EA5E9] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#0EA5E9] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
          )}

          {!verificationSent && (
          <>
          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthSignUp('google')}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:opacity-50"
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
              <span className="hidden sm:inline">Google</span>
            </button>

            <button
              onClick={() => handleOAuthSignUp('azure-ad')}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" fill="#00A4EF"/>
              </svg>
              <span className="hidden sm:inline">Microsoft</span>
            </button>

            <button
              onClick={() => handleOAuthSignUp('github')}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </button>

            <button
              onClick={() => handleOAuthSignUp('apple')}
              disabled={isLoading}
              className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>
          </>
          )}

          {/* Multi-tenant benefits - only show on main domain */}
          {!verificationSent && isMainDomain && (
            <div className="mt-8 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-5 border border-gray-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Your Own Dedicated Workspace
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Each organization gets its own subdomain (like <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">yourteam.onekof.com</span>)
                      with completely isolated data and customized settings.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>Private workspace</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>Custom domain</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>Isolated data</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span>Team collaboration</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
