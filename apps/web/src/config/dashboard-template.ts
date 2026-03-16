/**
 * Dashboard Template Configuration
 *
 * Defines the foundational dashboard structure that all projects inherit.
 * Instead of building dashboards per-project, every project gets the full
 * suite of department pages, controls, AI insights, and navigation automatically.
 */

import {
  GitBranch,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  BookOpen,
  ListChecks,
  FileText,
  MessageSquare,
  Map,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { TabDefinition } from '@/components/navigation/unified-page-header';

export interface DepartmentConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  category: 'development' | 'marketing' | 'operations' | 'research' | 'knowledge';
  defaultLabels: string[];
  tabs: TabDefinition[];
  pages: DepartmentPage[];
}

export interface DepartmentPage {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  path: string;
  defaultLabels: string[];
  emptyMessage: string;
}

/**
 * The foundational dashboard template.
 * Every project gets all these departments automatically.
 */
export const DASHBOARD_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Track development tasks, backlog, and releases',
    icon: GitBranch,
    iconColor: '#6366F1',
    category: 'development',
    defaultLabels: ['development'],
    tabs: [
      { id: 'backlog', label: 'Backlog', icon: ListChecks, href: '/backlog' },
      { id: 'releases', label: 'Releases', icon: GitBranch, href: '/releases' },
      { id: 'code', label: 'Code Review', icon: FileText, href: '/code' },
    ],
    pages: [
      {
        id: 'backlog',
        name: 'Backlog',
        description: 'Manage and prioritize the development backlog',
        icon: ListChecks,
        iconColor: '#6366F1',
        path: 'backlog',
        defaultLabels: ['development', 'backlog'],
        emptyMessage: 'No backlog items yet. Create one to get started.',
      },
      {
        id: 'releases',
        name: 'Releases',
        description: 'Track and plan software releases and deployments',
        icon: GitBranch,
        iconColor: '#8B5CF6',
        path: 'releases',
        defaultLabels: ['development', 'release'],
        emptyMessage: 'No releases planned yet. Create one to start tracking.',
      },
      {
        id: 'code',
        name: 'Code Review',
        description: 'Manage code reviews and pull requests',
        icon: FileText,
        iconColor: '#EC4899',
        path: 'code',
        defaultLabels: ['development', 'code-review'],
        emptyMessage: 'No code reviews pending. Create one to start reviewing.',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Manage marketing campaigns, social media, and analytics',
    icon: TrendingUp,
    iconColor: '#F97316',
    category: 'marketing',
    defaultLabels: ['marketing'],
    tabs: [
      { id: 'social', label: 'Social Media', icon: MessageSquare, href: '/social' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
      { id: 'campaigns', label: 'Campaigns', icon: Map, href: '/campaigns' },
    ],
    pages: [
      {
        id: 'social',
        name: 'Social Media',
        description: 'Plan and schedule social media content',
        icon: MessageSquare,
        iconColor: '#3B82F6',
        path: 'social',
        defaultLabels: ['marketing', 'social'],
        emptyMessage: 'No social media tasks yet. Create one to start planning.',
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Track marketing metrics and performance',
        icon: TrendingUp,
        iconColor: '#10B981',
        path: 'analytics',
        defaultLabels: ['marketing', 'analytics'],
        emptyMessage: 'No analytics tasks yet. Create one to start tracking.',
      },
      {
        id: 'campaigns',
        name: 'Campaigns',
        description: 'Plan and manage marketing campaigns',
        icon: Map,
        iconColor: '#F59E0B',
        path: 'campaigns',
        defaultLabels: ['marketing', 'campaign'],
        emptyMessage: 'No campaigns yet. Create one to get started.',
      },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Monitor operations, manage incidents, and track checklists',
    icon: Activity,
    iconColor: '#EF4444',
    category: 'operations',
    defaultLabels: ['operations'],
    tabs: [
      { id: 'incidents', label: 'Incidents', icon: AlertCircle, href: '/incidents' },
      { id: 'monitoring', label: 'Monitoring', icon: Activity, href: '/monitoring' },
      { id: 'checklists', label: 'Checklists', icon: CheckCircle2, href: '/checklists' },
    ],
    pages: [
      {
        id: 'incidents',
        name: 'Incidents',
        description: 'Track and resolve operational incidents',
        icon: AlertCircle,
        iconColor: '#EF4444',
        path: 'incidents',
        defaultLabels: ['operations', 'incident'],
        emptyMessage: 'No incidents reported. Create one to start tracking.',
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        description: 'Monitor system health and performance metrics',
        icon: Activity,
        iconColor: '#10B981',
        path: 'monitoring',
        defaultLabels: ['operations', 'monitoring'],
        emptyMessage: 'No monitoring tasks yet. Create one to start tracking.',
      },
      {
        id: 'checklists',
        name: 'Checklists',
        description: 'Manage operational checklists and procedures',
        icon: CheckCircle2,
        iconColor: '#6366F1',
        path: 'checklists',
        defaultLabels: ['operations', 'checklist'],
        emptyMessage: 'No checklists yet. Create one to standardize procedures.',
      },
    ],
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Manage research data, findings, and inspections',
    icon: FileSpreadsheet,
    iconColor: '#8B5CF6',
    category: 'research',
    defaultLabels: ['research'],
    tabs: [
      { id: 'data', label: 'Data', icon: FileSpreadsheet, href: '/data' },
      { id: 'findings', label: 'Findings', icon: FileText, href: '/findings' },
      { id: 'plans', label: 'Plans', icon: Map, href: '/plans' },
      { id: 'materials', label: 'Materials', icon: FileSpreadsheet, href: '/materials' },
      { id: 'inspections', label: 'Inspections', icon: CheckCircle2, href: '/inspections' },
    ],
    pages: [
      {
        id: 'data',
        name: 'Data',
        description: 'Collect and manage research data for feasibility studies',
        icon: FileSpreadsheet,
        iconColor: '#8B5CF6',
        path: 'data',
        defaultLabels: ['research', 'data'],
        emptyMessage: 'No data tasks yet. Create one to start collecting.',
      },
      {
        id: 'findings',
        name: 'Findings',
        description: 'Document research findings and insights',
        icon: FileText,
        iconColor: '#3B82F6',
        path: 'findings',
        defaultLabels: ['research', 'findings'],
        emptyMessage: 'No findings yet. Create one to document insights.',
      },
      {
        id: 'plans',
        name: 'Plans',
        description: 'Develop and track research plans and methodologies',
        icon: Map,
        iconColor: '#10B981',
        path: 'plans',
        defaultLabels: ['research', 'plan'],
        emptyMessage: 'No research plans yet. Create one to get started.',
      },
      {
        id: 'materials',
        name: 'Materials',
        description: 'Manage research materials and resources',
        icon: FileSpreadsheet,
        iconColor: '#F59E0B',
        path: 'materials',
        defaultLabels: ['research', 'materials'],
        emptyMessage: 'No materials tracked yet. Create one to manage resources.',
      },
      {
        id: 'inspections',
        name: 'Inspections',
        description: 'Schedule and track site inspections and surveys',
        icon: CheckCircle2,
        iconColor: '#EF4444',
        path: 'inspections',
        defaultLabels: ['research', 'inspection'],
        emptyMessage: 'No inspections scheduled. Create one to start tracking.',
      },
    ],
  },
];

/**
 * Get department config by ID
 */
export function getDepartmentById(departmentId: string): DepartmentConfig | undefined {
  return DASHBOARD_DEPARTMENTS.find((d) => d.id === departmentId);
}

/**
 * Get a specific page within a department
 */
export function getDepartmentPage(departmentId: string, pageId: string): DepartmentPage | undefined {
  const dept = getDepartmentById(departmentId);
  return dept?.pages.find((p) => p.id === pageId || p.path === pageId);
}

/**
 * Get all departments available for a given organization type
 */
export function getDepartmentsForOrgType(orgType?: string | null): DepartmentConfig[] {
  // All org types get all departments by default
  // Specific org types can customize via organization settings (enabledSections)
  return DASHBOARD_DEPARTMENTS;
}

/**
 * Get the department that a path belongs to
 */
export function getDepartmentForPath(path: string): { department: DepartmentConfig; page?: DepartmentPage } | null {
  for (const dept of DASHBOARD_DEPARTMENTS) {
    if (path === dept.id) {
      return { department: dept };
    }
    for (const page of dept.pages) {
      if (path === `${dept.id}/${page.path}`) {
        return { department: dept, page };
      }
    }
  }
  return null;
}
