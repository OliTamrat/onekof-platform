/**
 * Dynamic Sidebar Navigation
 *
 * Comprehensive sidebar with 21+ pages organized into collapsible categories
 * Includes all project management tools needed for Ministry projects (water dam, irrigation, etc.)
 */

import { getNavigationForType } from '@/config/organization-types';
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
 */
export function getSidebarNavigation(organizationType?: string | null): SidebarSection[] {
  // Return comprehensive 7-category structure with 21+ pages
  return [
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
