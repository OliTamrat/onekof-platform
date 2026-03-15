'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'default' | 'dark';
}

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: Locale) {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;samesite=lax`;
      window.location.reload();
    });
  }

  const selectClass = variant === 'dark'
    ? 'appearance-none rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 pr-8 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50'
    : 'appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700';

  const chevronClass = variant === 'dark'
    ? 'h-4 w-4 text-white/40'
    : 'h-4 w-4 text-gray-400';

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isPending}
        className={selectClass}
        aria-label="Select language"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className={chevronClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
