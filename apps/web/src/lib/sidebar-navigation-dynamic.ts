/**
 * Dynamic Sidebar Navigation
 *
 * Comprehensive sidebar with 21+ pages organized into collapsible categories
 * Includes all project management tools needed for Ministry projects (water dam, irrigation, etc.)
 * Now integrated with organization settings and feature flags
 */

import { getNavigationForType } from '@/config/organization-types';
import type { OrganizationSettings } from '@/types/organization-settings';
import {
  Home,
  FolderKanban,
  ListChecks,
  Calendar,
  Users,
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
  type LucideIcon,
} from 'lucide-react';

export interface SidebarSubItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarSection {
  id: string;
  name: string;
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
  organizationSettings?: OrganizationSettings
): SidebarSection[] {
  // Build comprehensive 7-category structure with 21+ pages
  const allSections: SidebarSection[] = [
    // 1. HOME (No collapse - single item)
    {
      id: 'home',
      name: 'Home',
      icon: Home,
      href: '/dashboard',
      items: [],
    },

    // 2. CORE PROJECT MANAGEMENT (8 sub-pages)
    {
      id: 'projects',
      name: 'Projects',
      icon: FolderKanban,
      href: '/dashboard/projects',
      items: [
        { name: 'All Projects', href: '/dashboard/projects', icon: FolderKanban },
        { name: 'Issues', href: '/dashboard/issues', icon: ListChecks },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Timeline', href: '/dashboard/timeline', icon: Calendar },
        { name: 'Team', href: '/dashboard/teams', icon: Users },
        { name: 'Goals', href: '/dashboard/goals', icon: Target },
        { name: 'Budget', href: '/dashboard/budget', icon: DollarSign },
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
      ],
    },

    // 3. DEVELOPMENT (3 sub-pages) - For software/technical projects
    {
      id: 'development',
      name: 'Development',
      icon: GitBranch,
      href: '/dashboard/development',
      items: [
        { name: 'Backlog', href: '/dashboard/development/backlog', icon: ListChecks },
        { name: 'Releases', href: '/dashboard/development/releases', icon: GitBranch },
        { name: 'Code Review', href: '/dashboard/development/code', icon: FileText },
      ],
    },

    // 4. MARKETING (3 sub-pages) - For public relations & stakeholder engagement
    {
      id: 'marketing',
      name: 'Marketing',
      icon: TrendingUp,
      href: '/dashboard/marketing',
      items: [
        { name: 'Social Media', href: '/dashboard/marketing/social', icon: MessageSquare },
        { name: 'Analytics', href: '/dashboard/marketing/analytics', icon: TrendingUp },
        { name: 'Campaigns', href: '/dashboard/marketing/campaigns', icon: Map },
      ],
    },

    // 5. OPERATIONS (3 sub-pages) - Critical for infrastructure projects
    {
      id: 'operations',
      name: 'Operations',
      icon: Activity,
      href: '/dashboard/operations',
      items: [
        { name: 'Incidents', href: '/dashboard/operations/incidents', icon: AlertCircle },
        { name: 'Monitoring', href: '/dashboard/operations/monitoring', icon: Activity },
        { name: 'Checklists', href: '/dashboard/operations/checklists', icon: CheckCircle2 },
      ],
    },

    // 6. RESEARCH & DATA (5 sub-pages) - For feasibility studies, surveys, inspections
    {
      id: 'research',
      name: 'Research',
      icon: FileSpreadsheet,
      href: '/dashboard/research',
      items: [
        { name: 'Data', href: '/dashboard/research/data', icon: FileSpreadsheet },
        { name: 'Findings', href: '/dashboard/research/findings', icon: FileText },
        { name: 'Plans', href: '/dashboard/research/plans', icon: Map },
        { name: 'Materials', href: '/dashboard/research/materials', icon: FileSpreadsheet },
        { name: 'Inspections', href: '/dashboard/research/inspections', icon: CheckCircle2 },
      ],
    },

    // 7. KNOWLEDGE & AUTOMATION (4 sub-pages)
    {
      id: 'knowledge',
      name: 'Knowledge',
      icon: BookOpen,
      href: '/dashboard/documents',
      items: [
        { name: 'AI Documents', href: '/dashboard/documents', icon: Sparkles },
        { name: 'Automation', href: '/dashboard/automations', icon: Zap },
        { name: 'Wiki', href: '/dashboard/wiki', icon: BookOpen },
        { name: 'Docs', href: '/dashboard/docs', icon: BookOpen },
      ],
    },
  ];

  // If no organization settings OR no enabled sections, return all sections
  // This ensures navigation always works even if settings fail to load
  if (!organizationSettings || !organizationSettings.enabledSections || organizationSettings.enabledSections.length === 0) {
    return allSections;
  }

  // Filter sections and items based on organization settings
  return allSections
    .map((section) => {
      // Filter sub-items based on enabled sections
      const filteredItems = section.items.filter((item) => {
        const itemPath = item.href;

        // Check if the main section is enabled
        if (itemPath.includes('/teams')) {
          return organizationSettings.enabledSections.includes('teams');
        }
        if (itemPath.includes('/budget')) {
          return organizationSettings.enabledSections.includes('budget');
        }
        if (itemPath.includes('/goals')) {
          return organizationSettings.enabledSections.includes('goals');
        }
        if (itemPath.includes('/automations')) {
          return organizationSettings.enabledSections.includes('automations');
        }
        if (itemPath.includes('/documents')) {
          return organizationSettings.enabledSections.includes('documents');
        }
        if (itemPath.includes('/docs') || itemPath.includes('/wiki')) {
          return organizationSettings.enabledSections.includes('docs');
        }
        if (itemPath.includes('/issues')) {
          return organizationSettings.enabledSections.includes('issues');
        }
        if (itemPath.includes('/calendar')) {
          return organizationSettings.enabledSections.includes('calendar');
        }
        if (itemPath.includes('/timeline')) {
          return organizationSettings.enabledSections.includes('timeline');
        }
        if (itemPath.includes('/reports') || itemPath.includes('/analytics')) {
          return organizationSettings.enabledSections.includes('analytics');
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
