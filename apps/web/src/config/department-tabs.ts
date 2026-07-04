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
  BarChart3,
  LayoutDashboard,
  Clock,
  Code,
  BookMarked,
  DollarSign,
  Receipt,
  Target,
  Users,
  Settings,
  History,
  Workflow,
  Radio,
  LayoutTemplate,
} from 'lucide-react';
import type { TabDefinition } from '@/components/navigation/unified-page-header';

export const DEVELOPMENT_TABS: TabDefinition[] = [
  { id: 'backlog', label: 'Backlog', labelKey: 'nav.backlog', icon: ListChecks, href: '/backlog' },
  { id: 'releases', label: 'Releases', labelKey: 'nav.releases', icon: GitBranch, href: '/releases' },
  { id: 'code', label: 'Code Review', labelKey: 'nav.codeReview', icon: FileText, href: '/code' },
];

export const MARKETING_TABS: TabDefinition[] = [
  { id: 'social', label: 'Social Media', labelKey: 'nav.socialMedia', icon: MessageSquare, href: '/social' },
  { id: 'analytics', label: 'Analytics', labelKey: 'nav.analytics', icon: TrendingUp, href: '/analytics' },
  { id: 'campaigns', label: 'Campaigns', labelKey: 'nav.campaigns', icon: Map, href: '/campaigns' },
];

export const OPERATIONS_TABS: TabDefinition[] = [
  { id: 'incidents', label: 'Incidents', labelKey: 'nav.incidents', icon: AlertCircle, href: '/incidents' },
  { id: 'monitoring', label: 'Monitoring', labelKey: 'nav.monitoring', icon: Activity, href: '/monitoring' },
  { id: 'checklists', label: 'Checklists', labelKey: 'nav.checklists', icon: CheckCircle2, href: '/checklists' },
];

export const RESEARCH_TABS: TabDefinition[] = [
  { id: 'data', label: 'Data', labelKey: 'nav.data', icon: FileSpreadsheet, href: '/data' },
  { id: 'findings', label: 'Findings', labelKey: 'nav.findings', icon: FileText, href: '/findings' },
  { id: 'plans', label: 'Plans', labelKey: 'nav.plans', icon: Map, href: '/plans' },
  { id: 'materials', label: 'Materials', labelKey: 'nav.materials', icon: FileSpreadsheet, href: '/materials' },
  { id: 'inspections', label: 'Inspections', labelKey: 'nav.inspections', icon: CheckCircle2, href: '/inspections' },
];

export const KNOWLEDGE_TABS: TabDefinition[] = [
  { id: 'documents', label: 'AI Documents', labelKey: 'nav.aiDocuments', icon: Sparkles, href: '' },
  { id: 'automations', label: 'Automation', labelKey: 'nav.automation', icon: Zap, href: '/automations' },
  { id: 'wiki', label: 'Wiki', labelKey: 'nav.wiki', icon: BookOpen, href: '/wiki' },
  { id: 'docs', label: 'Docs', labelKey: 'nav.docs', icon: BookOpen, href: '/docs' },
];

export const BUDGET_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'nav.summary', icon: BarChart3, href: '' },
  { id: 'expenses', label: 'Expenses', labelKey: 'nav.expenses', icon: Receipt, href: '/expenses' },
  { id: 'income', label: 'Income', labelKey: 'nav.income', icon: TrendingUp, href: '/income' },
  { id: 'forecasting', label: 'Forecasting', labelKey: 'nav.forecasting', icon: BarChart3, href: '/forecasting' },
  { id: 'reports', label: 'Reports', labelKey: 'nav.reports', icon: FileText, href: '/reports' },
  { id: 'settings', label: 'Settings', labelKey: 'nav.settings', icon: Settings, href: '/settings' },
];

export const TEAMS_TABS: TabDefinition[] = [
  { id: 'overview', label: 'Summary', labelKey: 'nav.summary', icon: BarChart3, href: '' },
  { id: 'list', label: 'List', labelKey: 'nav.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'nav.board', icon: LayoutDashboard, href: '/board' },
  { id: 'code', label: 'Code', labelKey: 'nav.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'nav.forms', icon: FileText, href: '/forms' },
  { id: 'timeline', label: 'Timeline', labelKey: 'nav.timeline', icon: Clock, href: '/timeline' },
  { id: 'pages', label: 'Pages', labelKey: 'nav.pages', icon: BookMarked, href: '/pages' },
];

export const GOALS_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'nav.summary', icon: BarChart3, href: '' },
  { id: 'list', label: 'List', labelKey: 'nav.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'nav.board', icon: LayoutDashboard, href: '/board' },
  { id: 'code', label: 'Code', labelKey: 'nav.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'nav.forms', icon: FileText, href: '/forms' },
  { id: 'timeline', label: 'Timeline', labelKey: 'nav.timeline', icon: Clock, href: '/timeline' },
  { id: 'pages', label: 'Pages', labelKey: 'nav.pages', icon: BookMarked, href: '/pages' },
];

export const DOCUMENTS_TABS: TabDefinition[] = [
  { id: 'documents', label: 'All Documents', labelKey: 'nav.allDocuments', icon: Sparkles, href: '' },
  { id: 'recent', label: 'Recent', labelKey: 'common.recent', icon: Clock, href: '/recent' },
  { id: 'shared', label: 'Shared', labelKey: 'nav.shared', icon: Users, href: '/shared' },
  { id: 'templates', label: 'Templates', labelKey: 'nav.templates', icon: FileText, href: '/templates' },
  { id: 'settings', label: 'Settings', labelKey: 'nav.settings', icon: Settings, href: '/settings' },
];

export const ISSUES_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'nav.summary', icon: BarChart3, href: '/summary' },
  { id: 'list', label: 'List', labelKey: 'nav.list', icon: ListChecks, href: '' },
  { id: 'backlog', label: 'Backlog', labelKey: 'nav.backlog', icon: ListChecks, href: '/backlog' },
  { id: 'board', label: 'Board', labelKey: 'nav.board', icon: LayoutDashboard, href: '/board' },
  { id: 'epics', label: 'Epics', labelKey: 'common.epic', icon: Target, href: '/epics' },
  { id: 'timeline', label: 'Timeline', labelKey: 'nav.timeline', icon: Clock, href: '/timeline' },
  { id: 'team', label: 'Team', labelKey: 'nav.teams', icon: Users, href: '/team' },
  { id: 'settings', label: 'Settings', labelKey: 'nav.settings', icon: Settings, href: '/settings' },
];

export const AUTOMATIONS_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'nav.summary', icon: BarChart3, href: '/summary' },
  { id: 'list', label: 'List', labelKey: 'nav.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'nav.board', icon: LayoutDashboard, href: '/board' },
  { id: 'workflows', label: 'Workflows', labelKey: 'automations.workflowDesigner', icon: Workflow, href: '/workflows' },
  { id: 'triggers', label: 'Triggers', labelKey: 'automations.trigger', icon: Radio, href: '/triggers' },
  { id: 'templates', label: 'Templates', labelKey: 'nav.templates', icon: LayoutTemplate, href: '/templates' },
  { id: 'history', label: 'History', labelKey: 'common.history', icon: History, href: '/history' },
  { id: 'code', label: 'Code', labelKey: 'nav.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'nav.forms', icon: FileText, href: '/forms' },
  { id: 'settings', label: 'Settings', labelKey: 'nav.settings', icon: Settings, href: '/settings' },
];
