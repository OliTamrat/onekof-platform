'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      setStatus('success');
      setMessage('Email verified successfully! Redirecting to dashboard...');

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin?verified=true');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. Please try again.');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
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
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white">
              {status === 'success' ? (
                <>
                  Welcome to Onekof!
                  <br />
                  Your Email is Verified
                </>
              ) : (
                <>
                  Verify Your Email
                  <br />
                  Almost There!
                </>
              )}
            </h1>
            <p className="text-lg text-white/90">
              {status === 'success'
                ? 'You can now access all features of Onekof.'
                : 'Just one more step to get started with Onekof.'}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white" />
            <div>
              <div className="font-semibold text-white">Check your inbox</div>
              <div className="text-sm text-white/70">
                We've sent you a verification link
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Verification status */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email verified!'}
              {status === 'error' && 'Verification failed'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {status === 'success' && 'Your account has been successfully verified.'}
              {status === 'error' && 'We couldn\'t verify your email address.'}
            </p>
          </div>

          {/* Status display */}
          <div className="space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#0EA5E9]" />
                <p className="text-sm text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-green-200 bg-green-50 p-8">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" />
                  <p className="text-center font-medium text-green-800">{message}</p>
                </div>
                <Link
                  href="/auth/signin"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0EA5E9] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2"
                >
                  Continue to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{message}</p>
                    <p className="mt-1 text-xs text-red-700">
                      The link may have expired or already been used.
                    </p>
                  </div>
                </div>

                {/* Resend verification form */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Request a new verification link
                  </h3>
                  <form onSubmit={handleResendVerification} className="space-y-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
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
                    <Button
                      type="submit"
                      disabled={isResending}
                      className="w-full rounded-lg py-2.5 text-sm font-semibold"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  </form>
                </div>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7]"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
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
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Verify Your Email
              <br />
              Almost There!
            </h1>
            <p className="text-lg text-white/90">
              Just one more step to get started with Onekof.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white" />
            <div>
              <div className="font-semibold text-white">Check your inbox</div>
              <div className="text-sm text-white/70">
                We've sent you a verification link
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Loading state */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#0EA5E9]" />
            <p className="text-sm text-gray-600">Verifying your email address...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
