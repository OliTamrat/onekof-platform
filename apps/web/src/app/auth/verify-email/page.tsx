'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
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
      setMessage(t('auth.invalidVerificationLink'));
    }
  }, [token, t]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('auth.failedToVerifyEmail'));
      }

      setStatus('success');
      setMessage(t('auth.emailVerifiedRedirecting'));

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin?verified=true');
      }, 3000);
    } catch (error: unknown) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : t('auth.failedToVerifyEmailRetry')
      );
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
        throw new Error(data.error || t('auth.failedToSendVerification'));
      }

      setMessage(t('auth.verificationEmailSent'));
    } catch (error: unknown) {
      setMessage(
        error instanceof Error
          ? error.message
          : t('auth.failedToSendVerification')
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0B3A34] via-[#0B4A3F] to-[#0B0E11] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-full.png" alt="Onekof" className="h-10" />
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif font-medium text-4xl leading-tight text-white">
              {status === 'success' ? (
                <>
                  {t('auth.welcomeToOnekof')}
                  <br />
                  {t('auth.yourEmailVerified')}
                </>
              ) : (
                <>
                  {t('auth.verifyYourEmail')}
                  <br />
                  {t('verifyEmail.almostThere')}
                </>
              )}
            </h1>
            <p className="text-lg text-white/70">
              {status === 'success'
                ? t('verifyEmail.canAccessAllFeatures')
                : t('verifyEmail.oneMoreStep')}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.06] p-4 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white/70" />
            <div>
              <div className="font-semibold text-white">{t('verifyEmail.checkYourInbox')}</div>
              <div className="text-sm text-white/30">
                {t('verifyEmail.sentVerificationLink')}
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/30">
          &copy; {t('auth.copyright')}
        </div>
      </div>

      {/* Right side - Verification status */}
      <div className="flex w-full flex-col justify-center bg-[#0B0E11] px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo-full.png" alt="Onekof" className="h-8" />
          </Link>

          <div className="mb-8">
            <h2 className="font-serif font-medium text-3xl text-white">
              {status === 'loading' && t('verifyEmail.verifyingYourEmail')}
              {status === 'success' && t('verifyEmail.emailVerified')}
              {status === 'error' && t('verifyEmail.verificationFailed')}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {status === 'loading' && t('verifyEmail.pleaseWaitVerifying')}
              {status === 'success' && t('verifyEmail.accountVerified')}
              {status === 'error' && t('verifyEmail.couldNotVerify')}
            </p>
          </div>

          {/* Status display */}
          <div className="space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#12161B] p-8">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#2BB5A2]" />
                <p className="text-sm text-white/70">{t('verifyEmail.verifyingEmailAddress')}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#12161B] p-8">
                  <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-400" />
                  <p className="text-center font-medium text-white">{message}</p>
                </div>
                <Link
                  href="/auth/signin"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] focus:ring-offset-2 focus:ring-offset-[#0B0E11]"
                >
                  {t('auth.continueToSignIn')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#12161B] p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{message}</p>
                    <p className="mt-1 text-xs text-white/70">
                      {t('verifyEmail.linkExpiredOrUsed')}
                    </p>
                  </div>
                </div>

                {/* Resend verification form */}
                <div className="rounded-xl border border-white/[0.08] bg-[#12161B] p-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">
                    {t('verifyEmail.requestNewLink')}
                  </h3>
                  <form onSubmit={handleResendVerification} className="space-y-3">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70">
                        {t('verifyEmail.emailAddress')}
                      </label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full rounded-lg border border-white/[0.08] bg-[#181D23] py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-[#1C8C7D] focus:outline-none focus:ring-2 focus:ring-[#1C8C7D]/20"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isResending}
                      className="w-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('verifyEmail.sending')}
                        </>
                      ) : (
                        t('verifyEmail.resendVerificationEmail')
                      )}
                    </Button>
                  </form>
                </div>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-[#2BB5A2] hover:text-[#1C8C7D] transition-colors"
                  >
                    {t('auth.backToSignIn')}
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
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0B3A34] via-[#0B4A3F] to-[#0B0E11] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-full.png" alt="Onekof" className="h-10" />
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif font-medium text-4xl leading-tight text-white">
              Verify Your Email
              <br />
              Almost There.
            </h1>
            <p className="text-lg text-white/70">
              Just one more step to get started with Onekof.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.06] p-4 backdrop-blur-sm">
            <Mail className="h-8 w-8 text-white/70" />
            <div>
              <div className="font-semibold text-white">Check your inbox</div>
              <div className="text-sm text-white/30">
                We&apos;ve sent you a verification link
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/30">
          &copy; 2026 Onekof. Built with love in Ethiopia
        </div>
      </div>

      {/* Right side - Loading state */}
      <div className="flex w-full flex-col justify-center bg-[#0B0E11] px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo-full.png" alt="Onekof" className="h-8" />
          </Link>

          <div className="mb-8">
            <h2 className="font-serif font-medium text-3xl text-white">Verifying your email...</h2>
            <p className="mt-2 text-sm text-white/70">
              Please wait while we verify your email address.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#12161B] p-8">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#2BB5A2]" />
            <p className="text-sm text-white/70">Verifying your email address...</p>
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
