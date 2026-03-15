'use client';

import { ReactNode } from 'react';
import {
  useOrganizationSettings,
  useSectionEnabled,
  useFeatureEnabled,
} from '@/contexts/organization-settings-context';
import type { DashboardSectionId } from '@/types/organization-settings';

/**
 * Feature Gate Component - Conditional rendering based on organization settings
 *
 * Usage Examples:
 *
 * // Check if a section is enabled
 * <SectionGate section="budget">
 *   <BudgetDashboard />
 * </SectionGate>
 *
 * // Check if a specific feature is enabled
 * <FeatureGate section="budget" feature="forecasting">
 *   <ForecastingWidget />
 * </FeatureGate>
 *
 * // Check if ANY section is enabled
 * <AnySectionGate sections={['budget', 'analytics']}>
 *   <FinancialReports />
 * </AnySectionGate>
 *
 * // Check if ALL sections are enabled
 * <AllSectionsGate sections={['budget', 'teams']}>
 *   <TeamBudgetView />
 * </AllSectionsGate>
 */

interface SectionGateProps {
  section: DashboardSectionId;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the specified section is enabled
 */
export function SectionGate({ section, children, fallback = null }: SectionGateProps) {
  const enabled = useSectionEnabled(section);
  return enabled ? <>{children}</> : <>{fallback}</>;
}

interface FeatureGateProps {
  section: string;
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the specified feature is enabled within a section
 */
export function FeatureGate({ section, feature, children, fallback = null }: FeatureGateProps) {
  const enabled = useFeatureEnabled(section, feature);
  return enabled ? <>{children}</> : <>{fallback}</>;
}

interface MultiSectionGateProps {
  sections: DashboardSectionId[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if ANY of the specified sections are enabled
 */
export function AnySectionGate({ sections, children, fallback = null }: MultiSectionGateProps) {
  const { settings } = useOrganizationSettings();
  const anyEnabled = sections.some((section) =>
    settings.enabledSections.includes(section)
  );
  return anyEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * Renders children only if ALL of the specified sections are enabled
 */
export function AllSectionsGate({ sections, children, fallback = null }: MultiSectionGateProps) {
  const { settings } = useOrganizationSettings();
  const allEnabled = sections.every((section) =>
    settings.enabledSections.includes(section)
  );
  return allEnabled ? <>{children}</> : <>{fallback}</>;
}

interface GlobalFeatureGateProps {
  feature: 'aiAssistant' | 'analytics' | 'integrations' | 'customBranding';
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if the specified global feature is enabled
 */
export function GlobalFeatureGate({ feature, children, fallback = null }: GlobalFeatureGateProps) {
  const { settings } = useOrganizationSettings();
  const enabled = settings.features[feature];
  return enabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component to wrap a component with a section gate
 */
export function withSectionGate<P extends object>(
  Component: React.ComponentType<P>,
  section: DashboardSectionId,
  fallback?: ReactNode
) {
  return function SectionGatedComponent(props: P) {
    return (
      <SectionGate section={section} fallback={fallback}>
        <Component {...props} />
      </SectionGate>
    );
  };
}

/**
 * Higher-order component to wrap a component with a feature gate
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  section: string,
  feature: string,
  fallback?: ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate section={section} feature={feature} fallback={fallback}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}
