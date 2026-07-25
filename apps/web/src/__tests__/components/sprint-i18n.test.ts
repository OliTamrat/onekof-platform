import { describe, it, expect } from 'vitest';
import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';
import ti from '@/locales/ti.json';
import so from '@/locales/so.json';

const locales = { en, am, om, ti, so } as Record<string, any>;

describe('Sprint i18n keys', () => {
  const enKeys = Object.keys((en as any).sprints || {});

  it('en has the sprints namespace', () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it.each(['am', 'om', 'ti', 'so'])('%s has every sprints key en has', (lang) => {
    const langKeys = Object.keys(locales[lang].sprints || {});
    const missing = enKeys.filter((k) => !langKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it.each(['am', 'om', 'ti', 'so'])('%s has no extra sprints keys', (lang) => {
    const langKeys = Object.keys(locales[lang].sprints || {});
    const extra = langKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('interpolation placeholders match en in every locale', () => {
    const placeholders = (s: string) => (s.match(/\{(\w+)\}/g) || []).sort();
    for (const key of enKeys) {
      const expected = placeholders((en as any).sprints[key]);
      for (const lang of ['am', 'om', 'ti', 'so']) {
        const actual = placeholders(locales[lang].sprints[key]);
        expect(actual, `${lang}.sprints.${key}`).toEqual(expected);
      }
    }
  });

  it('terminology nouns differ between AGILE and FORMAL schemes', () => {
    for (const lang of ['en', 'am', 'om', 'ti', 'so']) {
      const s = locales[lang].sprints;
      expect(s.noun, `${lang} noun vs formal`).not.toEqual(s.nounFormal);
    }
  });
});
