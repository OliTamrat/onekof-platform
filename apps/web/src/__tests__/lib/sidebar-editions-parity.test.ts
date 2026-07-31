import { describe, it, expect } from 'vitest';
import { getSidebarNavigation, NAVIGABLE_SECTION_IDS } from '@/lib/sidebar-navigation-dynamic';
import { getAllPresets } from '@/lib/presets/organization-presets';
import { getAllEditions, getEdition, BASE_EDITION } from '@/lib/navigation/editions';
import fixture from './fixtures/sidebar-parity.json';

/**
 * E1 parity proof (SIDEBAR_EDITIONS_ARCHITECTURE.md §5).
 *
 * The fixture was captured from the PRE-editions renderer — the substring-
 * ladder implementation — immediately before the refactor, in this same
 * change. E1's contract is that replacing the mechanism changes NOTHING an
 * organization sees. When E2 adds per-edition order and vocabulary, the
 * fixture entries for the affected editions are regenerated in that same
 * commit, so the diff shows exactly which editions changed and how.
 */

const shape = (orgType: string | null, industry: string | null) =>
  getSidebarNavigation(orgType, undefined, industry).map((s) => ({
    id: s.id,
    nameKey: s.nameKey ?? null,
    href: s.href ?? null,
    items: s.items.map((i) => ({ nameKey: i.nameKey ?? null, href: i.href })),
  }));

describe('E1 parity: the editions mechanism renders exactly what the ladder rendered', () => {
  const ORG_TYPES = [
    'government', 'ministry', 'ngo', 'business', 'education',
    'healthcare', 'hospital', 'clinic', 'construction', 'private', 'personal',
  ] as const;

  for (const t of ORG_TYPES) {
    it(`${t} is unchanged`, () => {
      expect(shape(t, t)).toEqual((fixture as Record<string, unknown>)[t]);
    });
  }

  it('legacy fail-open (no settings, no industry) is unchanged', () => {
    expect(shape(null, null)).toEqual((fixture as Record<string, unknown>)['__legacy_null']);
  });

  it('explicit settings still beat the preset (D9)', () => {
    const got = getSidebarNavigation('healthcare', { enabledSections: ['teams'] } as never, 'healthcare')
      .map((s) => ({ id: s.id, items: s.items.map((i) => i.href) }));
    expect(got).toEqual((fixture as Record<string, unknown>)['__settings_teams_only']);
  });
});

describe('S5: NAVIGABLE_SECTION_IDS is derived, and still complete', () => {
  it('matches the set the hand-maintained list carried', () => {
    // The pre-derivation list, verbatim. If the derivation ever loses one of
    // these, a preset switch silently dies — that is the S5 regression.
    const before = [
      'projects', 'teams', 'budget', 'development', 'marketing', 'operations',
      'medical', 'research', 'goals', 'automations', 'documents', 'docs',
      'issues', 'calendar', 'timeline', 'analytics',
    ];
    expect([...NAVIGABLE_SECTION_IDS].sort()).toEqual(before.sort());
  });

  it('every preset-enabled section is navigable (the dead-switch invariant)', () => {
    const navigable = new Set(NAVIGABLE_SECTION_IDS);
    for (const preset of getAllPresets()) {
      for (const id of preset.enabledSections) {
        expect(navigable.has(id), `${preset.name}: "${id}"`).toBe(true);
      }
    }
  });
});

describe('S2/S3: edition wiring', () => {
  it('every preset resolves to a defined edition', () => {
    const editionIds = new Set(getAllEditions().map((e) => e.id));
    for (const preset of getAllPresets()) {
      expect(editionIds.has(preset.editionId), preset.name).toBe(true);
    }
  });

  it('unknown and null resolve to the base edition, which is a no-op', () => {
    expect(getEdition(null)).toBe(BASE_EDITION);
    expect(getEdition(undefined)).toBe(BASE_EDITION);
    expect(BASE_EDITION.lead).toEqual([]);
    expect(BASE_EDITION.vocabulary).toEqual({});
    expect(BASE_EDITION.extras).toEqual([]);
  });

  it('S3: no edition leads with or decorates a section its preset did not enable', () => {
    // lead ids and extra hosts must be inside the corresponding preset's
    // membership — otherwise the edition points at something that cannot
    // render, which is the dead-switch problem wearing a new coat.
    for (const preset of getAllPresets()) {
      const edition = getEdition(preset.editionId);
      const enabled = new Set<string>([...preset.enabledSections, 'home', 'knowledge']);
      for (const id of edition.lead) {
        expect(enabled.has(id), `${edition.id} leads with "${id}"`).toBe(true);
      }
      for (const extra of edition.extras) {
        expect(enabled.has(extra.section), `${edition.id} extra under "${extra.section}"`).toBe(true);
      }
    }
  });
});
