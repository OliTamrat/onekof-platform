'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';
import ti from '@/locales/ti.json';
import so from '@/locales/so.json';

export type Locale = 'en' | 'am' | 'om' | 'ti' | 'so';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  ti: 'ትግርኛ',
  so: 'Af Soomaali',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: 'EN',
  am: 'አማ',
  om: 'OM',
  ti: 'ትግ',
  so: 'SO',
};

const translations: Record<Locale, typeof en> = { en, am, om, ti: ti as typeof en, so: so as typeof en };

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<typeof en>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isAmharic: boolean;
  isOromo: boolean;
  isTigrinya: boolean;
  isSomali: boolean;
  fontClass: string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('onekof-locale') as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('onekof-locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[locale], key);
    if (value === key) {
      const fallback = getNestedValue(translations.en, key);
      return interpolate(fallback === key ? key : fallback, params);
    }
    return interpolate(value, params);
  }, [locale]);

  const isAmharic = locale === 'am';
  const isOromo = locale === 'om';
  const isTigrinya = locale === 'ti';
  const isSomali = locale === 'so';
  const fontClass = (isAmharic || isTigrinya) ? 'font-ethiopic' : '';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isAmharic, isOromo, isTigrinya, isSomali, fontClass }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      isAmharic: false,
      isOromo: false,
      isTigrinya: false,
      isSomali: false,
      fontClass: '',
    };
  }
  return context;
}
