/**
 * Organization Settings & Feature Flags
 * Defines the customizable dashboard structure for each organization
 */

export type OrganizationType =
  | 'government'
  | 'ministry'
  | 'ngo'
  | 'business'
  | 'startup'
  | 'education'
  | 'healthcare'
  | 'other';

export type DashboardSectionId =
  | 'teams'
  | 'budget'
  | 'goals'
  | 'automations'
  | 'documents'
  | 'docs'
  | 'projects'
  | 'issues'
  | 'calendar'
  | 'timeline'
  | 'analytics'
  | 'compliance'
  | 'impact';

export interface BudgetFeatures {
  // Core budget features
  expenses: boolean;
  income: boolean;
  reports: boolean;
  forecasting: boolean;

  // Specialized features
  procurement: boolean;
  grants: boolean;
  donations: boolean;
  publicTransparency: boolean;
  multiCurrency: boolean;
  approvalWorkflow: boolean;
}

export interface TeamFeatures {
  goals: boolean;
  activity: boolean;
  performance: boolean;
  workload: boolean;
}

export interface GoalFeatures {
  activeGoals: boolean;
  completedGoals: boolean;
  teamGoals: boolean;
  okrs: boolean;
  milestones: boolean;
}

export interface AutomationFeatures {
  workflows: boolean;
  triggers: boolean;
  history: boolean;
  scheduling: boolean;
}

export interface DocumentFeatures {
  aiProcessing: boolean;
  templates: boolean;
  versionControl: boolean;
  collaboration: boolean;
  ocr: boolean;
}

export interface DocsFeatures {
  wiki: boolean;
  search: boolean;
  publicDocs: boolean;
  apiDocs: boolean;
}

export interface OrganizationFeatures {
  // Section-level features
  budget: BudgetFeatures | null;
  teams: TeamFeatures | null;
  goals: GoalFeatures | null;
  automations: AutomationFeatures | null;
  documents: DocumentFeatures | null;
  docs: DocsFeatures | null;

  // Global features
  aiAssistant: boolean;
  analytics: boolean;
  integrations: boolean;
  customBranding: boolean;
}

export interface OrganizationSettings {
  // Enabled dashboard sections
  enabledSections: DashboardSectionId[];

  // Feature flags per section
  features: OrganizationFeatures;

  // Customization
  customization: {
    primaryColor: string;
    logoUrl?: string;
    budgetCurrency: string;
    fiscalYearStart: number; // 1-12 (month)
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    language: 'en' | 'am' | 'ti' | 'om'; // English, Amharic, Tigrinya, Oromo
  };

  // Permissions
  permissions: {
    allowMemberInvites: boolean;
    requireBudgetApproval: boolean;
    publicProjectsVisible: boolean;
  };
}

export interface OrganizationPreset {
  name: string;
  description: string;
  nameKey: string;
  descriptionKey: string;
  enabledSections: DashboardSectionId[];
  features: OrganizationFeatures;
  recommendedFor: OrganizationType[];
}

// Default enabled features for each section
export const DEFAULT_BUDGET_FEATURES: BudgetFeatures = {
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
};

export const DEFAULT_TEAM_FEATURES: TeamFeatures = {
  goals: true,
  activity: true,
  performance: false,
  workload: false,
};

export const DEFAULT_GOAL_FEATURES: GoalFeatures = {
  activeGoals: true,
  completedGoals: true,
  teamGoals: true,
  okrs: false,
  milestones: true,
};

export const DEFAULT_AUTOMATION_FEATURES: AutomationFeatures = {
  workflows: true,
  triggers: true,
  history: true,
  scheduling: false,
};

export const DEFAULT_DOCUMENT_FEATURES: DocumentFeatures = {
  aiProcessing: false,
  templates: true,
  versionControl: true,
  collaboration: true,
  ocr: false,
};

export const DEFAULT_DOCS_FEATURES: DocsFeatures = {
  wiki: true,
  search: true,
  publicDocs: false,
  apiDocs: false,
};
