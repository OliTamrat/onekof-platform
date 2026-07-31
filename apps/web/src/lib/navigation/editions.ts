/**
 * Sidebar Editions — per-organization-type navigation shape.
 *
 * docs/architecture/SIDEBAR_EDITIONS_ARCHITECTURE.md (S1–S9, APPROVED).
 *
 * The split that governs everything here (S2/S3):
 *
 *   - MEMBERSHIP — which sections an org gets — lives in the industry
 *     presets and the org's own settings. It is customer-editable from the
 *     Customization page and this module must never override it.
 *   - ORDER, VOCABULARY and COMPOSITION — what an edition *feels* like —
 *     live here, as data.
 *
 * S3: an edition may only reorder, rename and decorate what membership
 * already granted. It cannot add a section the preset did not enable, nor
 * resurrect one the customer disabled. Extras attach to a host section and
 * disappear with it.
 *
 * E1 STATE: all six editions are deliberately EMPTY. This phase ships the
 * mechanism with zero visible change, proven by parity fixtures captured
 * from the pre-refactor renderer. E2 fills order and vocabulary; E3 fills
 * sector extras.
 */

import type { LucideIcon } from 'lucide-react';

export type SidebarEditionId =
  | 'base'          // Business / Startup — the default product IS the base
  | 'ministry'
  | 'ngo'
  | 'education'
  | 'healthcare'
  | 'construction';

export interface EditionExtraItem {
  /** Host section id. The extra renders only if this section survived
   *  membership filtering (S3) — an extra can never create a section. */
  section: string;
  item: {
    name: string;
    nameKey: string;
    href: string;
    icon?: LucideIcon;
    /** Additional membership gate for the item itself, or null. */
    requires: string | null;
  };
}

export interface SidebarEdition {
  id: SidebarEditionId;
  /**
   * Axis 2 — order. Section ids to lift to the front, in this order.
   * 'home' is always pinned first regardless; sections not listed keep
   * their base relative order after the lead.
   */
  lead: string[];
  /**
   * Axis 3 — vocabulary. Maps a base nameKey to this edition's nameKey.
   * S6: every target key must exist in all five locales; the language
   * layer falls back through the base key if a locale misses one.
   */
  vocabulary: Record<string, string>;
  /** Axis 4 — composition. Sector items appended to a host section. */
  extras: EditionExtraItem[];
}

/**
 * The base edition is intentionally empty: it renders the base structure
 * untouched, and it is what every unknown or legacy org resolves to, so a
 * failure to resolve an edition can never change what anyone sees.
 */
export const BASE_EDITION: SidebarEdition = {
  id: 'base',
  lead: [],
  vocabulary: {},
  extras: [],
};

export const MINISTRY_EDITION: SidebarEdition = {
  id: 'ministry',
  lead: [],
  vocabulary: {},
  extras: [],
};

export const NGO_EDITION: SidebarEdition = {
  id: 'ngo',
  lead: [],
  vocabulary: {},
  extras: [],
};

export const EDUCATION_EDITION: SidebarEdition = {
  id: 'education',
  lead: [],
  vocabulary: {},
  extras: [],
};

export const HEALTHCARE_EDITION: SidebarEdition = {
  id: 'healthcare',
  lead: [],
  vocabulary: {},
  extras: [],
};

export const CONSTRUCTION_EDITION: SidebarEdition = {
  id: 'construction',
  lead: [],
  vocabulary: {},
  extras: [],
};

const EDITIONS: Record<SidebarEditionId, SidebarEdition> = {
  base: BASE_EDITION,
  ministry: MINISTRY_EDITION,
  ngo: NGO_EDITION,
  education: EDUCATION_EDITION,
  healthcare: HEALTHCARE_EDITION,
  construction: CONSTRUCTION_EDITION,
};

export function getEdition(id: SidebarEditionId | null | undefined): SidebarEdition {
  return (id && EDITIONS[id]) || BASE_EDITION;
}

export function getAllEditions(): SidebarEdition[] {
  return Object.values(EDITIONS);
}

// Referenced so the type is used before E3 fills extras (keeps lint honest).
export type { LucideIcon as _EditionIcon };
