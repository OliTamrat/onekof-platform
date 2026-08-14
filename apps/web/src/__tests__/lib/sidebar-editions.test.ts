import { describe, it, expect } from 'vitest';
import { getSidebarNavigation } from '@/lib/sidebar-navigation-dynamic';
import { getAllEditions } from '@/lib/navigation/editions';
import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';
import ti from '@/locales/ti.json';
import so from '@/locales/so.json';

/**
 * E2/E3 behavior — the *intended* per-edition differences, stated by hand.
 * The parity fixture is the regression net; this file is the review: if an
 * order or a rename changes, the diff here says so in plain language.
 */

const ids = (t: string) => getSidebarNavigation(t, undefined, t).map((s) => s.id);
const keyOf = (t: string, id: string) =>
  getSidebarNavigation(t, undefined, t).find((s) => s.id === id)?.nameKey;

describe('E2 order: what leads reflects what the sector is for (S2 axis 2)', () => {
  // My work is a gated section like Teams or Budget now (Customization
  // decides it, not a pin), so it takes an ordinary trailing rank and its
  // position varies by how long each edition's lead list is — it is not
  // pinned near the top the way Home is.
  it('Ministry leads with Budget — public-fund accountability is the job', () => {
    expect(ids('ministry')).toEqual(['home', 'budget', 'projects', 'operations', 'my-work', 'teams', 'research', 'knowledge']);
    expect(ids('government')).toEqual(ids('ministry'));
  });

  it('Healthcare leads with Medical, then Facility Operations', () => {
    expect(ids('healthcare')).toEqual(['home', 'medical', 'operations', 'projects', 'my-work', 'teams', 'budget', 'research', 'knowledge']);
    expect(ids('hospital')).toEqual(ids('healthcare'));
    expect(ids('clinic')).toEqual(ids('healthcare'));
  });

  it('Construction leads with Site Operations — Q4: no longer identical to Ministry', () => {
    expect(ids('construction')).toEqual(['home', 'operations', 'projects', 'budget', 'my-work', 'teams', 'research', 'knowledge']);
    expect(ids('construction')).not.toEqual(ids('ministry'));
  });

  it('NGO: Projects then Budget; Education: Projects then Research', () => {
    expect(ids('ngo').slice(0, 3)).toEqual(['home', 'projects', 'budget']);
    expect(ids('education').slice(0, 3)).toEqual(['home', 'projects', 'research']);
  });

  it('Business IS the base: untouched order', () => {
    // Business/base has no lead list, so applyOrder never runs — sections
    // stay in baseSections() declaration order, where My work sits right
    // after Home.
    expect(ids('business')).toEqual(['home', 'my-work', 'projects', 'teams', 'budget', 'development', 'marketing', 'operations', 'knowledge']);
  });

  it('Home is pinned first in every edition — lead cannot displace it', () => {
    for (const t of ['ministry', 'ngo', 'education', 'healthcare', 'construction', 'business']) {
      expect(ids(t)[0], t).toBe('home');
    }
  });
});

describe('E2 vocabulary: sector naming (S2 axis 3)', () => {
  it('Healthcare calls Operations "Facility Operations"', () => {
    expect(keyOf('healthcare', 'operations')).toBe('sidebar.facilityOperations');
  });

  it('Construction calls Operations "Site Operations"', () => {
    expect(keyOf('construction', 'operations')).toBe('sidebar.siteOperations');
  });

  it('NGO calls Marketing "Outreach"', () => {
    expect(keyOf('ngo', 'marketing')).toBe('sidebar.outreach');
  });

  it('Ministry keeps the base name for Operations — renames are per-edition', () => {
    expect(keyOf('ministry', 'operations')).toBe('sidebar.operations');
  });
});

describe('E3 extras: sector entries live under their host section (S2 axis 4)', () => {
  const itemHrefs = (t: string, sectionId: string, settings?: string[]) =>
    getSidebarNavigation(t, settings ? ({ enabledSections: settings } as never) : undefined, t)
      .find((s) => s.id === sectionId)
      ?.items.map((i) => i.href);

  it('Ministry: Procurement under Budget', () => {
    expect(itemHrefs('ministry', 'budget')).toContain('/dashboard/procurement');
  });

  it('NGO: Grants under Budget, Impact under Projects', () => {
    expect(itemHrefs('ngo', 'budget')).toContain('/dashboard/grants');
    expect(itemHrefs('ngo', 'projects')).toContain('/dashboard/impact');
  });

  it('Education: Courses under Knowledge', () => {
    expect(itemHrefs('education', 'knowledge')).toContain('/dashboard/courses');
  });

  it('Construction: Sites under Operations', () => {
    expect(itemHrefs('construction', 'operations')).toContain('/dashboard/sites');
  });

  it('extras do not leak across editions sharing a section', () => {
    // Construction and Business both have Budget; only the Ministry
    // edition carries Procurement.
    expect(itemHrefs('construction', 'budget') ?? []).not.toContain('/dashboard/procurement');
    expect(itemHrefs('business', 'budget') ?? []).not.toContain('/dashboard/grants');
    expect(itemHrefs('healthcare', 'operations') ?? []).not.toContain('/dashboard/sites');
  });

  it('S3: an extra dies with its host section', () => {
    // A ministry that disabled Budget in Customization loses Procurement
    // with it — the edition cannot resurrect what membership removed.
    const sections = getSidebarNavigation('ministry', { enabledSections: ['teams', 'projects', 'issues'] } as never, 'ministry');
    expect(sections.map((s) => s.id)).not.toContain('budget');
    expect(sections.flatMap((s) => s.items.map((i) => i.href))).not.toContain('/dashboard/procurement');
  });

  it("S3: an extra's own requires gate is honoured", () => {
    // Impact rides the analytics gate like Reports. An NGO without
    // analytics keeps Projects but loses both.
    const hrefs = itemHrefs('ngo', 'projects', ['projects', 'budget', 'issues', 'teams']);
    expect(hrefs).not.toContain('/dashboard/impact');
    expect(hrefs).not.toContain('/dashboard/reports');
    // And Courses rides docs: education without docs keeps Knowledge
    // (Integrations remains) but loses Courses.
    const knowledge = itemHrefs('education', 'knowledge', ['projects', 'teams', 'documents']);
    expect(knowledge).not.toContain('/dashboard/courses');
  });

  it('S3: extras never create a section', () => {
    // With only Teams enabled, no extra host exists for the ministry
    // edition — nothing appears from nowhere. My work is gated too, so it
    // drops out here along with everything else Teams-only excludes.
    const ids2 = getSidebarNavigation('ministry', { enabledSections: ['teams'] } as never, 'ministry').map((s) => s.id);
    expect(ids2).toEqual(['home', 'projects', 'teams', 'knowledge']);
  });
});

describe('S6: every vocabulary target key exists in all five locales', () => {
  const locales: Record<string, Record<string, Record<string, string>>> = {
    en: en as never, am: am as never, om: om as never, ti: ti as never, so: so as never,
  };

  it('no edition renames into a key any locale is missing', () => {
    for (const edition of getAllEditions()) {
      for (const target of Object.values(edition.vocabulary)) {
        const [ns, key] = target.split('.');
        for (const [loc, dict] of Object.entries(locales)) {
          expect(
            typeof dict[ns]?.[key],
            `${edition.id}: "${target}" missing in ${loc}.json`
          ).toBe('string');
        }
      }
    }
  });

  it('extra items ship their nameKey in all five locales too', () => {
    for (const edition of getAllEditions()) {
      for (const extra of edition.extras) {
        const [ns, key] = extra.item.nameKey.split('.');
        for (const [loc, dict] of Object.entries(locales)) {
          expect(
            typeof dict[ns]?.[key],
            `${edition.id}: "${extra.item.nameKey}" missing in ${loc}.json`
          ).toBe('string');
        }
      }
    }
  });
});
