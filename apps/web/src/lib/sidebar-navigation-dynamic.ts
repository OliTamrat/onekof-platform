/**
 * Dynamic Sidebar Navigation
 *
 * Comprehensive sidebar with 21+ pages organized into collapsible categories
 * Includes all project management tools needed for Ministry projects (water dam, irrigation, etc.)
 * Now integrated with organization settings and feature flags
 */

import { getNavigationForType } from '@/config/organization-types';
import { resolveEnabledSections } from '@/lib/presets/organization-presets';
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
}

/**
 * Section ids that actually change what the sidebar renders — either a
 * top-level section or a gated sub-item. An id outside this set is a DEAD
 * SWITCH: presets may enable it and the Customization page may toggle it,
 * but nothing happens, because no navigation destination exists.
 *
 * Industry modules (medical, courses, compliance, impact) are deliberately
 * ABSENT until their pages are real — see
 * docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md. Add an id here in the
 * same change that adds its navigation, never before.
 */
export const NAVIGABLE_SECTION_IDS = [
  'projects', 'teams', 'budget', 'development', 'marketing', 'operations',
  // M3 made the Medical pages real, so the id stops being a dead switch.
  'medical',
  'research', 'goals', 'automations', 'documents', 'docs', 'issues',
  'calendar', 'timeline', 'analytics',
] as const;

export interface SidebarSection {
  id: string;
  name: string;
  nameKey?: string;
  icon: LucideIcon;
  href?: string;
  items: SidebarSubItem[];
}

/**
 * Get comprehensive sidebar navigation with all project management tools
 * Perfect for Ministry projects like water dams, irrigation, infrastructure, etc.
 * Filters based on organization settings and feature flags
 */
export function getSidebarNavigation(
  organizationType?: string | null,
  organizationSettings?: OrganizationSettings,
  industry?: string | null
): SidebarSection[] {
  // Build comprehensive 7-category structure with 21+ pages
  const allSections: SidebarSection[] = [
    // 1. HOME (No collapse - single item)
    {
      id: 'home',
      name: 'Home',
      nameKey: 'sidebar.home',
      icon: Home,
      href: '/dashboard',
      items: [],
    },

    // 2. CORE PROJECT MANAGEMENT (6 sub-pages)
    {
      id: 'projects',
      name: 'Projects',
      nameKey: 'sidebar.projects',
      icon: FolderKanban,
      href: '/dashboard/projects',
      items: [
        { name: 'All Projects', nameKey: 'sidebar.allProjects', href: '/dashboard/projects', icon: FolderKanban },
        { name: 'Issues', nameKey: 'sidebar.issues', href: '/dashboard/issues', icon: ListChecks },
        { name: 'Calendar', nameKey: 'sidebar.calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Timeline', nameKey: 'sidebar.timeline', href: '/dashboard/timeline', icon: Calendar },
        { name: 'Goals', nameKey: 'sidebar.goals', href: '/dashboard/goals', icon: Target },
        { name: 'Reports', nameKey: 'sidebar.reports', href: '/dashboard/reports', icon: BarChart3 },
      ],
    },

    // 3. TEAMS & MEMBERS
    {
      id: 'teams',
      name: 'Teams',
      nameKey: 'sidebar.teams',
      icon: Users,
      href: '/dashboard/teams',
      items: [
        { name: 'Members', nameKey: 'sidebar.members', href: '/dashboard/members', icon: UserPlus },
      ],
    },

    // 4. BUDGET (Top-level)
    {
      id: 'budget',
      name: 'Budget',
      nameKey: 'sidebar.budget',
      icon: DollarSign,
      href: '/dashboard/budget',
      items: [],
    },

    // 5. DEVELOPMENT (3 sub-pages) - For software/technical projects
    {
      id: 'development',
      name: 'Development',
      nameKey: 'sidebar.development',
      icon: GitBranch,
      href: '/dashboard/development',
      items: [
        { name: 'Backlog', nameKey: 'sidebar.backlog', href: '/dashboard/development/backlog', icon: ListChecks },
        { name: 'Releases', nameKey: 'sidebar.releases', href: '/dashboard/development/releases', icon: GitBranch },
        { name: 'Code Review', nameKey: 'sidebar.codeReview', href: '/dashboard/development/code', icon: FileText },
      ],
    },

    // 6. MARKETING (3 sub-pages) - For public relations & stakeholder engagement
    {
      id: 'marketing',
      name: 'Marketing',
      nameKey: 'sidebar.marketing',
      icon: TrendingUp,
      href: '/dashboard/marketing',
      items: [
        { name: 'Social Media', nameKey: 'sidebar.socialMedia', href: '/dashboard/marketing/social', icon: MessageSquare },
        { name: 'Analytics', nameKey: 'sidebar.analytics', href: '/dashboard/marketing/analytics', icon: TrendingUp },
        { name: 'Campaigns', nameKey: 'sidebar.campaigns', href: '/dashboard/marketing/campaigns', icon: Map },
      ],
    },

    // 7. OPERATIONS (3 sub-pages) - Critical for infrastructure projects
    {
      id: 'operations',
      name: 'Operations',
      nameKey: 'sidebar.operations',
      icon: Activity,
      href: '/dashboard/operations',
      items: [
        { name: 'Incidents', nameKey: 'sidebar.incidents', href: '/dashboard/operations/incidents', icon: AlertCircle },
        { name: 'Monitoring', nameKey: 'sidebar.monitoring', href: '/dashboard/operations/monitoring', icon: Activity },
        { name: 'Checklists', nameKey: 'sidebar.checklists', href: '/dashboard/operations/checklists', icon: CheckCircle2 },
        // M4 — facility operations (MEDICAL_MODULE_ARCHITECTURE.md, M8)
        { name: 'Facilities', nameKey: 'sidebar.facilities', href: '/dashboard/operations/facilities', icon: Building2 },
        { name: 'Equipment', nameKey: 'sidebar.equipment', href: '/dashboard/operations/equipment', icon: Wrench },
        { name: 'Safety Management', nameKey: 'sidebar.safety', href: '/dashboard/operations/safety', icon: ShieldCheck },
      ],
    },

    // 7b. MEDICAL (M3) — healthcare organizations only.
    //
    // Added in the same change that made its pages real, which is the rule
    // stated on NAVIGABLE_SECTION_IDS below. M3 built the pages and the API
    // and did NOT do this, so the registry shipped with no way to reach it
    // from the product — reachable only by typing the URL.
    //
    // Care work is deliberately a link INTO the issue board rather than its
    // own list: M7 decided care items are Tasks, so they inherit statuses,
    // sprints, assignment and reporting. A second board here would duplicate
    // that surface and drift from it.
    {
      id: 'medical',
      name: 'Medical',
      nameKey: 'sidebar.medical',
      icon: Stethoscope,
      href: '/dashboard/medical',
      items: [
        { name: 'Patients', nameKey: 'sidebar.patients', href: '/dashboard/patients', icon: Users },
        { name: 'Care work', nameKey: 'sidebar.careWork', href: '/dashboard/issues?department=medical', icon: ClipboardList },
      ],
    },

    // 8. RESEARCH & DATA (5 sub-pages) - For feasibility studies, surveys, inspections
    {
      id: 'research',
      name: 'Research',
      nameKey: 'sidebar.research',
      icon: FileSpreadsheet,
      href: '/dashboard/research',
      items: [
        { name: 'Data', nameKey: 'sidebar.data', href: '/dashboard/research/data', icon: FileSpreadsheet },
        { name: 'Findings', nameKey: 'sidebar.findings', href: '/dashboard/research/findings', icon: FileText },
        { name: 'Plans', nameKey: 'sidebar.plans', href: '/dashboard/research/plans', icon: Map },
        { name: 'Materials', nameKey: 'sidebar.materials', href: '/dashboard/research/materials', icon: FileSpreadsheet },
        { name: 'Inspections', nameKey: 'sidebar.inspections', href: '/dashboard/research/inspections', icon: CheckCircle2 },
      ],
    },

    // 9. KNOWLEDGE & AUTOMATION (4 sub-pages)
    {
      id: 'knowledge',
      name: 'Knowledge',
      nameKey: 'sidebar.knowledge',
      icon: BookOpen,
      href: '/dashboard/documents',
      items: [
        { name: 'AI Documents', nameKey: 'sidebar.aiDocuments', href: '/dashboard/documents', icon: Sparkles },
        { name: 'Automation', nameKey: 'sidebar.automation', href: '/dashboard/automations', icon: Zap },
        { name: 'Wiki', nameKey: 'sidebar.wiki', href: '/dashboard/wiki', icon: BookOpen },
        { name: 'Docs', nameKey: 'sidebar.docs', href: '/dashboard/docs', icon: BookOpen },
        { name: 'Integrations', nameKey: 'sidebar.integrations', href: '/dashboard/settings/integrations', icon: Puzzle },
      ],
    },
  ];

  // D9 fail posture: explicit settings win; without them, derive from the
  // org's industry preset; only with neither (legacy orgs) fail open so
  // navigation always works even if settings fail to load.
  const enabled = resolveEnabledSections(
    organizationSettings?.enabledSections,
    industry ?? organizationType
  );
  if (!enabled) {
    return allSections;
  }
  const enabledSet = new Set(enabled);

  // Filter sections and items based on organization settings
  return allSections
    .map((section) => {
      // Filter sub-items based on enabled sections
      const filteredItems = section.items.filter((item) => {
        const itemPath = item.href;

        // Check if the main section is enabled
        if (itemPath.includes('/teams')) {
          return enabledSet.has('teams');
        }
        if (itemPath.includes('/budget')) {
          return enabledSet.has('budget');
        }
        if (itemPath.includes('/goals')) {
          return enabledSet.has('goals');
        }
        if (itemPath.includes('/automations')) {
          return enabledSet.has('automations');
        }
        if (itemPath.includes('/documents')) {
          return enabledSet.has('documents');
        }
        if (itemPath.includes('/docs') || itemPath.includes('/wiki')) {
          return enabledSet.has('docs');
        }
        if (itemPath.includes('/issues')) {
          return enabledSet.has('issues');
        }
        if (itemPath.includes('/calendar')) {
          return enabledSet.has('calendar');
        }
        if (itemPath.includes('/timeline')) {
          return enabledSet.has('timeline');
        }
        if (itemPath.includes('/reports') || itemPath.includes('/analytics')) {
          return enabledSet.has('analytics');
        }

        // For sections that don't map to feature flags, show them all
        return true;
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => {
      // Filter top-level sections based on enabled feature flags
      if (section.id === 'teams') {
        return enabledSet.has('teams');
      }
      if (section.id === 'budget') {
        return enabledSet.has('budget');
      }
      // Department sections are industry-gated (D6) — same rule as the rest.
      // 'medical' belongs here and nowhere else: without it the section falls
      // through to the "has an href" branch below and every organization —
      // ministry, school, contractor — gets a Patients link.
      if (
        section.id === 'development' ||
        section.id === 'marketing' ||
        section.id === 'operations' ||
        section.id === 'research' ||
        section.id === 'medical'
      ) {
        return enabledSet.has(section.id);
      }

      // Remove sections that have no items and no direct href
      // Or keep sections that have either a href or at least one item
      return section.href || section.items.length > 0;
    });
}

/**
 * Check if a navigation item should be visible for this organization type
 */
export function isNavigationItemVisible(
  itemId: string,
  organizationType?: string | null
): boolean {
  const navigation = getNavigationForType(organizationType);
  return navigation.some(item => item.id === itemId);
}
