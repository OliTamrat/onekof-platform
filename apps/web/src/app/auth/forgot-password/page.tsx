'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setStatus('success');
      setMessage(t('auth.resetInstructionsSent'));
    } catch (error: unknown) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : t('auth.somethingWentWrongTryAgain')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0B3A34] via-[#0B4A3F] to-[#0B0E11] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="Onekof" className="h-12 w-12 rounded-xl" />
            <span className="text-2xl font-bold text-white">Onekof</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif font-medium text-4xl leading-tight text-white">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-lg text-white/70">
              {t('auth.resetInstructions')}
            </p>
          </div>
        </div>

        <div className="text-sm text-white/30">
          © 2026 Onekof. {t('auth.builtForEthiopia')}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center bg-[#0B0E11] px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo-icon.png" alt="Onekof" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold text-white">Onekof</span>
          </Link>

          {/* Back to signin link */}
          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignIn')}
          </Link>

          <div className="mb-8">
            <h2 className="font-serif font-medium text-3xl text-white">
              {t('auth.resetPasswordTitle')}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {t('resetPage.enterEmailInstructions')}
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#12161B] p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">{message}</p>
                <p className="mt-1 text-xs text-white/70">
                  {t('resetPage.checkSpamFolder')}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#12161B] p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                {t('auth.emailAddress')}
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/[0.08] bg-[#12161B] py-2.5 pl-10 pr-4 text-white placeholder-white/30 focus:border-[#1C8C7D] focus:outline-none focus:ring-2 focus:ring-[#1C8C7D]/20"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || status === 'success'}
              className="w-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('auth.sending')}
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('auth.emailSent')}
                </>
              ) : (
                t('auth.sendResetInstructions')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              {t('auth.rememberPassword')}{' '}
              <Link href="/auth/signin" className="font-semibold text-[#2BB5A2] hover:text-[#1C8C7D] transition-colors">
                {t('common.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
