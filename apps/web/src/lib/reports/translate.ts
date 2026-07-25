/**
 * Server-side translator for generated documents (PDF reports).
 * Same locale JSONs and {param} interpolation semantics as the client
 * LanguageContext, usable in API routes where React context doesn't exist.
 */

import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';
import ti from '@/locales/ti.json';
import so from '@/locales/so.json';

const LOCALES: Record<string, any> = { en, am, om, ti, so };

function lookup(data: any, key: string): string | undefined {
  let value = data;
  for (const part of key.split('.')) {
    if (value == null) return undefined;
    value = value[part];
  }
  return typeof value === 'string' ? value : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`
  );
}

export function makeTranslator(language: string) {
  const locale = LOCALES[language?.toLowerCase()] ?? en;
  return (key: string, params?: Record<string, string | number>): string => {
    const value = lookup(locale, key) ?? lookup(en, key) ?? key;
    return interpolate(value, params);
  };
}
