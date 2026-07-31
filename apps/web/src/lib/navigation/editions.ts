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
 * Sector extras (E3) live under an existing host section rather than as
 * top-level entries, so they inherit the host's membership gate and the
 * customer's ability to turn the whole area off. compliance and resources
 * remain deliberately unwired pending the founder's Q1 scope decision
 * (SIDEBAR_EDITIONS_ARCHITECTURE.md Section 6).
 */

import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  Heart,
  TrendingUp,
  GraduationCap,
  Construction,
} from 'lucide-react';

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

/**
 * Ministry / Government. Budget leads: public-fund accountability is the
 * job, so it sits where the eye lands first, ahead of generic PM.
 */
export const MINISTRY_EDITION: SidebarEdition = {
  id: 'ministry',
  lead: ['budget', 'projects', 'operations'],
  vocabulary: {},
  extras: [
    // Tenders and supplier contracts are a spending process, so
    // Procurement lives under Budget — the section a ministry leads with.
    {
      section: 'budget',
      item: {
        name: 'Procurement',
        nameKey: 'sidebar.procurement',
        href: '/dashboard/procurement',
        icon: ShoppingCart,
        requires: null,
      },
    },
  ],
};

/**
 * NGO / Non-Profit. Projects and Budget lead (donor-funded delivery), and
 * Marketing is renamed Outreach — no NGO calls stakeholder engagement
 * "marketing".
 */
export const NGO_EDITION: SidebarEdition = {
  id: 'ngo',
  lead: ['projects', 'budget'],
  vocabulary: { 'sidebar.marketing': 'sidebar.outreach' },
  extras: [
    {
      section: 'budget',
      item: {
        name: 'Grants',
        nameKey: 'sidebar.grants',
        href: '/dashboard/grants',
        icon: Heart,
        requires: null,
      },
    },
    {
      section: 'projects',
      item: {
        name: 'Impact',
        nameKey: 'sidebar.impact',
        href: '/dashboard/impact',
        icon: TrendingUp,
        // Impact is outcome reporting — it rides the same gate as Reports.
        requires: 'analytics',
      },
    },
  ],
};

/**
 * Education. Research follows Projects — it is the department the sector
 * runs on (Q3 is still open with the founder; membership is untouched
 * here, only emphasis).
 */
export const EDUCATION_EDITION: SidebarEdition = {
  id: 'education',
  lead: ['projects', 'research'],
  vocabulary: {},
  extras: [
    // Teaching material is knowledge content; Courses shares the docs gate
    // with Wiki and Docs rather than inventing a new switch.
    {
      section: 'knowledge',
      item: {
        name: 'Courses',
        nameKey: 'sidebar.courses',
        href: '/dashboard/courses',
        icon: GraduationCap,
        requires: 'docs',
      },
    },
  ],
};

/**
 * Healthcare. Medical leads — a hospital administrator should not scroll
 * past generic PM sections to reach the module that names their work.
 * Operations is renamed Facility Operations: that is what M4's
 * Facilities/Equipment/Safety workstreams are to a hospital.
 */
export const HEALTHCARE_EDITION: SidebarEdition = {
  id: 'healthcare',
  lead: ['medical', 'operations', 'projects'],
  vocabulary: { 'sidebar.operations': 'sidebar.facilityOperations' },
  extras: [],
};

/**
 * Construction / Infrastructure. Operations leads (site delivery is the
 * business) and is renamed Site Operations. This is the Q4 answer:
 * Construction and Ministry carried byte-identical sidebars until this
 * edition existed.
 */
export const CONSTRUCTION_EDITION: SidebarEdition = {
  id: 'construction',
  lead: ['operations', 'projects', 'budget'],
  vocabulary: { 'sidebar.operations': 'sidebar.siteOperations' },
  extras: [
    // The sector's own word for where work happens, beside the M4
    // Facilities/Equipment/Safety workstreams it coordinates with.
    {
      section: 'operations',
      item: {
        name: 'Sites',
        nameKey: 'sidebar.sites',
        href: '/dashboard/sites',
        icon: Construction,
        requires: null,
      },
    },
  ],
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
