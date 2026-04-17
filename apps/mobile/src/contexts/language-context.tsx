import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';

export type Locale = 'en' | 'am' | 'om' | 'ti' | 'so';

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  ti: 'ትግርኛ',
  so: 'Soomaali',
};

const STORAGE_KEY = 'onekof_locale';

// Lazy-load non-EN locales to keep bundle size small
async function loadLocale(locale: Locale): Promise<typeof en> {
  switch (locale) {
    case 'am': return require('../locales/am.json');
    case 'om': return require('../locales/om.json');
    case 'ti': return require('../locales/ti.json');
    case 'so': return require('../locales/so.json');
    default: return en;
  }
}

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

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isGeezScript: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<typeof en>(en);

  // Load saved locale on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && ['en', 'am', 'om', 'ti', 'so'].includes(saved)) {
        const loc = saved as Locale;
        setLocaleState(loc);
        loadLocale(loc).then(setTranslations);
      }
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEY, newLocale);
    loadLocale(newLocale).then(setTranslations);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations, key);
    if (value === key) {
      // Fallback to English
      const fallback = getNestedValue(en, key);
      return interpolate(fallback === key ? key : fallback, params);
    }
    return interpolate(value, params);
  }, [translations]);

  const isGeezScript = locale === 'am' || locale === 'ti';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isGeezScript }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: 'en' as Locale,
      setLocale: (_: Locale) => {},
      t: (key: string) => getNestedValue(en, key),
      isGeezScript: false,
    };
  }
  return context;
}
