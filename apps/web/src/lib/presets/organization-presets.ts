/**
 * Organization Type Presets
 * Pre-configured dashboard settings for different organization types
 */

import type { OrganizationPreset, OrganizationFeatures } from '@/types/organization-settings';

// NOTE: presets must only enable sections that have a navigation
// destination (see NAVIGABLE_SECTION_IDS in lib/sidebar-navigation-dynamic).
// compliance / impact / medical / courses are intentionally NOT enabled:
// their pages are placeholders today, and enabling them produced switches
// that silently did nothing. They return in the change that makes them real
// — see docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md.

// ============================================
// MINISTRY / GOVERNMENT PRESET
// ============================================
const MINISTRY_FEATURES: OrganizationFeatures = {
  budget: {
    expenses: true,
    income: true,
    reports: true,
    forecasting: true,
    procurement: true,
    grants: false,
    donations: false,
    publicTransparency: true,
    multiCurrency: false,
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
  automations: null, // Disabled for government
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
    publicDocs: true,
    apiDocs: false,
  },
  aiAssistant: false,
  analytics: true,
  integrations: false,
  customBranding: true,
};

export const MINISTRY_PRESET: OrganizationPreset = {
  name: 'Ministry / Government',
  description: 'Full-featured dashboard for government ministries with public budget transparency, procurement tracking, and compliance features.',
  nameKey: 'customization.presetMinistryName',
  descriptionKey: 'customization.presetMinistryDesc',
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'timeline', 'calendar', 'issues', 'analytics', 'operations', 'research'],
  features: MINISTRY_FEATURES,
  recommendedFor: ['ministry', 'government'],
};

// ============================================
// NGO / NON-PROFIT PRESET
// ============================================
const NGO_FEATURES: OrganizationFeatures = {
  budget: {
    expenses: true,
    income: true,
    reports: true,
    forecasting: false,
    procurement: false,
    grants: true,
    donations: true,
    publicTransparency: true,
    multiCurrency: true,
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
  automations: null, // Disabled for NGOs
  documents: {
    aiProcessing: false,
    templates: true,
    versionControl: false,
    collaboration: true,
    ocr: false,
  },
  docs: {
    wiki: true,
    search: true,
    publicDocs: true,
    apiDocs: false,
  },
  aiAssistant: false,
  analytics: true,
  integrations: true,
  customBranding: true,
};

export const NGO_PRESET: OrganizationPreset = {
  name: 'NGO / Non-Profit',
  description: 'Optimized for non-profits with grant tracking, donation management, and impact reporting.',
  nameKey: 'customization.presetNgoName',
  descriptionKey: 'customization.presetNgoDesc',
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'timeline', 'calendar', 'issues', 'analytics', 'marketing', 'operations', 'research'],
  features: NGO_FEATURES,
  recommendedFor: ['ngo'],
};

// ============================================
// BUSINESS / STARTUP PRESET
// ============================================
const BUSINESS_FEATURES: OrganizationFeatures = {
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
};

export const BUSINESS_PRESET: OrganizationPreset = {
  name: 'Business / Startup',
  description: 'Full-featured dashboard with automation, AI assistance, revenue tracking, and advanced analytics.',
  nameKey: 'customization.presetBusinessName',
  descriptionKey: 'customization.presetBusinessDesc',
  enabledSections: ['teams', 'budget', 'goals', 'automations', 'documents', 'docs', 'analytics', 'projects', 'issues', 'calendar', 'timeline', 'development', 'marketing', 'operations'],
  features: BUSINESS_FEATURES,
  recommendedFor: ['business', 'startup'],
};

// ============================================
// EDUCATION PRESET
// ============================================
const EDUCATION_FEATURES: OrganizationFeatures = {
  budget: {
    expenses: true,
    income: false,
    reports: true,
    forecasting: false,
    procurement: false,
    grants: true,
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
  automations: null,
  documents: {
    aiProcessing: false,
    templates: true,
    versionControl: false,
    collaboration: true,
    ocr: false,
  },
  docs: {
    wiki: true,
    search: true,
    publicDocs: true,
    apiDocs: false,
  },
  aiAssistant: false,
  analytics: false,
  integrations: false,
  customBranding: true,
};

export const EDUCATION_PRESET: OrganizationPreset = {
  name: 'Education',
  description: 'Simplified dashboard for educational institutions with grant tracking and document management.',
  nameKey: 'customization.presetEducationName',
  descriptionKey: 'customization.presetEducationDesc',
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'calendar', 'issues', 'timeline', 'research'],
  features: EDUCATION_FEATURES,
  recommendedFor: ['education'],
};

// ============================================
// HEALTHCARE PRESET (fifth preset, D8 — enables the medical vertical)
// ============================================
const HEALTHCARE_FEATURES: OrganizationFeatures = {
  budget: {
    expenses: true,
    income: false,
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
    workload: true,
  },
  goals: {
    activeGoals: true,
    completedGoals: true,
    teamGoals: true,
    okrs: false,
    milestones: true,
  },
  automations: null, // Disabled for healthcare
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
  customBranding: true,
};

export const HEALTHCARE_PRESET: OrganizationPreset = {
  name: 'Healthcare',
  description: 'Hospitals, clinics, and health programs: patient-linked operations, clinical research, and compliance posture.',
  nameKey: 'customization.presetHealthcareName',
  descriptionKey: 'customization.presetHealthcareDesc',
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'calendar', 'timeline', 'issues', 'analytics', 'operations', 'research'],
  features: HEALTHCARE_FEATURES,
  recommendedFor: ['healthcare', 'hospital', 'clinic'],
};

// ============================================
// ALL PRESETS MAP
// ============================================
export const ORGANIZATION_PRESETS = {
  ministry: MINISTRY_PRESET,
  government: MINISTRY_PRESET,
  ngo: NGO_PRESET,
  business: BUSINESS_PRESET,
  startup: BUSINESS_PRESET,
  education: EDUCATION_PRESET,
  healthcare: HEALTHCARE_PRESET,
  hospital: HEALTHCARE_PRESET,
  clinic: HEALTHCARE_PRESET,
  // The live onboarding (/onboarding) offers these ids too. They were
  // resolving to Business only via the unknown-type fallback; mapping
  // them explicitly makes the intent visible and testable.
  private: BUSINESS_PRESET,
  personal: BUSINESS_PRESET,
  construction: BUSINESS_PRESET,
} as const;

/**
 * Get preset configuration for an organization type
 */
export function getPresetForOrgType(orgType: string): OrganizationPreset {
  return ORGANIZATION_PRESETS[orgType as keyof typeof ORGANIZATION_PRESETS] || BUSINESS_PRESET;
}

/**
 * Get all available presets for selection
 */
export function getAllPresets(): OrganizationPreset[] {
  return [
    MINISTRY_PRESET,
    NGO_PRESET,
    BUSINESS_PRESET,
    EDUCATION_PRESET,
    HEALTHCARE_PRESET,
  ];
}

/**
 * Resolve the effective enabled sections (D9 fail posture):
 * explicit settings win; otherwise fall back to the org's industry preset;
 * only with neither (legacy orgs) does the caller fail open.
 */
export function resolveEnabledSections(
  enabledSections: string[] | null | undefined,
  industry: string | null | undefined
): string[] | null {
  if (enabledSections && enabledSections.length > 0) return enabledSections;
  if (industry) return [...getPresetForOrgType(industry).enabledSections];
  return null;
}
