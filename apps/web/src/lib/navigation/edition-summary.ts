/**
 * Edition summary — what onboarding may claim an org type gets (S7).
 *
 * The M0 honesty rule, made structural: the capability chips on the
 * onboarding org-type cards are DERIVED from the same preset + edition
 * data that renders the sidebar, so they cannot drift from what the
 * customer actually receives. Before this, the chips were hand-written
 * i18n strings — they had already drifted once (the Healthcare card
 * advertised modules whose pages did not exist), and the fix was manual.
 *
 * A chip is one of:
 *   1. a sector extra the edition adds (Procurement, Grants, Impact,
 *      Courses, Sites) — the most sector-specific claims lead;
 *   2. a DISTINCTIVE section: enabled by this type's preset but not by
 *      every preset (the common core is not a differentiator and would
 *      make every card say the same thing).
 *
 * Vocabulary is applied, so a healthcare card says "Facility Operations"
 * and a construction card says "Site Operations" — exactly the label the
 * sidebar will show after onboarding completes.
 */

import { getAllPresets, getPresetForOrgType } from '@/lib/presets/organization-presets';
import { getEdition } from '@/lib/navigation/editions';

/** Section id → the sidebar nameKey that names it to users. */
const SECTION_NAME_KEYS: Record<string, string> = {
  development: 'sidebar.development',
  marketing: 'sidebar.marketing',
  operations: 'sidebar.operations',
  medical: 'sidebar.medical',
  research: 'sidebar.research',
  automations: 'sidebar.automation',
  // The analytics gate surfaces to users as the Reports entry (the
  // sidebar.analytics key only labels a Marketing sub-item). Claiming
  // "Analytics" on a card whose sidebar says "Reports" is exactly the
  // drift the S7 reachability test exists to kill — it caught this one.
  analytics: 'sidebar.reports',
};

/** Stable fallback emphasis when a section is not in the edition's lead.
 *  Development/automation first: the base edition is Business/Startup, and
 *  its identity is the build-and-automate stack, not operations. */
const BASE_EMPHASIS = ['medical', 'development', 'automations', 'operations', 'research', 'marketing', 'analytics'];

/** Sections every preset enables — true, but not a differentiator. */
function commonCore(): Set<string> {
  const presets = getAllPresets();
  const core = new Set<string>(presets[0].enabledSections);
  for (const preset of presets.slice(1)) {
    const own = new Set<string>(preset.enabledSections);
    for (const id of core) if (!own.has(id)) core.delete(id);
  }
  return core;
}

/**
 * i18n keys for the capability chips of an org type, most sector-specific
 * first. Every key is guaranteed present in all five locales by the S6
 * guard test — a missing translation fails the build, not the render.
 */
export function getEditionHighlightKeys(orgType: string): string[] {
  const preset = getPresetForOrgType(orgType);
  const edition = getEdition(preset.editionId);
  const core = commonCore();

  const distinctive = preset.enabledSections
    .filter((id) => !core.has(id) && SECTION_NAME_KEYS[id])
    .sort((a, b) => {
      const rank = (id: string) => {
        const lead = edition.lead.indexOf(id);
        return lead >= 0 ? lead : edition.lead.length + BASE_EMPHASIS.indexOf(id);
      };
      return rank(a) - rank(b);
    })
    .map((id) => {
      const key = SECTION_NAME_KEYS[id];
      return edition.vocabulary[key] ?? key;
    });

  return [...edition.extras.map((e) => e.item.nameKey), ...distinctive];
}
