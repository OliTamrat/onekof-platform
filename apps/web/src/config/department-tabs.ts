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
  Building2,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import type { TabDefinition } from '@/components/navigation/unified-page-header';

export const DEVELOPMENT_TABS: TabDefinition[] = [
  { id: 'backlog', label: 'Backlog', labelKey: 'departmentTabs.backlog', icon: ListChecks, href: '/backlog' },
  { id: 'releases', label: 'Releases', labelKey: 'departmentTabs.releases', icon: GitBranch, href: '/releases' },
  { id: 'code', label: 'Code Review', labelKey: 'departmentTabs.codeReview', icon: FileText, href: '/code' },
];

export const MARKETING_TABS: TabDefinition[] = [
  { id: 'social', label: 'Social Media', labelKey: 'departmentTabs.socialMedia', icon: MessageSquare, href: '/social' },
  { id: 'analytics', label: 'Analytics', labelKey: 'departmentTabs.analytics', icon: TrendingUp, href: '/analytics' },
  { id: 'campaigns', label: 'Campaigns', labelKey: 'departmentTabs.campaigns', icon: Map, href: '/campaigns' },
];

export const OPERATIONS_TABS: TabDefinition[] = [
  { id: 'incidents', label: 'Incidents', labelKey: 'departmentTabs.incidents', icon: AlertCircle, href: '/incidents' },
  { id: 'monitoring', label: 'Monitoring', labelKey: 'departmentTabs.monitoring', icon: Activity, href: '/monitoring' },
  { id: 'checklists', label: 'Checklists', labelKey: 'departmentTabs.checklists', icon: CheckCircle2, href: '/checklists' },
  // M4 — facility operations. Replaces the orphaned /dashboard/facilities,
  // /equipment and /safety placeholders, which rendered outside AppLayout
  // and so had no sidebar at all.
  { id: 'facilities', label: 'Facilities', labelKey: 'departmentTabs.facilities', icon: Building2, href: '/facilities' },
  { id: 'equipment', label: 'Equipment', labelKey: 'departmentTabs.equipment', icon: Wrench, href: '/equipment' },
  { id: 'safety', label: 'Safety Management', labelKey: 'departmentTabs.safety', icon: ShieldCheck, href: '/safety' },
];

export const RESEARCH_TABS: TabDefinition[] = [
  { id: 'data', label: 'Data', labelKey: 'departmentTabs.data', icon: FileSpreadsheet, href: '/data' },
  { id: 'findings', label: 'Findings', labelKey: 'departmentTabs.findings', icon: FileText, href: '/findings' },
  { id: 'plans', label: 'Plans', labelKey: 'departmentTabs.plans', icon: Map, href: '/plans' },
  { id: 'materials', label: 'Materials', labelKey: 'departmentTabs.materials', icon: FileSpreadsheet, href: '/materials' },
  { id: 'inspections', label: 'Inspections', labelKey: 'departmentTabs.inspections', icon: CheckCircle2, href: '/inspections' },
];

export const KNOWLEDGE_TABS: TabDefinition[] = [
  { id: 'documents', label: 'AI Documents', labelKey: 'departmentTabs.aiDocuments', icon: Sparkles, href: '' },
  { id: 'automations', label: 'Automation', labelKey: 'departmentTabs.automation', icon: Zap, href: '/automations' },
  { id: 'wiki', label: 'Wiki', labelKey: 'departmentTabs.wiki', icon: BookOpen, href: '/wiki' },
  { id: 'docs', label: 'Docs', labelKey: 'departmentTabs.docs', icon: BookOpen, href: '/docs' },
];

export const BUDGET_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'departmentTabs.summary', icon: BarChart3, href: '' },
  { id: 'expenses', label: 'Expenses', labelKey: 'departmentTabs.expenses', icon: Receipt, href: '/expenses' },
  { id: 'income', label: 'Income', labelKey: 'departmentTabs.income', icon: TrendingUp, href: '/income' },
  { id: 'forecasting', label: 'Forecasting', labelKey: 'departmentTabs.forecasting', icon: BarChart3, href: '/forecasting' },
  { id: 'reports', label: 'Reports', labelKey: 'departmentTabs.reports', icon: FileText, href: '/reports' },
  { id: 'settings', label: 'Settings', labelKey: 'departmentTabs.settings', icon: Settings, href: '/settings' },
];

export const TEAMS_TABS: TabDefinition[] = [
  { id: 'overview', label: 'Summary', labelKey: 'departmentTabs.overview', icon: BarChart3, href: '' },
  { id: 'list', label: 'List', labelKey: 'departmentTabs.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'departmentTabs.board', icon: LayoutDashboard, href: '/board' },
  { id: 'code', label: 'Code', labelKey: 'departmentTabs.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'departmentTabs.forms', icon: FileText, href: '/forms' },
  { id: 'timeline', label: 'Timeline', labelKey: 'departmentTabs.timeline', icon: Clock, href: '/timeline' },
  { id: 'pages', label: 'Pages', labelKey: 'departmentTabs.pages', icon: BookMarked, href: '/pages' },
];

export const GOALS_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'departmentTabs.summary', icon: BarChart3, href: '' },
  { id: 'list', label: 'List', labelKey: 'departmentTabs.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'departmentTabs.board', icon: LayoutDashboard, href: '/board' },
  { id: 'code', label: 'Code', labelKey: 'departmentTabs.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'departmentTabs.forms', icon: FileText, href: '/forms' },
  { id: 'timeline', label: 'Timeline', labelKey: 'departmentTabs.timeline', icon: Clock, href: '/timeline' },
  { id: 'pages', label: 'Pages', labelKey: 'departmentTabs.pages', icon: BookMarked, href: '/pages' },
];

export const DOCUMENTS_TABS: TabDefinition[] = [
  { id: 'documents', label: 'All Documents', labelKey: 'departmentTabs.allDocuments', icon: Sparkles, href: '' },
  { id: 'recent', label: 'Recent', labelKey: 'departmentTabs.recent', icon: Clock, href: '/recent' },
  { id: 'shared', label: 'Shared', labelKey: 'departmentTabs.shared', icon: Users, href: '/shared' },
  { id: 'templates', label: 'Templates', labelKey: 'departmentTabs.templates', icon: FileText, href: '/templates' },
  { id: 'settings', label: 'Settings', labelKey: 'departmentTabs.settings', icon: Settings, href: '/settings' },
];

export const ISSUES_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'departmentTabs.summary', icon: BarChart3, href: '/summary' },
  { id: 'list', label: 'List', labelKey: 'departmentTabs.list', icon: ListChecks, href: '' },
  { id: 'backlog', label: 'Backlog', labelKey: 'departmentTabs.backlog', icon: ListChecks, href: '/backlog' },
  { id: 'sprints', label: 'Sprints', labelKey: 'departmentTabs.sprints', icon: Zap, href: '/sprints' },
  { id: 'board', label: 'Board', labelKey: 'departmentTabs.board', icon: LayoutDashboard, href: '/board' },
  { id: 'epics', label: 'Epics', labelKey: 'departmentTabs.epics', icon: Target, href: '/epics' },
  { id: 'hierarchy', label: 'Hierarchy', labelKey: 'departmentTabs.hierarchy', icon: GitBranch, href: '/hierarchy' },
  { id: 'timeline', label: 'Timeline', labelKey: 'departmentTabs.timeline', icon: Clock, href: '/timeline' },
  { id: 'team', label: 'Team', labelKey: 'departmentTabs.team', icon: Users, href: '/team' },
  { id: 'settings', label: 'Settings', labelKey: 'departmentTabs.settings', icon: Settings, href: '/settings' },
];

export const AUTOMATIONS_TABS: TabDefinition[] = [
  { id: 'summary', label: 'Summary', labelKey: 'departmentTabs.summary', icon: BarChart3, href: '/summary' },
  { id: 'list', label: 'List', labelKey: 'departmentTabs.list', icon: ListChecks, href: '/list' },
  { id: 'board', label: 'Board', labelKey: 'departmentTabs.board', icon: LayoutDashboard, href: '/board' },
  { id: 'workflows', label: 'Workflows', labelKey: 'departmentTabs.workflows', icon: Workflow, href: '/workflows' },
  { id: 'triggers', label: 'Triggers', labelKey: 'departmentTabs.triggers', icon: Radio, href: '/triggers' },
  { id: 'templates', label: 'Templates', labelKey: 'departmentTabs.templates', icon: LayoutTemplate, href: '/templates' },
  { id: 'history', label: 'History', labelKey: 'departmentTabs.history', icon: History, href: '/history' },
  { id: 'code', label: 'Code', labelKey: 'departmentTabs.code', icon: Code, href: '/code' },
  { id: 'forms', label: 'Forms', labelKey: 'departmentTabs.forms', icon: FileText, href: '/forms' },
  { id: 'settings', label: 'Settings', labelKey: 'departmentTabs.settings', icon: Settings, href: '/settings' },
];
