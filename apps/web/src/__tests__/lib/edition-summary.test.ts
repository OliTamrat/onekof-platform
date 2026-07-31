import { describe, it, expect } from 'vitest';
import { getEditionHighlightKeys } from '@/lib/navigation/edition-summary';
import { getSidebarNavigation } from '@/lib/sidebar-navigation-dynamic';
import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';
import ti from '@/locales/ti.json';
import so from '@/locales/so.json';

/**
 * S7: what onboarding claims is what the sidebar shows, by construction.
 * These tests pin the visible half (the first two chips render on the
 * card) and the structural half (every claim is reachable in the sidebar
 * the same org type receives).
 */

describe('S7: the first two chips are the sector identity', () => {
  it('each live onboarding type leads with its truest claims', () => {
    expect(getEditionHighlightKeys('government').slice(0, 2)).toEqual(['sidebar.procurement', 'sidebar.operations']);
    expect(getEditionHighlightKeys('ngo').slice(0, 2)).toEqual(['sidebar.grants', 'sidebar.impact']);
    expect(getEditionHighlightKeys('education').slice(0, 2)).toEqual(['sidebar.courses', 'sidebar.research']);
    expect(getEditionHighlightKeys('construction').slice(0, 2)).toEqual(['sidebar.sites', 'sidebar.siteOperations']);
    expect(getEditionHighlightKeys('healthcare').slice(0, 2)).toEqual(['sidebar.medical', 'sidebar.facilityOperations']);
    // Business/personal are the base edition: the build-and-automate stack.
    expect(getEditionHighlightKeys('private').slice(0, 2)).toEqual(['sidebar.development', 'sidebar.automation']);
    expect(getEditionHighlightKeys('personal')).toEqual(getEditionHighlightKeys('private'));
  });
});

describe('S7: every claimed chip is reachable in that org type sidebar', () => {
  // The drift this kills: a card advertising a capability whose sidebar
  // entry does not exist. The claim set and the render set come from the
  // same data, and this test proves the join.
  const LIVE_ONBOARDING_TYPES = ['personal', 'government', 'private', 'ngo', 'education', 'construction', 'healthcare'];

  it('each chip nameKey appears in the rendered sidebar', () => {
    for (const orgType of LIVE_ONBOARDING_TYPES) {
      const sidebar = getSidebarNavigation(orgType, undefined, orgType);
      const renderedKeys = new Set<string>();
      for (const s of sidebar) {
        if (s.nameKey) renderedKeys.add(s.nameKey);
        for (const i of s.items) if (i.nameKey) renderedKeys.add(i.nameKey);
      }
      for (const key of getEditionHighlightKeys(orgType)) {
        expect(renderedKeys.has(key), `${orgType}: card claims "${key}" but the sidebar never shows it`).toBe(true);
      }
    }
  });

  it('every generated key exists in all five locales', () => {
    const locales: Record<string, Record<string, Record<string, string>>> = {
      en: en as never, am: am as never, om: om as never, ti: ti as never, so: so as never,
    };
    for (const orgType of LIVE_ONBOARDING_TYPES) {
      for (const key of getEditionHighlightKeys(orgType)) {
        const [ns, k] = key.split('.');
        for (const [loc, dict] of Object.entries(locales)) {
          expect(typeof dict[ns]?.[k], `${orgType}: "${key}" missing in ${loc}.json`).toBe('string');
        }
      }
    }
  });
});
