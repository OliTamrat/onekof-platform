/**
 * Organization Type Configurations
 *
 * Defines feature flags and dashboard widgets for each organization type,
 * consumed by useOrganizationFeatures().
 *
 * HISTORY (S1): this file used to also carry a per-type `navigation` array
 * with priority ordering and sector entries. That system was dead code —
 * its only consumer chain ended in a function with zero callers — while
 * reading as authoritative, and it misled the sidebar-editions audit that
 * finally removed it. Per-organization-type navigation now lives in
 * lib/navigation/editions.ts (order, vocabulary, sector extras) applied by
 * lib/sidebar-navigation-dynamic.ts over preset membership. See
 * docs/architecture/SIDEBAR_EDITIONS_ARCHITECTURE.md.
 */

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
 * Check if a feature is enabled for an organization type
 */
export function isFeatureEnabled(type: string | null | undefined, feature: keyof OrganizationTypeConfig['features']): boolean {
  const config = getOrganizationConfig(type);
  return config.features[feature] === true;
}
