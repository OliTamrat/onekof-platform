/**
 * Organization Type Configurations
 *
 * Defines features, navigation, and dashboard widgets for each organization type.
 * This enables customized experiences based on the sector/industry.
 */

import {
  Home,
  FolderKanban,
  ListChecks,
  Users,
  Target,
  BarChart3,
  DollarSign,
  FileText,
  Sparkles,
  Zap,
  BookOpen,
  ShoppingCart,
  Shield,
  Calendar,
  Heart,
  TrendingUp,
  Building2,
  GraduationCap,
  Construction,
  Activity,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';

export interface OrganizationTypeConfig {
  id: string;
  name: string;
  features: {
    budget: boolean;
    procurement: boolean;
    compliance: boolean;
    ethiopianCalendar: boolean;
    grants: boolean;
    agile: boolean;
    timeTracking?: boolean;
    courses?: boolean;
    research?: boolean;
    siteManagement?: boolean;
    equipment?: boolean;
    facilities?: boolean;
    medical?: boolean;
  };
  navigation: {
    id: string;
    name: string;
    href: string;
    icon: LucideIcon;
    priority: number; // Lower number = higher priority
  }[];
  dashboardWidgets: string[];
}

export const ORGANIZATION_TYPE_CONFIGS: Record<string, OrganizationTypeConfig> = {
  government: {
    id: 'government',
    name: 'Government Ministry',
    features: {
      budget: true,
      procurement: true,
      compliance: true,
      ethiopianCalendar: true,
      grants: false,
      agile: false,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'budget', name: 'Budget', href: '/dashboard/budget', icon: DollarSign, priority: 2 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 3 },
      { id: 'procurement', name: 'Procurement', href: '/dashboard/procurement', icon: ShoppingCart, priority: 4 },
      { id: 'compliance', name: 'Compliance', href: '/dashboard/compliance', icon: Shield, priority: 5 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 6 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 7 },
      { id: 'goals', name: 'Goals', href: '/dashboard/goals', icon: Target, priority: 8 },
      { id: 'reports', name: 'Reports', href: '/dashboard/reports', icon: BarChart3, priority: 9 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 10 },
      { id: 'docs', name: 'Wiki', href: '/dashboard/docs', icon: BookOpen, priority: 11 },
    ],
    dashboardWidgets: [
      'budget-overview',
      'procurement-status',
      'compliance-checklist',
      'project-timeline',
      'team-activity',
    ],
  },

  private: {
    id: 'private',
    name: 'Private Company',
    features: {
      budget: false,
      procurement: false,
      compliance: false,
      ethiopianCalendar: false,
      grants: false,
      agile: true,
      timeTracking: true,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 2 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 3 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 4 },
      { id: 'goals', name: 'Goals', href: '/dashboard/goals', icon: Target, priority: 5 },
      { id: 'automations', name: 'Automation', href: '/dashboard/automations', icon: Zap, priority: 6 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 7 },
      { id: 'reports', name: 'Reports', href: '/dashboard/reports', icon: BarChart3, priority: 8 },
      { id: 'docs', name: 'Wiki', href: '/dashboard/docs', icon: BookOpen, priority: 9 },
    ],
    dashboardWidgets: [
      'sprint-overview',
      'velocity-chart',
      'issue-burndown',
      'team-capacity',
      'time-reports',
    ],
  },

  ngo: {
    id: 'ngo',
    name: 'NGO/INGO',
    features: {
      budget: true,
      procurement: false,
      compliance: true,
      ethiopianCalendar: true,
      grants: true,
      agile: false,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'grants', name: 'Grants', href: '/dashboard/grants', icon: Heart, priority: 2 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 3 },
      { id: 'impact', name: 'Impact', href: '/dashboard/impact', icon: TrendingUp, priority: 4 },
      { id: 'budget', name: 'Budget', href: '/dashboard/budget', icon: DollarSign, priority: 5 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 6 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 7 },
      { id: 'reports', name: 'Reports', href: '/dashboard/reports', icon: BarChart3, priority: 8 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 9 },
      { id: 'docs', name: 'Wiki', href: '/dashboard/docs', icon: BookOpen, priority: 10 },
    ],
    dashboardWidgets: [
      'grant-overview',
      'impact-metrics',
      'donor-reports',
      'budget-utilization',
      'project-outcomes',
    ],
  },

  education: {
    id: 'education',
    name: 'Educational Institution',
    features: {
      budget: false,
      procurement: false,
      compliance: false,
      ethiopianCalendar: true,
      grants: false,
      agile: false,
      courses: true,
      research: true,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'courses', name: 'Courses', href: '/dashboard/courses', icon: GraduationCap, priority: 2 },
      { id: 'research', name: 'Research', href: '/dashboard/research', icon: BookOpen, priority: 3 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 4 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 5 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 6 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 7 },
      { id: 'docs', name: 'Wiki', href: '/dashboard/docs', icon: BookOpen, priority: 8 },
    ],
    dashboardWidgets: [
      'course-overview',
      'research-progress',
      'student-activity',
      'academic-calendar',
      'project-submissions',
    ],
  },

  construction: {
    id: 'construction',
    name: 'Construction/Engineering',
    features: {
      budget: true,
      procurement: true,
      compliance: true,
      ethiopianCalendar: false,
      grants: false,
      agile: false,
      siteManagement: true,
      equipment: true,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'sites', name: 'Sites', href: '/dashboard/sites', icon: Construction, priority: 2 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 3 },
      { id: 'equipment', name: 'Equipment', href: '/dashboard/equipment', icon: Building2, priority: 4 },
      { id: 'safety', name: 'Safety', href: '/dashboard/safety', icon: Shield, priority: 5 },
      { id: 'budget', name: 'Budget', href: '/dashboard/budget', icon: DollarSign, priority: 6 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 7 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 8 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 9 },
      { id: 'reports', name: 'Reports', href: '/dashboard/reports', icon: BarChart3, priority: 10 },
    ],
    dashboardWidgets: [
      'site-overview',
      'equipment-status',
      'safety-checklist',
      'budget-tracking',
      'progress-photos',
    ],
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    features: {
      budget: true,
      procurement: true,
      compliance: true,
      ethiopianCalendar: false,
      grants: false,
      agile: false,
      facilities: true,
      medical: true,
    },
    navigation: [
      { id: 'home', name: 'Home', href: '/dashboard', icon: Home, priority: 1 },
      { id: 'facilities', name: 'Facilities', href: '/dashboard/facilities', icon: Building2, priority: 2 },
      { id: 'projects', name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, priority: 3 },
      { id: 'medical', name: 'Medical', href: '/dashboard/medical', icon: Stethoscope, priority: 4 },
      { id: 'resources', name: 'Resources', href: '/dashboard/resources', icon: Activity, priority: 5 },
      { id: 'budget', name: 'Budget', href: '/dashboard/budget', icon: DollarSign, priority: 6 },
      { id: 'compliance', name: 'Compliance', href: '/dashboard/compliance', icon: Shield, priority: 7 },
      { id: 'issues', name: 'Issues', href: '/dashboard/issues', icon: ListChecks, priority: 8 },
      { id: 'teams', name: 'Teams', href: '/dashboard/teams', icon: Users, priority: 9 },
      { id: 'documents', name: 'Documents', href: '/dashboard/documents', icon: Sparkles, priority: 10 },
    ],
    dashboardWidgets: [
      'facility-overview',
      'medical-projects',
      'resource-allocation',
      'compliance-status',
      'budget-tracking',
    ],
  },
};

/**
 * Get organization configuration by type
 * Falls back to 'private' if type is not found
 */
export function getOrganizationConfig(type?: string | null): OrganizationTypeConfig {
  if (!type) return ORGANIZATION_TYPE_CONFIGS.private;
  return ORGANIZATION_TYPE_CONFIGS[type] || ORGANIZATION_TYPE_CONFIGS.private;
}

/**
 * Get navigation items for an organization type
 */
export function getNavigationForType(type?: string | null) {
  const config = getOrganizationConfig(type);
  return config.navigation.sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a feature is enabled for an organization type
 */
export function isFeatureEnabled(type: string | null | undefined, feature: keyof OrganizationTypeConfig['features']): boolean {
  const config = getOrganizationConfig(type);
  return config.features[feature] === true;
}
