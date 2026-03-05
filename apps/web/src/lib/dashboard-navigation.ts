/**
 * Dashboard Section Navigation Configuration
 * Defines navigation items for each dashboard section (Teams, Budget, Goals, etc.)
 */

import {
  Users,
  Target,
  DollarSign,
  Sparkles,
  Zap,
  BookOpen,
  BarChart3,
  List,
  FolderKanban,
  Calendar,
  Clock,
  Settings,
  UserPlus,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  FileText,
  Activity,
  type LucideIcon
} from 'lucide-react';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: LucideIcon | null;
  href: string;
}

export type DashboardSection = 'teams' | 'budget' | 'goals' | 'automations' | 'documents' | 'docs';

/**
 * Get navigation items for a specific dashboard section
 */
export function getDashboardNavigation(section: DashboardSection): DashboardNavItem[] {
  const navigationBySection: Record<DashboardSection, DashboardNavItem[]> = {
    // TEAMS SECTION
    teams: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/teams' },
      { id: 'members', label: 'Members', icon: Users, href: '/dashboard/teams/list' },
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/teams/board' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/dashboard/teams/goals' },
      { id: 'activity', label: 'Activity', icon: Activity, href: '/dashboard/teams/activity' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/teams/settings' },
    ],

    // BUDGET SECTION
    budget: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/budget' },
      { id: 'expenses', label: 'Expenses', icon: DollarSign, href: '/dashboard/budget/expenses' },
      { id: 'income', label: 'Income', icon: TrendingUp, href: '/dashboard/budget/income' },
      { id: 'reports', label: 'Reports', icon: FileSpreadsheet, href: '/dashboard/budget/reports' },
      { id: 'forecasting', label: 'Forecasting', icon: PieChart, href: '/dashboard/budget/forecasting' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/budget/settings' },
    ],

    // GOALS SECTION
    goals: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/goals' },
      { id: 'active', label: 'Active', icon: Target, href: '/dashboard/goals/active' },
      { id: 'completed', label: 'Completed', icon: Target, href: '/dashboard/goals/completed' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
      { id: 'teams', label: 'Teams', icon: Users, href: '/dashboard/goals/teams' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/goals/settings' },
    ],

    // AUTOMATIONS SECTION
    automations: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/automations' },
      { id: 'workflows', label: 'Workflows', icon: Zap, href: '/dashboard/automations/workflows' },
      { id: 'triggers', label: 'Triggers', icon: Activity, href: '/dashboard/automations/triggers' },
      { id: 'history', label: 'History', icon: Clock, href: '/dashboard/automations/history' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/automations/settings' },
    ],

    // DOCUMENTS SECTION (AI Documents)
    documents: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/documents' },
      { id: 'all', label: 'All Documents', icon: Sparkles, href: '/dashboard/documents/all' },
      { id: 'recent', label: 'Recent', icon: Clock, href: '/dashboard/documents/recent' },
      { id: 'shared', label: 'Shared', icon: Users, href: '/dashboard/documents/shared' },
      { id: 'templates', label: 'Templates', icon: FileText, href: '/dashboard/documents/templates' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/documents/settings' },
    ],

    // DOCS & WIKI SECTION
    docs: [
      { id: 'overview', label: 'Overview', icon: BarChart3, href: '/dashboard/docs' },
      { id: 'wiki', label: 'Wiki', icon: BookOpen, href: '/dashboard/docs/wiki' },
      { id: 'pages', label: 'Pages', icon: FileText, href: '/dashboard/docs/pages' },
      { id: 'recent', label: 'Recent', icon: Clock, href: '/dashboard/docs/recent' },
      { id: 'search', label: 'Search', icon: null, href: '/dashboard/docs/search' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/docs/settings' },
    ],
  };

  return navigationBySection[section] || [];
}

/**
 * Split navigation into mobile (first 4) and more menu (rest)
 */
export function splitDashboardNavigationForMobile(navItems: DashboardNavItem[]) {
  return {
    visible: navItems.slice(0, 4),
    more: navItems.slice(4),
  };
}

/**
 * Get section title and icon
 */
export function getSectionInfo(section: DashboardSection): { title: string; icon: LucideIcon; color: string } {
  const sectionInfo: Record<DashboardSection, { title: string; icon: LucideIcon; color: string }> = {
    teams: { title: 'Teams', icon: Users, color: '#10B981' },
    budget: { title: 'Budget', icon: DollarSign, color: '#F59E0B' },
    goals: { title: 'Goals', icon: Target, color: '#8B5CF6' },
    automations: { title: 'Automations', icon: Zap, color: '#EC4899' },
    documents: { title: 'AI Documents', icon: Sparkles, color: '#3B82F6' },
    docs: { title: 'Docs & Wiki', icon: BookOpen, color: '#06B6D4' },
  };

  return sectionInfo[section] || { title: 'Dashboard', icon: BarChart3, color: '#0065FF' };
}
