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
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs'],
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
  teams: { icon: Users, label: 'Teams', color: '#10B981', description: 'Team management, member tracking, and collaboration' },
  budget: { icon: DollarSign, label: 'Budget', color: '#F59E0B', description: 'Financial management, expenses, and forecasting' },
  goals: { icon: Target, label: 'Goals', color: '#8B5CF6', description: 'OKRs, milestones, and goal tracking' },
  automations: { icon: Zap, label: 'Automations', color: '#EC4899', description: 'Workflows, triggers, and automated processes' },
  documents: { icon: Sparkles, label: 'AI Documents', color: '#3B82F6', description: 'Document processing with AI features' },
  docs: { icon: BookOpen, label: 'Docs & Wiki', color: '#06B6D4', description: 'Knowledge base and documentation' },
  projects: { icon: FileText, label: 'Projects', color: '#1C8C7D', description: 'Project management and tracking' },
  analytics: { icon: BarChart3, label: 'Analytics', color: '#6366F1', description: 'Data insights and reporting' },
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
      toast.success('Settings saved', 'Dashboard will reload with new configuration.');
      window.location.reload(); // Reload to apply new settings
    } catch (error) {
      toast.error('Save failed', 'Please try again.');
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
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard Customization</h1>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Configure which features are available for your organization</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLoading && (
                <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              )}
              {hasUnsavedChanges && !isLoading && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={resetToDefaults}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
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
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Quick Presets */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Start Presets</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Apply a pre-configured template based on your organization type
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() => applyPreset(preset.name)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.name
                        ? 'border-primary-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{preset.name}</h3>
                      {selectedPreset === preset.name && (
                        <CheckCircle2 className="h-4 w-4 text-primary-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{preset.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {preset.enabledSections.slice(0, 3).map(section => (
                        <span key={section} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                          {section}
                        </span>
                      ))}
                      {preset.enabledSections.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                          +{preset.enabledSections.length - 3}
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Dashboard Sections */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dashboard Sections</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Enable or disable entire sections of your dashboard
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
                          ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]'
                          : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#1B1F23] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{info.label}</h3>
                            <p className="text-xs text-gray-600 dark:text-slate-400">{info.description}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => toggleSection(id as DashboardSectionId)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
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
              <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Features</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.features.budget).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Button
                        onClick={() => toggleFeature('budget', feature)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
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
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Global Features</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">AI Assistant</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Enable AI-powered help and suggestions</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, aiAssistant: !settings.features.aiAssistant } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.aiAssistant ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.features.aiAssistant ? 'translate-x-6' : 'translate-x-1'}`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">Advanced Analytics</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Detailed insights and data visualization</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, analytics: !settings.features.analytics } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.analytics ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.features.analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">Third-party Integrations</div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Connect with external tools and services</div>
                  </div>
                  <Button
                    onClick={() => updateSettings({ ...settings, features: { ...settings.features, integrations: !settings.features.integrations } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.features.integrations ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
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
