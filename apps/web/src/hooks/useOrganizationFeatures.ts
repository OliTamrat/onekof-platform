/**
 * Organization Features Hook
 *
 * Provides access to organization-specific features and configuration
 * based on the organization type (government, private, ngo, etc.)
 */

import { useWorkspace } from '@/contexts/workspace-context';
import { getOrganizationConfig, isFeatureEnabled } from '@/config/organization-types';

export function useOrganizationFeatures() {
  const { currentOrganization } = useWorkspace();

  const orgType = currentOrganization?.type || null;
  const config = getOrganizationConfig(orgType);

  return {
    // Organization info
    organizationType: orgType,
    organizationTypeName: config.name,

    // Feature flags
    hasBudget: isFeatureEnabled(orgType, 'budget'),
    hasProcurement: isFeatureEnabled(orgType, 'procurement'),
    hasCompliance: isFeatureEnabled(orgType, 'compliance'),
    hasEthiopianCalendar: isFeatureEnabled(orgType, 'ethiopianCalendar'),
    hasGrants: isFeatureEnabled(orgType, 'grants'),
    hasAgile: isFeatureEnabled(orgType, 'agile'),
    hasTimeTracking: isFeatureEnabled(orgType, 'timeTracking'),
    hasCourses: isFeatureEnabled(orgType, 'courses'),
    hasResearch: isFeatureEnabled(orgType, 'research'),
    hasSiteManagement: isFeatureEnabled(orgType, 'siteManagement'),
    hasEquipment: isFeatureEnabled(orgType, 'equipment'),
    hasFacilities: isFeatureEnabled(orgType, 'facilities'),
    hasMedical: isFeatureEnabled(orgType, 'medical'),

    // Full config for advanced usage
    config,
  };
}

/**
 * Hook to check if a specific feature is enabled
 * Usage: const enabled = useFeature('budget')
 */
export function useFeature(feature: string): boolean {
  const { currentOrganization } = useWorkspace();
  const orgType = currentOrganization?.type || null;

  return isFeatureEnabled(orgType, feature as any);
}
