'use client';

import { useLanguage, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/contexts/language-context';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locales: Locale[] = ['en', 'am', 'om', 'ti', 'so'];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={t('common.changeLanguage')}
      >
        <Globe className="h-4 w-4" />
        {!compact && (
          <span className="text-xs font-medium">{LOCALE_FLAGS[locale]}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] shadow-lg z-50 py-1">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                locale === l
                  ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-7 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {LOCALE_FLAGS[l]}
              </span>
              <span className={(l === 'am' || l === 'ti') ? 'font-ethiopic' : ''}>
                {LOCALE_NAMES[l]}
              </span>
              {locale === l && (
                <span className="ml-auto text-[#1C8C7D]">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
