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

  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#1B1F23] px-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
          {t('auth.authError')}
        </h1>
        <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Error: {error}
        </p>
        <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-md bg-[#1C8C7D] px-4 py-2 text-sm font-medium text-white hover:bg-[#156B60] transition-colors"
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
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
