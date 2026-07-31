/**
 * Dynamic Sidebar Navigation
 *
 * One base structure; per-organization variation is applied in two layers
 * (docs/architecture/SIDEBAR_EDITIONS_ARCHITECTURE.md, S1–S9 APPROVED):
 *
 *   1. MEMBERSHIP — resolveEnabledSections(): explicit org settings win,
 *      else the industry preset, else legacy fail-open (D9). Every section
 *      and sub-item declares its gate explicitly via `requires` (S4) — the
 *      old itemPath.includes('/budget') substring ladder is gone; it worked
 *      by luck of the path set and inherited gates silently.
 *   2. EDITION — order, vocabulary and sector extras from
 *      lib/navigation/editions.ts (S2). An edition can only reorder,
 *      rename and decorate what membership granted (S3).
 */

import {
  resolveEnabledSections,
  getPresetForOrgType,
} from '@/lib/presets/organization-presets';
import { getEdition, type SidebarEdition } from '@/lib/navigation/editions';
import type { OrganizationSettings } from '@/types/organization-settings';
import {
  Home,
  FolderKanban,
  ListChecks,
  Calendar,
  Users,
  UserPlus,
  Target,
  BarChart3,
  Sparkles,
  Zap,
  BookOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Map,
  MessageSquare,
  GitBranch,
  Puzzle,
  Building2,
  Wrench,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarSubItem {
  name: string;
  nameKey?: string;
  href: string;
  icon?: LucideIcon;
  /**
   * Section id that must be enabled for this item to render, or null for
   * always-on (S4). Explicit on every entry: an item with no declared gate
   * is a type error, not a silent pass.
   */
  requires?: string | null;
}

export interface SidebarSection {
  id: string;
  name: string;
  nameKey?: string;
  icon: LucideIcon;
  href?: string;
  items: SidebarSubItem[];
  /** Section-level membership gate, or null for always-on (S4). */
  requires?: string | null;
}

/** Internal: SidebarSubItem with the gate made mandatory. */
type GatedItem = SidebarSubItem & { requires: string | null };
type GatedSection = Omit<SidebarSection, 'items' | 'requires'> & {
  requires: string | null;
  items: GatedItem[];
};

/**
 * The base structure every edition starts from. Gate values preserve the
 * exact semantics of the pre-editions renderer, parity-proven by
 * __tests__/lib/fixtures/sidebar-parity.json:
 *
 * - `home`, `projects` and `knowledge` are ungated sections (always kept).
 * - Sub-items either share a feature gate (Reports → analytics) or are
 *   always-on within their section (requires: null).
 * - Medical's Care work rides the `issues` gate because it IS the issue
 *   board, filtered to the medical department (M7: care items are Tasks).
 */
function baseSections(): GatedSection[] {
  return [
    // 1. HOME
    {
      id: 'home',
      name: 'Home',
      nameKey: 'sidebar.home',
      icon: Home,
      href: '/dashboard',
      requires: null,
      items: [],
    },

    // 2. CORE PROJECT MANAGEMENT
    {
      id: 'projects',
      name: 'Projects',
      nameKey: 'sidebar.projects',
      icon: FolderKanban,
      href: '/dashboard/projects',
      requires: null,
      items: [
        { name: 'All Projects', nameKey: 'sidebar.allProjects', href: '/dashboard/projects', icon: FolderKanban, requires: null },
        { name: 'Issues', nameKey: 'sidebar.issues', href: '/dashboard/issues', icon: ListChecks, requires: 'issues' },
        { name: 'Calendar', nameKey: 'sidebar.calendar', href: '/dashboard/calendar', icon: Calendar, requires: 'calendar' },
        { name: 'Timeline', nameKey: 'sidebar.timeline', href: '/dashboard/timeline', icon: Calendar, requires: 'timeline' },
        { name: 'Goals', nameKey: 'sidebar.goals', href: '/dashboard/goals', icon: Target, requires: 'goals' },
        { name: 'Reports', nameKey: 'sidebar.reports', href: '/dashboard/reports', icon: BarChart3, requires: 'analytics' },
      ],
    },

    // 3. TEAMS & MEMBERS
    {
      id: 'teams',
      name: 'Teams',
      nameKey: 'sidebar.teams',
      icon: Users,
      href: '/dashboard/teams',
      requires: 'teams',
      items: [
        { name: 'Members', nameKey: 'sidebar.members', href: '/dashboard/members', icon: UserPlus, requires: null },
      ],
    },

    // 4. BUDGET
    {
      id: 'budget',
      name: 'Budget',
      nameKey: 'sidebar.budget',
      icon: DollarSign,
      href: '/dashboard/budget',
      requires: 'budget',
      items: [],
    },

    // 5. DEVELOPMENT — software/technical projects
    {
      id: 'development',
      name: 'Development',
      nameKey: 'sidebar.development',
      icon: GitBranch,
      href: '/dashboard/development',
      requires: 'development',
      items: [
        { name: 'Backlog', nameKey: 'sidebar.backlog', href: '/dashboard/development/backlog', icon: ListChecks, requires: null },
        { name: 'Releases', nameKey: 'sidebar.releases', href: '/dashboard/development/releases', icon: GitBranch, requires: null },
        { name: 'Code Review', nameKey: 'sidebar.codeReview', href: '/dashboard/development/code', icon: FileText, requires: null },
      ],
    },

    // 6. MARKETING — public relations & stakeholder engagement
    {
      id: 'marketing',
      name: 'Marketing',
      nameKey: 'sidebar.marketing',
      icon: TrendingUp,
      href: '/dashboard/marketing',
      requires: 'marketing',
      items: [
        { name: 'Social Media', nameKey: 'sidebar.socialMedia', href: '/dashboard/marketing/social', icon: MessageSquare, requires: null },
        { name: 'Analytics', nameKey: 'sidebar.analytics', href: '/dashboard/marketing/analytics', icon: TrendingUp, requires: 'analytics' },
        { name: 'Campaigns', nameKey: 'sidebar.campaigns', href: '/dashboard/marketing/campaigns', icon: Map, requires: null },
      ],
    },

    // 7. OPERATIONS — incidents, monitoring, M4 facility workstreams
    {
      id: 'operations',
      name: 'Operations',
      nameKey: 'sidebar.operations',
      icon: Activity,
      href: '/dashboard/operations',
      requires: 'operations',
      items: [
        { name: 'Incidents', nameKey: 'sidebar.incidents', href: '/dashboard/operations/incidents', icon: AlertCircle, requires: null },
        { name: 'Monitoring', nameKey: 'sidebar.monitoring', href: '/dashboard/operations/monitoring', icon: Activity, requires: null },
        { name: 'Checklists', nameKey: 'sidebar.checklists', href: '/dashboard/operations/checklists', icon: CheckCircle2, requires: null },
        { name: 'Facilities', nameKey: 'sidebar.facilities', href: '/dashboard/operations/facilities', icon: Building2, requires: null },
        { name: 'Equipment', nameKey: 'sidebar.equipment', href: '/dashboard/operations/equipment', icon: Wrench, requires: null },
        { name: 'Safety Management', nameKey: 'sidebar.safety', href: '/dashboard/operations/safety', icon: ShieldCheck, requires: null },
      ],
    },

    // 7b. MEDICAL (M3) — healthcare organizations only
    {
      id: 'medical',
      name: 'Medical',
      nameKey: 'sidebar.medical',
      icon: Stethoscope,
      href: '/dashboard/medical',
      requires: 'medical',
      items: [
        { name: 'Patients', nameKey: 'sidebar.patients', href: '/dashboard/patients', icon: Users, requires: null },
        { name: 'Care work', nameKey: 'sidebar.careWork', href: '/dashboard/issues?department=medical', icon: ClipboardList, requires: 'issues' },
      ],
    },

    // 8. RESEARCH & DATA
    {
      id: 'research',
      name: 'Research',
      nameKey: 'sidebar.research',
      icon: FileSpreadsheet,
      href: '/dashboard/research',
      requires: 'research',
      items: [
        { name: 'Data', nameKey: 'sidebar.data', href: '/dashboard/research/data', icon: FileSpreadsheet, requires: null },
        { name: 'Findings', nameKey: 'sidebar.findings', href: '/dashboard/research/findings', icon: FileText, requires: null },
        { name: 'Plans', nameKey: 'sidebar.plans', href: '/dashboard/research/plans', icon: Map, requires: null },
        { name: 'Materials', nameKey: 'sidebar.materials', href: '/dashboard/research/materials', icon: FileSpreadsheet, requires: null },
        { name: 'Inspections', nameKey: 'sidebar.inspections', href: '/dashboard/research/inspections', icon: CheckCircle2, requires: null },
      ],
    },

    // 9. KNOWLEDGE & AUTOMATION
    {
      id: 'knowledge',
      name: 'Knowledge',
      nameKey: 'sidebar.knowledge',
      icon: BookOpen,
      href: '/dashboard/documents',
      requires: null,
      items: [
        { name: 'AI Documents', nameKey: 'sidebar.aiDocuments', href: '/dashboard/documents', icon: Sparkles, requires: 'documents' },
        { name: 'Automation', nameKey: 'sidebar.automation', href: '/dashboard/automations', icon: Zap, requires: 'automations' },
        { name: 'Wiki', nameKey: 'sidebar.wiki', href: '/dashboard/wiki', icon: BookOpen, requires: 'docs' },
        { name: 'Docs', nameKey: 'sidebar.docs', href: '/dashboard/docs', icon: BookOpen, requires: 'docs' },
        { name: 'Integrations', nameKey: 'sidebar.integrations', href: '/dashboard/settings/integrations', icon: Puzzle, requires: null },
      ],
    },
  ];
}

/**
 * Section ids that actually change what the sidebar renders — either a
 * top-level section gate or a gated sub-item. An id outside this set is a
 * DEAD SWITCH: presets may enable it and the Customization page may toggle
 * it, but nothing happens.
 *
 * S5: DERIVED from the base structure above (plus edition extras' gates),
 * so it cannot drift from the navigation the way the old hand-maintained
 * list did. `projects` is included by declaration: every preset enables it
 * and its section deliberately always renders, so it is navigable by
 * definition even though nothing gates on it today.
 */
export const NAVIGABLE_SECTION_IDS: readonly string[] = (() => {
  const ids = new Set<string>(['projects']);
  for (const section of baseSections()) {
    if (section.requires) ids.add(section.requires);
    for (const item of section.items) {
      if (item.requires) ids.add(item.requires);
    }
  }
  return Array.from(ids);
})();

/** Home is always first; then the edition's lead; then base order (S2). */
function applyOrder(sections: GatedSection[], edition: SidebarEdition): GatedSection[] {
  if (edition.lead.length === 0) return sections;
  const rank = (s: GatedSection, baseIndex: number): number => {
    if (s.id === 'home') return -1;
    const lead = edition.lead.indexOf(s.id);
    return lead >= 0 ? lead : edition.lead.length + baseIndex;
  };
  return sections
    .map((s, i) => ({ s, r: rank(s, i) }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.s);
}

/** Rename section nameKeys per the edition's vocabulary (S2 axis 3). */
function applyVocabulary(sections: GatedSection[], edition: SidebarEdition): GatedSection[] {
  const vocab = edition.vocabulary;
  if (Object.keys(vocab).length === 0) return sections;
  return sections.map((s) =>
    s.nameKey && vocab[s.nameKey] ? { ...s, nameKey: vocab[s.nameKey] } : s
  );
}

/**
 * Append the edition's sector items to their host sections (S2 axis 4).
 * S3: an extra renders only if its host section survived membership
 * filtering, and its own `requires` gate is also honoured — an edition can
 * never add what membership did not grant.
 */
function applyExtras(
  sections: GatedSection[],
  edition: SidebarEdition,
  enabledSet: Set<string> | null
): GatedSection[] {
  if (edition.extras.length === 0) return sections;
  return sections.map((section) => {
    const extras = edition.extras.filter(
      (e) =>
        e.section === section.id &&
        (e.item.requires === null || enabledSet === null || enabledSet.has(e.item.requires))
    );
    if (extras.length === 0) return section;
    return { ...section, items: [...section.items, ...extras.map((e) => ({ ...e.item }))] };
  });
}

/**
 * Get the sidebar for an organization.
 *
 * `industry` takes precedence over `organizationType` for resolving both
 * membership (the preset) and the edition — an org onboarded as "private"
 * can still be a clinic.
 */
export function getSidebarNavigation(
  organizationType?: string | null,
  organizationSettings?: OrganizationSettings,
  industry?: string | null
): SidebarSection[] {
  const sectorKey = industry ?? organizationType ?? null;
  const edition = getEdition(sectorKey ? getPresetForOrgType(sectorKey).editionId : 'base');

  // D9 fail posture: explicit settings win; without them, derive from the
  // org's industry preset; only with neither (legacy orgs) fail open so
  // navigation always works even if settings fail to load. The legacy path
  // resolves to the base edition, so fail-open can never reorder or rename.
  const enabled = resolveEnabledSections(organizationSettings?.enabledSections, sectorKey);
  const enabledSet = enabled ? new Set(enabled) : null;

  let sections = baseSections();

  if (enabledSet) {
    sections = sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => item.requires === null || enabledSet.has(item.requires)
        ),
      }))
      .filter((section) => {
        if (section.requires !== null) return enabledSet.has(section.requires);
        // Ungated sections (home, projects, knowledge) keep the legacy rule:
        // present if they have a destination or anything left to show.
        return Boolean(section.href) || section.items.length > 0;
      });
  }

  sections = applyExtras(sections, edition, enabledSet);
  sections = applyVocabulary(sections, edition);
  sections = applyOrder(sections, edition);

  return sections;
}
