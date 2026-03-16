import {
  ListChecks,
  GitBranch,
  FileText,
  MessageSquare,
  TrendingUp,
  Map,
  AlertCircle,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';
import type { TabDefinition } from '@/components/navigation/unified-page-header';

export const DEVELOPMENT_TABS: TabDefinition[] = [
  { id: 'backlog', label: 'Backlog', icon: ListChecks, href: '/backlog' },
  { id: 'releases', label: 'Releases', icon: GitBranch, href: '/releases' },
  { id: 'code', label: 'Code Review', icon: FileText, href: '/code' },
];

export const MARKETING_TABS: TabDefinition[] = [
  { id: 'social', label: 'Social Media', icon: MessageSquare, href: '/social' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
  { id: 'campaigns', label: 'Campaigns', icon: Map, href: '/campaigns' },
];

export const OPERATIONS_TABS: TabDefinition[] = [
  { id: 'incidents', label: 'Incidents', icon: AlertCircle, href: '/incidents' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, href: '/monitoring' },
  { id: 'checklists', label: 'Checklists', icon: CheckCircle2, href: '/checklists' },
];

export const RESEARCH_TABS: TabDefinition[] = [
  { id: 'data', label: 'Data', icon: FileSpreadsheet, href: '/data' },
  { id: 'findings', label: 'Findings', icon: FileText, href: '/findings' },
  { id: 'plans', label: 'Plans', icon: Map, href: '/plans' },
  { id: 'materials', label: 'Materials', icon: FileSpreadsheet, href: '/materials' },
  { id: 'inspections', label: 'Inspections', icon: CheckCircle2, href: '/inspections' },
];

export const KNOWLEDGE_TABS: TabDefinition[] = [
  { id: 'documents', label: 'AI Documents', icon: Sparkles, href: '' },
  { id: 'automations', label: 'Automation', icon: Zap, href: '/automations' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, href: '/wiki' },
  { id: 'docs', label: 'Docs', icon: BookOpen, href: '/docs' },
];
