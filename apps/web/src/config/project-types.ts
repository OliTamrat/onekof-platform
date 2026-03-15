/**
 * Project Type Configurations
 *
 * Each project can have its own workflow and features based on its type.
 * Ministry of Innovation can have BOTH technical AND operational projects!
 */

import {
  Code,
  Briefcase,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  Construction,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface ProjectTypeConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  description: string;
  features: {
    agile: boolean;
    code: boolean;
    marketing: boolean;
    operations: boolean;
    research: boolean;
    construction: boolean;
    budget: boolean;
  };
  defaultViews: string[];
  workflows: string[];
}

export const PROJECT_TYPE_CONFIGS: Record<string, ProjectTypeConfig> = {
  SOFTWARE: {
    id: 'SOFTWARE',
    name: 'Software Development',
    icon: Code,
    color: '#3B82F6',
    description: 'For software development projects with agile workflows',
    features: {
      agile: true,
      code: true,
      marketing: false,
      operations: false,
      research: false,
      construction: false,
      budget: false,
    },
    defaultViews: ['Board', 'Backlog', 'Sprint', 'Code', 'Releases'],
    workflows: ['SCRUM', 'KANBAN', 'CUSTOM'],
  },

  BUSINESS: {
    id: 'BUSINESS',
    name: 'Business / Operational',
    icon: Briefcase,
    color: '#8B5CF6',
    description: 'General business and operational projects',
    features: {
      agile: false,
      code: false,
      marketing: false,
      operations: true,
      research: false,
      construction: false,
      budget: true,
    },
    defaultViews: ['Tasks', 'Calendar', 'Timeline', 'Budget', 'Reports'],
    workflows: ['KANBAN', 'CUSTOM'],
  },

  MARKETING: {
    id: 'MARKETING',
    name: 'Marketing Campaign',
    icon: TrendingUp,
    color: '#EC4899',
    description: 'Marketing campaigns and content projects',
    features: {
      agile: false,
      code: false,
      marketing: true,
      operations: false,
      research: false,
      construction: false,
      budget: true,
    },
    defaultViews: ['Campaigns', 'Content', 'Analytics', 'Calendar', 'Budget'],
    workflows: ['KANBAN', 'CUSTOM'],
  },

  OPERATIONS: {
    id: 'OPERATIONS',
    name: 'Operations / Infrastructure',
    icon: Activity,
    color: '#EF4444',
    description: 'IT operations, infrastructure, and incident management',
    features: {
      agile: false,
      code: false,
      marketing: false,
      operations: true,
      research: false,
      construction: false,
      budget: false,
    },
    defaultViews: ['Incidents', 'Monitoring', 'Alerts', 'Docs', 'Reports'],
    workflows: ['KANBAN', 'CUSTOM'],
  },

  RESEARCH: {
    id: 'RESEARCH',
    name: 'Research & Analysis',
    icon: FileSpreadsheet,
    color: '#10B981',
    description: 'Research projects with data analysis and findings',
    features: {
      agile: false,
      code: false,
      marketing: false,
      operations: false,
      research: true,
      construction: false,
      budget: true,
    },
    defaultViews: ['Data', 'Findings', 'Reports', 'Timeline', 'Budget'],
    workflows: ['CUSTOM'],
  },

  CONSTRUCTION: {
    id: 'CONSTRUCTION',
    name: 'Construction / Engineering',
    icon: Construction,
    color: '#F59E0B',
    description: 'Construction and engineering projects',
    features: {
      agile: false,
      code: false,
      marketing: false,
      operations: false,
      research: false,
      construction: true,
      budget: true,
    },
    defaultViews: ['Plans', 'Timeline', 'Budget', 'Materials', 'Safety', 'Photos'],
    workflows: ['CUSTOM'],
  },

  CUSTOM: {
    id: 'CUSTOM',
    name: 'Custom Project',
    icon: Wrench,
    color: '#6B7280',
    description: 'Fully customizable project type',
    features: {
      agile: true,
      code: false,
      marketing: false,
      operations: false,
      research: false,
      construction: false,
      budget: true,
    },
    defaultViews: ['Board', 'Tasks', 'Calendar', 'Reports'],
    workflows: ['KANBAN', 'CUSTOM'],
  },
};

export function getProjectTypeConfig(type: string): ProjectTypeConfig {
  return PROJECT_TYPE_CONFIGS[type] || PROJECT_TYPE_CONFIGS.BUSINESS;
}

export function isProjectFeatureEnabled(
  projectType: string,
  feature: keyof ProjectTypeConfig['features']
): boolean {
  const config = getProjectTypeConfig(projectType);
  return config.features[feature] === true;
}
