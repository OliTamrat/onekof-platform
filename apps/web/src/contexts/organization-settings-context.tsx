'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { OrganizationSettings, OrganizationType } from '@/types/organization-settings';
import { getPresetForOrgType } from '@/lib/presets/organization-presets';

// Default settings (Business preset)
const DEFAULT_SETTINGS: OrganizationSettings = {
  enabledSections: ['teams', 'budget', 'goals', 'automations', 'documents', 'docs', 'projects', 'issues', 'calendar', 'timeline', 'analytics'],
  features: {
    budget: {
      expenses: true,
      income: true,
      reports: true,
      forecasting: true,
      procurement: false,
      grants: false,
      donations: false,
      publicTransparency: false,
      multiCurrency: true,
      approvalWorkflow: true,
    },
    teams: {
      goals: true,
      activity: true,
      performance: true,
      workload: true,
    },
    goals: {
      activeGoals: true,
      completedGoals: true,
      teamGoals: true,
      okrs: true,
      milestones: true,
    },
    automations: {
      workflows: true,
      triggers: true,
      history: true,
      scheduling: true,
    },
    documents: {
      aiProcessing: true,
      templates: true,
      versionControl: true,
      collaboration: true,
      ocr: true,
    },
    docs: {
      wiki: true,
      search: true,
      publicDocs: false,
      apiDocs: true,
    },
    aiAssistant: true,
    analytics: true,
    integrations: true,
    customBranding: true,
  },
  customization: {
    primaryColor: '#1C8C7D',
    budgetCurrency: 'ETB',
    fiscalYearStart: 1,
    dateFormat: 'MM/DD/YYYY',
    language: 'EN',
  },
  permissions: {
    allowMemberInvites: true,
    requireBudgetApproval: true,
    publicProjectsVisible: false,
  },
};

interface OrganizationSettingsContextType {
  settings: OrganizationSettings;
  updateSettings: (newSettings: OrganizationSettings) => void;
  applyPreset: (orgType: OrganizationType) => void;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  saveSettings: () => Promise<void>;
}

const OrganizationSettingsContext = createContext<OrganizationSettingsContextType | undefined>(
  undefined
);

interface OrganizationSettingsProviderProps {
  children: ReactNode;
  organizationId?: string;
  initialSettings?: OrganizationSettings;
}

export function OrganizationSettingsProvider({
  children,
  organizationId,
  initialSettings,
}: OrganizationSettingsProviderProps) {
  const [settings, setSettings] = useState<OrganizationSettings>(
    initialSettings || DEFAULT_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from API when organization changes
  useEffect(() => {
    if (organizationId) {
      loadSettings(organizationId);
    }
  }, [organizationId]);

  const loadSettings = async (orgId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/settings`);

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to load organization settings:', error);
      // Fallback to default settings on error
      setSettings(initialSettings || DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (newSettings: OrganizationSettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const applyPreset = (orgType: OrganizationType) => {
    const preset = getPresetForOrgType(orgType);
    const newSettings: OrganizationSettings = {
      ...settings,
      enabledSections: preset.enabledSections,
      features: preset.features,
    };
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!organizationId) {
      console.warn('Cannot save settings: no organization ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        // Surface the server's reason — a generic toast hid two real bugs
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || `Failed to save settings (HTTP ${response.status})`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save organization settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizationSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        applyPreset,
        isLoading,
        hasUnsavedChanges,
        saveSettings,
      }}
    >
      {children}
    </OrganizationSettingsContext.Provider>
  );
}

/**
 * Hook to access organization settings
 */
export function useOrganizationSettings() {
  const context = useContext(OrganizationSettingsContext);
  if (!context) {
    throw new Error(
      'useOrganizationSettings must be used within OrganizationSettingsProvider'
    );
  }
  return context;
}

/**
 * Hook to check if a section is enabled
 */
export function useSectionEnabled(sectionId: string) {
  const { settings } = useOrganizationSettings();
  return settings.enabledSections.includes(sectionId as any);
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureEnabled(section: string, feature: string) {
  const { settings } = useOrganizationSettings();
  const sectionFeatures = (settings.features as any)[section];

  if (!sectionFeatures) return false;
  return sectionFeatures[feature] ?? false;
}
