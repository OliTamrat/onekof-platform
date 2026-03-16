'use client';

import { useState } from 'react';
import {
  Puzzle,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  MessageSquare,
  GitBranch,
  Mail,
  Cloud,
  Calendar,
  FileText,
  BarChart3,
  Video,
  Bell,
  Shield,
  Zap,
  ArrowRight,
  Star,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type IntegrationStatus = 'available' | 'connected' | 'coming_soon';
type IntegrationCategory = 'communication' | 'development' | 'productivity' | 'analytics' | 'storage';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof MessageSquare;
  color: string;
  bg: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  popular?: boolean;
  features: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send task notifications, daily standups, and project updates directly to Slack channels.',
    icon: MessageSquare,
    color: 'text-[#4A154B]',
    bg: 'bg-[#4A154B]/10',
    category: 'communication',
    status: 'available',
    popular: true,
    features: ['Task notifications', 'Channel mapping', 'Slash commands', 'Daily standups'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link pull requests to tasks, auto-update task status on merge, and track code changes.',
    icon: GitBranch,
    color: 'text-slate-900 dark:text-white',
    bg: 'bg-slate-100 dark:bg-slate-800',
    category: 'development',
    status: 'available',
    popular: true,
    features: ['PR linking', 'Auto status updates', 'Branch tracking', 'Code review sync'],
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Sync with Google Calendar, Drive, and Gmail for seamless productivity.',
    icon: Cloud,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    category: 'productivity',
    status: 'available',
    popular: true,
    features: ['Calendar sync', 'Drive attachments', 'Gmail notifications', 'Google Meet links'],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Collaborate with your team through Teams notifications and task management.',
    icon: Video,
    color: 'text-[#6264A7]',
    bg: 'bg-[#6264A7]/10',
    category: 'communication',
    status: 'coming_soon',
    features: ['Chat notifications', 'Meeting scheduling', 'Tab integration', 'Bot commands'],
  },
  {
    id: 'jira',
    name: 'Jira Import',
    description: 'Import existing projects, issues, and workflows from Jira to Onekof.',
    icon: FileText,
    color: 'text-[#0052CC]',
    bg: 'bg-[#0052CC]/10',
    category: 'productivity',
    status: 'available',
    features: ['Project import', 'Issue migration', 'Status mapping', 'User matching'],
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Send real-time event data to any external service via HTTP webhooks.',
    icon: Zap,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    category: 'development',
    status: 'available',
    features: ['Custom events', 'Retry logic', 'Payload templates', 'Activity logs'],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync task deadlines and milestones with Google Calendar.',
    icon: Calendar,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    category: 'productivity',
    status: 'available',
    features: ['Due date sync', 'Milestone events', 'Two-way sync', 'Team calendars'],
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Configure email digests, assignment alerts, and comment notifications.',
    icon: Mail,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    category: 'communication',
    status: 'available',
    features: ['Daily digest', 'Assignment alerts', 'Comment replies', 'Custom rules'],
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Export project data to business intelligence tools like Tableau or Power BI.',
    icon: BarChart3,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    category: 'analytics',
    status: 'coming_soon',
    features: ['Data export', 'Custom reports', 'API access', 'Dashboard embeds'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync documents and pages between Onekof and Notion workspaces.',
    icon: FileText,
    color: 'text-slate-900 dark:text-white',
    bg: 'bg-slate-100 dark:bg-slate-800',
    category: 'productivity',
    status: 'coming_soon',
    features: ['Page sync', 'Database import', 'Two-way linking', 'Template import'],
  },
];

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  communication: 'Communication',
  development: 'Development',
  productivity: 'Productivity',
  analytics: 'Analytics',
  storage: 'Cloud Storage',
};

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; style: string; icon: typeof CheckCircle2 }> = {
  connected: { label: 'Connected', style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  available: { label: 'Available', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Zap },
  coming_soon: { label: 'Coming Soon', style: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', icon: Clock },
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');

  const filtered = INTEGRATIONS.filter(i => {
    const matchesSearch = !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const popular = filtered.filter(i => i.popular);
  const available = filtered.filter(i => i.status === 'available' && !i.popular);
  const comingSoon = filtered.filter(i => i.status === 'coming_soon');

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-white dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Puzzle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Integrations</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Connect Onekof with your favorite tools &middot; {INTEGRATIONS.filter(i => i.status !== 'coming_soon').length} available
                </p>
              </div>
            </div>
          </div>

          {/* Search + category filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  categoryFilter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                All
              </button>
              {(Object.entries(CATEGORY_LABELS) as [IntegrationCategory, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    categoryFilter === key
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Popular integrations */}
          {popular.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
                <Star className="h-4 w-4 text-amber-500" />
                Popular Integrations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popular.map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </section>
          )}

          {/* Available */}
          {available.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
                <Zap className="h-4 w-4 text-blue-500" />
                Available
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {available.map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </section>
          )}

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
                <Clock className="h-4 w-4 text-slate-400" />
                Coming Soon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comingSoon.map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No integrations found for "{search}"</p>
            </div>
          )}

          {/* API & Developer section */}
          <section>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-[#22272B] dark:to-[#1B1F23] p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
                  <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Build Custom Integrations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    Use the Onekof API to build custom integrations with your internal tools.
                    Full REST API with webhooks, event subscriptions, and OAuth 2.0 authentication.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5" />
                      API Documentation
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Zap className="h-3.5 w-3.5" />
                      Webhook Guide
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const statusConfig = STATUS_CONFIG[integration.status];
  const StatusIcon = statusConfig.icon;
  const isComingSoon = integration.status === 'coming_soon';

  return (
    <div className={cn(
      'group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 transition-all',
      isComingSoon ? 'opacity-75' : 'hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md cursor-pointer'
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('rounded-lg p-2.5 shrink-0', integration.bg)}>
          <integration.icon className={cn('h-5 w-5', integration.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{integration.name}</h3>
            {integration.popular && (
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded', statusConfig.style)}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
        {integration.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {integration.features.slice(0, 3).map(feature => (
          <span key={feature} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
            {feature}
          </span>
        ))}
        {integration.features.length > 3 && (
          <span className="text-[10px] text-slate-400">+{integration.features.length - 3} more</span>
        )}
      </div>

      {!isComingSoon && (
        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs group-hover:border-primary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400">
          Configure
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
