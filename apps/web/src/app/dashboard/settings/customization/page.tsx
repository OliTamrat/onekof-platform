'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  Sparkles,
  DollarSign,
  Users,
  Target,
  Zap,
  FileText,
  BookOpen,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { getAllPresets, getPresetForOrgType } from '@/lib/presets/organization-presets';
import { useOrganizationSettings } from '@/contexts/organization-settings-context';
import type { OrganizationSettings, DashboardSectionId, OrganizationType } from '@/types/organization-settings';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

// Mock current organization settings (replace with real data from API/context)
const INITIAL_SETTINGS: OrganizationSettings = {
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'calendar', 'issues', 'timeline', 'analytics', 'automations'],
  features: {
    budget: {
      expenses: true,
      income: true,
      reports: true,
      forecasting: false,
      procurement: false,
      grants: false,
      donations: false,
      publicTransparency: false,
      multiCurrency: false,
      approvalWorkflow: true,
    },
    teams: {
      goals: true,
      activity: true,
      performance: false,
      workload: false,
    },
    goals: {
      activeGoals: true,
      completedGoals: true,
      teamGoals: true,
      okrs: false,
      milestones: true,
    },
    automations: {
      workflows: true,
      triggers: true,
      history: true,
      scheduling: false,
    },
    documents: {
      aiProcessing: false,
      templates: true,
      versionControl: true,
      collaboration: true,
      ocr: false,
    },
    docs: {
      wiki: true,
      search: true,
      publicDocs: false,
      apiDocs: false,
    },
    aiAssistant: false,
    analytics: true,
    integrations: false,
    customBranding: false,
  },
  customization: {
    primaryColor: '#1C8C7D',
    budgetCurrency: 'USD',
    fiscalYearStart: 1,
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
  },
  permissions: {
    allowMemberInvites: true,
    requireBudgetApproval: true,
    publicProjectsVisible: false,
  },
};

const SECTION_INFO = {
  teams: { icon: Users, labelKey: 'customization.teams', color: '#10B981', descKey: 'customization.teamsDesc' },
  budget: { icon: DollarSign, labelKey: 'customization.budget', color: '#F59E0B', descKey: 'customization.budgetDesc' },
  goals: { icon: Target, labelKey: 'customization.goals', color: '#8B5CF6', descKey: 'customization.goalsDesc' },
  automations: { icon: Zap, labelKey: 'customization.automations', color: '#EC4899', descKey: 'customization.automationsDesc' },
  documents: { icon: Sparkles, labelKey: 'customization.aiDocuments', color: '#3B82F6', descKey: 'customization.aiDocumentsDesc' },
  docs: { icon: BookOpen, labelKey: 'customization.docsWiki', color: '#06B6D4', descKey: 'customization.docsWikiDesc' },
  projects: { icon: FileText, labelKey: 'customization.projects', color: '#1C8C7D', descKey: 'customization.projectsDesc' },
  analytics: { icon: BarChart3, labelKey: 'customization.analytics', color: '#6366F1', descKey: 'customization.analyticsDesc' },
};

export default function DashboardCustomizationPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const { settings, updateSettings, applyPreset: applyOrgPreset, saveSettings: saveToAPI, hasUnsavedChanges, isLoading } = useOrganizationSettings();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const presets = getAllPresets();

  const toggleSection = (sectionId: DashboardSectionId) => {
    const newSections = settings.enabledSections.includes(sectionId)
      ? settings.enabledSections.filter(s => s !== sectionId)
      : [...settings.enabledSections, sectionId];

    updateSettings({ ...settings, enabledSections: newSections });
  };

  const toggleFeature = (section: string, feature: string) => {
    updateSettings({
      ...settings,
      features: {
        ...settings.features,
        [section]: settings.features[section as keyof typeof settings.features]
          ? {
              ...(settings.features[section as keyof typeof settings.features] as any),
              [feature]: !(settings.features[section as keyof typeof settings.features] as any)[feature],
            }
          : null,
      },
    });
  };

  const applyPreset = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      updateSettings({
        ...settings,
        enabledSections: preset.enabledSections,
        features: preset.features,
      });
      setSelectedPreset(presetName);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveToAPI();
      toast.success(t("customization.settingsSaved"), t("customization.settingsSavedDesc"));
      window.location.reload(); // Reload to apply new settings
    } catch (error) {
      toast.error(t("customization.saveFailed"), t("customization.saveFailedDesc"));
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    // Apply business preset as default
    const defaultPreset = getPresetForOrgType('business');
    updateSettings({
      ...settings,
      enabledSections: defaultPreset.enabledSections,
      features: defaultPreset.features,
    });
    setSelectedPreset(null);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t("customization.title")}</h1>
                  <p className="text-sm text-gray-600 dark:text-white/50">{t("customization.description")}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("customization.loading")}
                </span>
              )}
              {hasUnsavedChanges && !isLoading && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {t("customization.unsavedChanges")}
                </span>
              )}
              <Button
                onClick={resetToDefaults}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                {t("customization.reset")}
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges || isSaving || isLoading}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md ${
                  hasUnsavedChanges && !isSaving && !isLoading
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? t("customization.saving") : t("customization.saveChanges")}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Quick Presets */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("customization.quickStartPresets")}</h2>
              <p className="text-sm text-gray-600 dark:text-white/50 mb-4">
                {t("customization.quickStartPresetsDesc")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() => applyPreset(preset.name)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.name
                        ? 'border-primary-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{t(preset.nameKey)}</h3>
                      {selectedPreset === preset.name && (
                        <CheckCircle2 className="h-4 w-4 text-primary-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white/50 line-clamp-2">{t(preset.descriptionKey)}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {preset.enabledSections.slice(0, 3).map(section => (
                        <span key={section} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300">
                          {t('customization.' + section)}
                        </span>
                      ))}
                      {preset.enabledSections.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300">
                          +{preset.enabledSections.length - 3}
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("customization.dashboardSections")}</h2>
              <p className="text-sm text-gray-600 dark:text-white/50 mb-4">
                {t("customization.dashboardSectionsDesc")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(SECTION_INFO).map(([id, info]) => {
                  const Icon = info.icon;
                  const isEnabled = settings.enabledSections.includes(id as DashboardSectionId);
                  return (
                    <div
                      key={id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isEnabled
                          ? 'border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]'
                          : 'border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#0B0E11] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{t(info.labelKey)}</h3>
                            <p className="text-xs text-gray-600 dark:text-white/50">{t(info.descKey)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => toggleSection(id as DashboardSectionId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/[0.08]'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Features */}
            {settings.enabledSections.includes('budget') && settings.features.budget && (
              <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("customization.budgetFeatures")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.features.budget).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-white/[0.08]">
                      <span className="text-sm text-gray-900 dark:text-white">{t('customization.budgetFeature.' + feature)}</span>
                      <Button
                        onClick={() => toggleFeature('budget', feature)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/[0.08]'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global Features */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("customization.globalFeatures")}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/[0.08]">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t("customization.aiAssistant")}</div>
                    <div className="text-xs text-gray-600 dark:text-white/50 mt-1">{t("customization.aiAssistantDesc")}</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, aiAssistant: !settings.features.aiAssistant } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.aiAssistant ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.features.aiAssistant ? 'translate-x-6' : 'translate-x-1'}`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/[0.08]">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t("customization.advancedAnalytics")}</div>
                    <div className="text-xs text-gray-600 dark:text-white/50 mt-1">{t("customization.advancedAnalyticsDesc")}</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, analytics: !settings.features.analytics } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.analytics ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.features.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-white/[0.08]">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t("customization.thirdPartyIntegrations")}</div>
                    <div className="text-xs text-gray-600 dark:text-white/50 mt-1">{t("customization.thirdPartyIntegrationsDesc")}</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, integrations: !settings.features.integrations } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.integrations ? 'bg-primary-500' : 'bg-gray-200 dark:bg-white/[0.08]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.features.integrations ? 'translate-x-6' : 'translate-x-1'}`} />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
