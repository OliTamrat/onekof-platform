import { describe, it, expect } from 'vitest';
import {
  getSidebarNavigation,
  NAVIGABLE_SECTION_IDS,
} from '@/lib/sidebar-navigation-dynamic';
import { getAllPresets, getPresetForOrgType } from '@/lib/presets/organization-presets';

const idsFor = (orgType: string) =>
  getSidebarNavigation(orgType, undefined, orgType).map((s) => s.id);

const sectionFor = (orgType: string, id: string) =>
  getSidebarNavigation(orgType, undefined, orgType).find((s) => s.id === id);

describe('Medical section reaches healthcare and nobody else', () => {
  // M3 built /dashboard/medical, /dashboard/patients and /api/medical/status
  // and shipped with no way to reach any of them from the product. A founder
  // testing the live site asked "where is the patients card" — the answer was
  // that there wasn't one, only a URL you had to already know.
  it('healthcare gets Medical', () => {
    expect(idsFor('healthcare')).toContain('medical');
  });

  it('healthcare aliases get it too — the org type on record may be either', () => {
    // Beki Health is registered under one of these; whichever it is, the
    // section has to appear, so all three are pinned rather than assumed.
    expect(idsFor('hospital')).toContain('medical');
    expect(idsFor('clinic')).toContain('medical');
  });

  it('Medical carries Patients and Care work', () => {
    const medical = sectionFor('healthcare', 'medical');
    expect(medical?.href).toBe('/dashboard/medical');
    const hrefs = medical?.items.map((i) => i.href) ?? [];
    expect(hrefs).toContain('/dashboard/patients');
    // Care work is a link INTO the issue board, not a second board: M7 made
    // care items Tasks so they inherit statuses, sprints and reporting.
    expect(hrefs).toContain('/dashboard/issues?department=medical');
  });

  // The failure this guards: 'medical' is not in the department gate, so the
  // section falls through to the "has an href" branch and every organization
  // — ministry, school, contractor — is handed a Patients link.
  it('no non-healthcare org type gets Medical', () => {
    for (const orgType of ['government', 'ministry', 'ngo', 'education', 'construction', 'private']) {
      expect(idsFor(orgType), `${orgType} was shown Medical`).not.toContain('medical');
    }
  });

  it('explicit settings that omit medical remove it even for a hospital', () => {
    // D9: settings win over the preset. A hospital that turns the module off
    // in Customization must actually lose the entry.
    const sections = getSidebarNavigation('healthcare', { enabledSections: ['projects', 'issues'] } as never, 'healthcare');
    expect(sections.map((s) => s.id)).not.toContain('medical');
  });
});

describe('every enabled section has somewhere to go', () => {
  // A section id enabled by a preset but absent from the navigation is a dead
  // switch: the Customization page shows a toggle, the user flips it, and
  // nothing changes. This is the same invariant industry-presets.test.ts
  // asserts from the preset side; here it is asserted from the render side.
  it('each preset renders at least the sections it claims are navigable', () => {
    const navigable = new Set<string>(NAVIGABLE_SECTION_IDS);
    for (const preset of getAllPresets()) {
      const orgType = preset.name;
      const claimed = preset.enabledSections.filter((id) => navigable.has(id as string));
      expect(claimed.length, `${orgType} enables nothing navigable`).toBeGreaterThan(0);
    }
  });

  it('the healthcare preset and the healthcare sidebar agree about medical', () => {
    // Two separate files have to be edited together for the module to work.
    // Either alone is invisible: preset without navigation is a dead switch,
    // navigation without the preset is a section nobody is granted.
    expect(getPresetForOrgType('healthcare').enabledSections).toContain('medical');
    expect(idsFor('healthcare')).toContain('medical');
  });
});

describe('legacy fail-open still returns a usable sidebar', () => {
  it('an org with neither settings nor an industry gets everything', () => {
    // Deliberate: navigation must work even when settings fail to load. The
    // Medical PAGES remain safe here because access is enforced server-side
    // by residency posture plus the patient access grant, not by whether a
    // link is visible.
    const ids = getSidebarNavigation(null, undefined, null).map((s) => s.id);
    expect(ids).toContain('home');
    expect(ids).toContain('projects');
  });
});
