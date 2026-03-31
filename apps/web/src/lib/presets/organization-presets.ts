/**
 * Organization Type Presets
 * Pre-configured dashboard settings for different organization types
 */

import type { OrganizationPreset, OrganizationFeatures } from '@/types/organization-settings';

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
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'compliance', 'timeline', 'calendar', 'issues', 'analytics'],
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
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'impact', 'timeline', 'calendar', 'issues', 'analytics'],
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
  enabledSections: ['teams', 'budget', 'goals', 'automations', 'documents', 'docs', 'analytics', 'projects', 'issues', 'calendar', 'timeline'],
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
  enabledSections: ['teams', 'budget', 'goals', 'projects', 'documents', 'docs', 'calendar', 'issues', 'timeline'],
  features: EDUCATION_FEATURES,
  recommendedFor: ['education'],
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
  ];
}
