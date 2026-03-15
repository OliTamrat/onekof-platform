/**
 * Collapsible Sidebar Navigation Structure
 * 7 Core Categories with Sub-pages
 */

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
  href?: string; // Main page for this section
  items: SidebarSubItem[];
}

/**
 * 7 Core Collapsible Sections
 */
export const sidebarNavigation: SidebarSection[] = [
  // 1. HOME (No collapse - single item)
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    href: '/dashboard',
    items: [],
  },

  // 2. CORE PROJECT MANAGEMENT
  {
    id: 'projects',
    name: 'Projects',
    icon: FolderKanban,
    href: '/dashboard/projects',
    items: [
      { name: 'All Projects', href: '/dashboard/projects', icon: FolderKanban },
      { name: 'Issues', href: '/dashboard/issues', icon: ListChecks },
      { name: 'Calendar', href: '/dashboard/issues/calendar', icon: Calendar },
      { name: 'Timeline', href: '/dashboard/issues/timeline', icon: Calendar },
      { name: 'Team', href: '/dashboard/issues/team', icon: Users },
      { name: 'Goals', href: '/dashboard/issues/goals', icon: Target },
      { name: 'Budget', href: '/dashboard/issues/budget', icon: DollarSign },
      { name: 'Reports', href: '/dashboard/issues/reports', icon: BarChart3 },
    ],
  },

  // 3. DEVELOPMENT
  {
    id: 'development',
    name: 'Development',
    icon: GitBranch,
    href: '/dashboard/issues/backlog',
    items: [
      { name: 'Backlog', href: '/dashboard/issues/backlog', icon: ListChecks },
      { name: 'Releases', href: '/dashboard/issues/releases', icon: GitBranch },
      { name: 'Code Review', href: '/dashboard/issues/code', icon: FileText },
    ],
  },

  // 4. MARKETING
  {
    id: 'marketing',
    name: 'Marketing',
    icon: TrendingUp,
    href: '/dashboard/issues/social',
    items: [
      { name: 'Social Media', href: '/dashboard/issues/social', icon: MessageSquare },
      { name: 'Analytics', href: '/dashboard/issues/analytics', icon: TrendingUp },
      { name: 'Campaigns', href: '/dashboard/issues/plans', icon: Map },
    ],
  },

  // 5. OPERATIONS
  {
    id: 'operations',
    name: 'Operations',
    icon: Activity,
    href: '/dashboard/issues/monitoring',
    items: [
      { name: 'Incidents', href: '/dashboard/issues/incidents', icon: AlertCircle },
      { name: 'Monitoring', href: '/dashboard/issues/monitoring', icon: Activity },
      { name: 'Checklists', href: '/dashboard/issues/checklists', icon: CheckCircle2 },
    ],
  },

  // 6. RESEARCH & DATA
  {
    id: 'research',
    name: 'Research',
    icon: FileSpreadsheet,
    href: '/dashboard/issues/data',
    items: [
      { name: 'Data', href: '/dashboard/issues/data', icon: FileSpreadsheet },
      { name: 'Findings', href: '/dashboard/issues/findings', icon: FileText },
      { name: 'Plans', href: '/dashboard/issues/plans', icon: Map },
      { name: 'Materials', href: '/dashboard/issues/materials', icon: FileSpreadsheet },
      { name: 'Inspections', href: '/dashboard/issues/inspections', icon: CheckCircle2 },
    ],
  },

  // 7. KNOWLEDGE & AUTOMATION
  {
    id: 'knowledge',
    name: 'Knowledge',
    icon: BookOpen,
    href: '/dashboard/documents',
    items: [
      { name: 'AI Documents', href: '/dashboard/documents', icon: Sparkles },
      { name: 'Automation', href: '/dashboard/issues/automation', icon: Zap },
      { name: 'Wiki', href: '/dashboard/issues/wiki', icon: BookOpen },
      { name: 'Docs', href: '/dashboard/docs', icon: BookOpen },
    ],
  },

  // TEAMS (Standalone)
  {
    id: 'teams',
    name: 'Teams',
    icon: Users,
    href: '/dashboard/teams',
    items: [],
  },
];

/**
 * Quick Links (always visible at bottom)
 */
export const quickLinks = [
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Target },
];
