'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const error = searchParams.get('error') || 'Default';

  const errorMessages: Record<string, string> = {
    Configuration: t('auth.configError'),
    AccessDenied: t('auth.accessDenied'),
    Verification: t('auth.verificationExpired'),
    Default: t('auth.genericAuthError'),
  };

  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E11] px-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="mb-2 font-serif font-medium text-xl text-white">
          {t('auth.authError')}
        </h1>
        <p className="mb-2 text-sm font-medium text-white/70">
          Error: {error}
        </p>
        <p className="mb-8 text-sm text-white/70">
          {message}
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.backToSignIn')}
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0E11]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
