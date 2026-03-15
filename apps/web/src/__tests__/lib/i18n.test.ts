import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, localeNames, isGeezScript, localeDirection } from '@/i18n/config';
import enMessages from '@/messages/en.json';
import amMessages from '@/messages/am.json';
import omMessages from '@/messages/om.json';
import tiMessages from '@/messages/ti.json';

describe('i18n Configuration', () => {
  it('has 4 supported locales', () => {
    expect(locales).toHaveLength(4);
    expect(locales).toContain('en');
    expect(locales).toContain('am');
    expect(locales).toContain('om');
    expect(locales).toContain('ti');
  });

  it('defaults to English', () => {
    expect(defaultLocale).toBe('en');
  });

  it('has display names for all locales', () => {
    locales.forEach((locale) => {
      expect(localeNames[locale]).toBeDefined();
      expect(localeNames[locale].length).toBeGreaterThan(0);
    });
  });

  it('identifies Geez script locales correctly', () => {
    expect(isGeezScript('am')).toBe(true);
    expect(isGeezScript('ti')).toBe(true);
    expect(isGeezScript('en')).toBe(false);
    expect(isGeezScript('om')).toBe(false);
  });

  it('all locales are LTR', () => {
    locales.forEach((locale) => {
      expect(localeDirection[locale]).toBe('ltr');
    });
  });
});

describe('Translation completeness', () => {
  const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] => {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getKeys(value as Record<string, unknown>, fullKey);
      }
      return [fullKey];
    });
  };

  const enKeys = getKeys(enMessages);

  it('English has all expected top-level sections', () => {
    expect(Object.keys(enMessages)).toContain('common');
    expect(Object.keys(enMessages)).toContain('auth');
    expect(Object.keys(enMessages)).toContain('nav');
    expect(Object.keys(enMessages)).toContain('dashboard');
    expect(Object.keys(enMessages)).toContain('projects');
    expect(Object.keys(enMessages)).toContain('issues');
    expect(Object.keys(enMessages)).toContain('budgets');
    expect(Object.keys(enMessages)).toContain('settings');
    expect(Object.keys(enMessages)).toContain('errors');
  });

  it('Amharic has all keys that English has', () => {
    const amKeys = getKeys(amMessages);
    enKeys.forEach((key) => {
      expect(amKeys).toContain(key);
    });
  });

  it('Oromo has all keys that English has', () => {
    const omKeys = getKeys(omMessages);
    enKeys.forEach((key) => {
      expect(omKeys).toContain(key);
    });
  });

  it('Tigrinya has all keys that English has', () => {
    const tiKeys = getKeys(tiMessages);
    enKeys.forEach((key) => {
      expect(tiKeys).toContain(key);
    });
  });

  it('Amharic translations contain Ge\'ez characters', () => {
    expect(amMessages.common.save).toMatch(/[\u1200-\u137F]/);
    expect(amMessages.nav.dashboard).toMatch(/[\u1200-\u137F]/);
  });

  it('Tigrinya translations contain Ge\'ez characters', () => {
    expect(tiMessages.common.save).toMatch(/[\u1200-\u137F]/);
    expect(tiMessages.nav.dashboard).toMatch(/[\u1200-\u137F]/);
  });

  it('Oromo translations use Latin script', () => {
    expect(omMessages.common.save).toMatch(/^[A-Za-z']+$/);
  });
});
