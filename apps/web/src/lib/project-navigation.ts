/**
 * Project Navigation Configuration
 * Returns navigation items based on project type
 */

import {
  BarChart3,
  Code,
  FileText,
  Book,
  Clock,
  ListChecks,
  FolderKanban,
  Users,
  Target,
  TrendingUp,
  Calendar,
  Megaphone,
  Settings,
  FileSpreadsheet,
  Zap,
  AlertCircle,
  CheckCircle2,
  Activity,
  DollarSign,
  Sparkles,
  Map,
  Filter,
  GitBranch,
  MessageSquare,
  type LucideIcon
} from 'lucide-react';

export type ProjectType =
  | 'SOFTWARE'
  | 'BUSINESS'
  | 'MARKETING'
  | 'OPERATIONS'
  | 'RESEARCH'
  | 'CONSTRUCTION'
  | 'CUSTOM';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon | null;
  href: string;
}

/**
 * Get navigation items for a specific project type
 * Comprehensive navigation for enterprise-grade project management
 */
export function getProjectNavigation(projectType: ProjectType = 'BUSINESS'): NavItem[] {
  const navigationByType: Record<ProjectType, NavItem[]> = {
    // SOFTWARE DEVELOPMENT PROJECTS
    SOFTWARE: [
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'backlog', label: 'Backlog', icon: ListChecks, href: '/dashboard/issues/backlog' },
      { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
      { id: 'releases', label: 'Releases', icon: GitBranch, href: '/dashboard/issues/releases' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/issues/reports' },
      { id: 'automation', label: 'Automation', icon: Zap, href: '/dashboard/issues/automation' },
      { id: 'docs', label: 'Docs', icon: Book, href: '/dashboard/issues/docs' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // BUSINESS PROJECTS
    BUSINESS: [
      { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
      { id: 'list', label: 'List', icon: ListChecks, href: '/dashboard/issues/list' },
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/dashboard/issues/calendar' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'budget', label: 'Budget', icon: DollarSign, href: '/dashboard/issues/budget' },
      { id: 'documents', label: 'Documents', icon: Sparkles, href: '/dashboard/issues/documents' },
      { id: 'automation', label: 'Automation', icon: Zap, href: '/dashboard/issues/automation' },
      { id: 'wiki', label: 'Wiki', icon: Book, href: '/dashboard/issues/wiki' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // MARKETING PROJECTS
    MARKETING: [
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/dashboard/issues/campaigns' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/dashboard/issues/calendar' },
      { id: 'content', label: 'Content', icon: FileText, href: '/dashboard/issues/content' },
      { id: 'social', label: 'Social', icon: MessageSquare, href: '/dashboard/issues/social' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/dashboard/issues/analytics' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'budget', label: 'Budget', icon: DollarSign, href: '/dashboard/issues/budget' },
      { id: 'documents', label: 'Assets', icon: Sparkles, href: '/dashboard/issues/documents' },
      { id: 'automation', label: 'Automation', icon: Zap, href: '/dashboard/issues/automation' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // OPERATIONS & INFRASTRUCTURE
    OPERATIONS: [
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'incidents', label: 'Incidents', icon: AlertCircle, href: '/dashboard/issues/incidents' },
      { id: 'monitoring', label: 'Monitoring', icon: Activity, href: '/dashboard/issues/monitoring' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'checklist', label: 'Checklists', icon: CheckCircle2, href: '/dashboard/issues/checklists' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'SLAs', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/issues/reports' },
      { id: 'automation', label: 'Automation', icon: Zap, href: '/dashboard/issues/automation' },
      { id: 'docs', label: 'Runbooks', icon: Book, href: '/dashboard/issues/docs' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // RESEARCH PROJECTS
    RESEARCH: [
      { id: 'projects', label: 'Projects', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'data', label: 'Data', icon: FileSpreadsheet, href: '/dashboard/issues/data' },
      { id: 'findings', label: 'Findings', icon: FileText, href: '/dashboard/issues/findings' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'Objectives', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'budget', label: 'Budget', icon: DollarSign, href: '/dashboard/issues/budget' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/issues/reports' },
      { id: 'documents', label: 'Documents', icon: Sparkles, href: '/dashboard/issues/documents' },
      { id: 'wiki', label: 'Knowledge', icon: Book, href: '/dashboard/issues/wiki' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // CONSTRUCTION & ENGINEERING
    CONSTRUCTION: [
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'plans', label: 'Plans', icon: Map, href: '/dashboard/issues/plans' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'budget', label: 'Budget', icon: DollarSign, href: '/dashboard/issues/budget' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'materials', label: 'Materials', icon: FileSpreadsheet, href: '/dashboard/issues/materials' },
      { id: 'inspections', label: 'Inspections', icon: CheckCircle2, href: '/dashboard/issues/inspections' },
      { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/issues/reports' },
      { id: 'documents', label: 'Documents', icon: Sparkles, href: '/dashboard/issues/documents' },
      { id: 'wiki', label: 'Specs', icon: Book, href: '/dashboard/issues/wiki' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],

    // CUSTOM PROJECTS
    CUSTOM: [
      { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
      { id: 'list', label: 'List', icon: ListChecks, href: '/dashboard/issues/list' },
      { id: 'board', label: 'Board', icon: FolderKanban, href: '/dashboard/issues' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/dashboard/issues/calendar' },
      { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
      { id: 'team', label: 'Team', icon: Users, href: '/dashboard/issues/team' },
      { id: 'goals', label: 'Goals', icon: Target, href: '/dashboard/issues/goals' },
      { id: 'budget', label: 'Budget', icon: DollarSign, href: '/dashboard/issues/budget' },
      { id: 'documents', label: 'Documents', icon: Sparkles, href: '/dashboard/issues/documents' },
      { id: 'automation', label: 'Automation', icon: Zap, href: '/dashboard/issues/automation' },
      { id: 'wiki', label: 'Wiki', icon: Book, href: '/dashboard/issues/wiki' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/issues/settings' },
    ],
  };

  return navigationByType[projectType] || navigationByType.BUSINESS;
}

/**
 * Split navigation into mobile (first 4) and more menu (rest)
 * Show 4 visible items on mobile for better UX
 */
export function splitNavigationForMobile(navItems: NavItem[]) {
  return {
    visible: navItems.slice(0, 4),
    more: navItems.slice(4),
  };
}

/**
 * Get navigation categories for organizing the More menu
 * Groups navigation items into logical categories
 */
export interface NavCategory {
  label: string;
  items: NavItem[];
}

export function categorizeNavigation(navItems: NavItem[], projectType: ProjectType): NavCategory[] {
  // Define which items belong to which category
  const coreItems = ['board', 'list', 'backlog', 'campaigns', 'projects'];
  const planningItems = ['calendar', 'timeline', 'goals', 'plans'];
  const teamItems = ['team', 'budget', 'materials'];
  const insightsItems = ['reports', 'analytics', 'monitoring', 'data'];
  const contentItems = ['docs', 'wiki', 'content', 'findings', 'documents', 'code'];
  const toolsItems = ['automation', 'social', 'incidents', 'checklist', 'inspections', 'releases'];
  const adminItems = ['settings'];

  const categories: NavCategory[] = [];

  // Core Work
  const core = navItems.filter(item => coreItems.includes(item.id));
  if (core.length > 0) {
    categories.push({ label: 'Work', items: core });
  }

  // Planning
  const planning = navItems.filter(item => planningItems.includes(item.id));
  if (planning.length > 0) {
    categories.push({ label: 'Planning', items: planning });
  }

  // Team & Resources
  const team = navItems.filter(item => teamItems.includes(item.id));
  if (team.length > 0) {
    categories.push({ label: 'Resources', items: team });
  }

  // Insights & Reports
  const insights = navItems.filter(item => insightsItems.includes(item.id));
  if (insights.length > 0) {
    categories.push({ label: 'Insights', items: insights });
  }

  // Content & Knowledge
  const content = navItems.filter(item => contentItems.includes(item.id));
  if (content.length > 0) {
    categories.push({ label: 'Knowledge', items: content });
  }

  // Tools & Automation
  const tools = navItems.filter(item => toolsItems.includes(item.id));
  if (tools.length > 0) {
    categories.push({ label: 'Tools', items: tools });
  }

  // Settings
  const admin = navItems.filter(item => adminItems.includes(item.id));
  if (admin.length > 0) {
    categories.push({ label: 'Admin', items: admin });
  }

  return categories;
}
