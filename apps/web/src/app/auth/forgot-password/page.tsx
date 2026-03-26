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
      setMessage('Password reset instructions have been sent to your email');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

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
              {t('auth.forgotPasswordTitle')}
              <br />

            </h1>
            <p className="text-lg text-white/90">
              We'll send you instructions to reset your password and get you back on track.
            </p>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          {/* Back to signin link */}
          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignIn')}
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('auth.resetPasswordTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">{message}</p>
                <p className="mt-1 text-xs text-green-700">
                  If you don't see it, check your spam folder.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.emailAddress')}
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
              disabled={isLoading || status === 'success'}
              className="w-full rounded-lg py-2.5 text-sm font-semibold"
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
            <p className="text-sm text-gray-600">
              {t('auth.rememberPassword')}{' '}
              <Link href="/auth/signin" className="font-semibold text-[#0EA5E9] hover:text-[#0284C7]">
                {t('common.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
