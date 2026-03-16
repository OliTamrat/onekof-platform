'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Star,
  X,
  ExternalLink,
  Settings2,
  ChevronRight,
  Zap,
  Shield,
  FileText,
  Puzzle,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Brand SVG Logos ───────────────────────────────────────────────────────────

function SlackLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none">
      <path d="M26.9 80.4a13.4 13.4 0 1 1-13.4-13.4h13.4v13.4z" fill="#E01E5A"/>
      <path d="M33.6 80.4a13.4 13.4 0 0 1 26.8 0v33.5a13.4 13.4 0 1 1-26.8 0V80.4z" fill="#E01E5A"/>
      <path d="M47 26.9A13.4 13.4 0 1 1 47 13.5h.1v13.4H47z" fill="#36C5F0"/>
      <path d="M47 33.6a13.4 13.4 0 0 1 0 26.8H13.5a13.4 13.4 0 1 1 0-26.8H47z" fill="#36C5F0"/>
      <path d="M100.6 47a13.4 13.4 0 1 1 13.4 13.4h-13.4V47z" fill="#2EB67D"/>
      <path d="M93.9 47a13.4 13.4 0 0 1-26.8 0V13.5a13.4 13.4 0 1 1 26.8 0V47z" fill="#2EB67D"/>
      <path d="M80.5 100.6a13.4 13.4 0 1 1 .1 26.8h-.1v-13.4h13.4-.1.1v-13.4h-13.4z" fill="#ECB22E"/>
      <path d="M80.5 93.9a13.4 13.4 0 0 1 0-26.8h33.5a13.4 13.4 0 1 1 0 26.8H80.5z" fill="#ECB22E"/>
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 98 96" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6C29.304 70.09 17.79 65.857 17.79 46.935c0-5.214 1.861-9.451 4.851-12.792-.484-1.223-2.104-6.109.484-12.63 0 0 3.964-1.303 12.958 4.892a44.46 44.46 0 0 1 11.852-1.629 44.209 44.209 0 0 1 11.852 1.63c8.993-6.196 12.957-4.893 12.957-4.893 2.59 6.521.97 11.407.485 12.63a18.456 18.456 0 0 1 4.85 12.792c0 18.922-11.515 23.074-22.473 24.379 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
    </svg>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.998 23.998 0 0 0 0 24c0 3.77.9 7.35 2.56 10.54l7.97-5.95z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.95C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function TeamsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="#5059C9" d="M33.5 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/>
      <path fill="#5059C9" d="M40.5 15H31a2 2 0 0 0-2 2v11.5a6.5 6.5 0 0 0 13 0V17.5a2.5 2.5 0 0 0-1.5-2.5z"/>
      <path fill="#7B83EB" d="M24 12a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/>
      <path fill="#7B83EB" d="M34 17a3 3 0 0 0-3-3H13a3 3 0 0 0-3 3v14a10 10 0 0 0 10.67 9.98A12 12 0 0 0 34 29V17z"/>
      <path fill="white" fillOpacity="0.3" d="M25 17v18.5a1.5 1.5 0 0 1-1.24 1.47A12.04 12.04 0 0 1 10 31V17a3 3 0 0 1 3-3h10.5a1.5 1.5 0 0 1 1.5 1.5V17z"/>
    </svg>
  );
}

function JiraLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="jira-a" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#0052CC"/>
          <stop offset="100%" stopColor="#2684FF"/>
        </linearGradient>
      </defs>
      <path fill="url(#jira-a)" d="M44.7 22.3 25.7 3.3 24 1.6 8.5 17.1l-5.2 5.2a1.9 1.9 0 0 0 0 2.7l10.1 10.1L24 45.7l15.5-15.5.3-.3 4.9-4.9a1.9 1.9 0 0 0 0-2.7zM24 30.8l-7.1-7.1L24 16.6l7.1 7.1L24 30.8z"/>
    </svg>
  );
}

function WebhookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="12" cy="36" r="6" stroke="#F97316" strokeWidth="3" fill="none"/>
      <circle cx="36" cy="36" r="6" stroke="#F97316" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="12" r="6" stroke="#F97316" strokeWidth="3" fill="none"/>
      <path d="M18 36h12M15 33l9-18M33 33l-9-18" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function GoogleCalendarLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="#fff" d="M34 7H14l-4 4v26l4 4h20l4-4V11l-4-4z"/>
      <path fill="#1A73E8" d="M34 7v4h4l-4-4z"/>
      <path fill="#EA4335" d="M14 7v4h-4l4-4z"/>
      <path fill="#188038" d="M14 41v-4h-4l4 4z"/>
      <path fill="#FBBC04" d="M34 41v-4h4l-4 4z"/>
      <path fill="#4285F4" d="M34 11H14v26h20V11z" opacity="0.08"/>
      <rect x="14" y="11" width="20" height="4" fill="#4285F4"/>
      <path fill="#1A73E8" d="M20 22h3v3h-3zm5 0h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3z"/>
    </svg>
  );
}

function EmailLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="10" width="40" height="28" rx="4" fill="#EF4444"/>
      <path d="M4 14l20 12 20-12" stroke="white" strokeWidth="2.5" fill="none"/>
      <path d="M4 38l14-12M44 38L30 26" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
    </svg>
  );
}

function AnalyticsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="6" y="28" width="8" height="14" rx="2" fill="#818CF8"/>
      <rect x="20" y="18" width="8" height="24" rx="2" fill="#6366F1"/>
      <rect x="34" y="8" width="8" height="34" rx="2" fill="#4F46E5"/>
      <path d="M10 26l10-8 10 4 10-14" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="26" r="2.5" fill="#4F46E5"/>
      <circle cx="20" cy="18" r="2.5" fill="#4F46E5"/>
      <circle cx="30" cy="22" r="2.5" fill="#4F46E5"/>
      <circle cx="40" cy="8" r="2.5" fill="#4F46E5"/>
    </svg>
  );
}

function NotionLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
      <path fill="currentColor" fillRule="evenodd" d="M8.7 5.3c1.5 1.2 2.1 1.1 4.9.9l26.7-1.6c.6 0 .1-.6-.1-.7L37.5 2c-.8-.6-1.9-1.3-3.9-1.1L7.7 3c-.9.1-1.1.6-.7 1l1.7 1.3zM10.3 12v28.1c0 1.5.8 2.1 2.5 2l29.3-1.7c1.7-.1 1.9-1.1 1.9-2.3V11.1c0-1.2-.5-1.8-1.5-1.7l-30.6 1.8c-1.1.1-1.6.6-1.6 1.8zm28.9 1.4c.2.8 0 1.6-.8 1.7l-1.5.3v20.7c-1.3.7-2.5.7-3.4.1-.8-.6-1.5-2-1.5-2l-9.9-15.5v15l3.1.7s0 1.6-2.2 1.6l-6.1.4c-.2-.4 0-1.3.6-1.5l1.6-.4V18.1l-2.3-.2c-.2-.8.2-2 1.3-2.1l6.5-.4 10.3 15.8V16.8l-2.6-.3c-.2-1 .5-1.7 1.5-1.8l6.4-.3z"/>
    </svg>
  );
}

// ─── Types & Data ──────────────────────────────────────────────────────────────

type IntegrationStatus = 'available' | 'connected' | 'coming_soon';
type IntegrationCategory = 'communication' | 'development' | 'productivity' | 'analytics';

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: React.FC<{ className?: string }>;
  category: IntegrationCategory;
  status: IntegrationStatus;
  popular?: boolean;
  features: string[];
  setupSteps: string[];
  docsUrl: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send task notifications, daily standups, and project updates directly to Slack channels.',
    logo: SlackLogo,
    category: 'communication',
    status: 'available',
    popular: true,
    features: ['Task notifications in channels', 'Channel mapping per project', 'Slash commands (/onekof)', 'Daily standup digests'],
    setupSteps: ['Connect your Slack workspace', 'Map channels to projects', 'Configure notification rules', 'Enable slash commands'],
    docsUrl: '#',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link pull requests to tasks, auto-update task status on merge, and track code changes.',
    logo: GitHubLogo,
    category: 'development',
    status: 'available',
    popular: true,
    features: ['PR ↔ task linking', 'Auto status on merge', 'Branch tracking per task', 'Code review sync'],
    setupSteps: ['Install the Onekof GitHub App', 'Select repositories', 'Map branches to projects', 'Configure auto-linking'],
    docsUrl: '#',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Sync with Google Calendar, Drive, and Gmail for seamless productivity.',
    logo: GoogleLogo,
    category: 'productivity',
    status: 'available',
    popular: true,
    features: ['Calendar ↔ deadline sync', 'Drive file attachments', 'Gmail notifications', 'Google Meet links on tasks'],
    setupSteps: ['Sign in with Google', 'Grant workspace permissions', 'Choose sync preferences', 'Map calendars to projects'],
    docsUrl: '#',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Collaborate through Teams notifications, tab integration, and meeting scheduling.',
    logo: TeamsLogo,
    category: 'communication',
    status: 'coming_soon',
    features: ['Chat notifications', 'Meeting scheduling', 'Teams tab integration', 'Bot commands'],
    setupSteps: ['Install the Onekof Teams app', 'Configure notifications', 'Add Onekof tab to channels', 'Set up bot commands'],
    docsUrl: '#',
  },
  {
    id: 'jira',
    name: 'Jira Import',
    description: 'Import existing projects, issues, and workflows from Jira into Onekof.',
    logo: JiraLogo,
    category: 'productivity',
    status: 'available',
    features: ['Full project import', 'Issue & subtask migration', 'Status & workflow mapping', 'User matching'],
    setupSteps: ['Connect to Jira Cloud', 'Select projects to import', 'Map statuses & fields', 'Review and confirm import'],
    docsUrl: '#',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Send real-time event data to any external service via HTTP webhooks.',
    logo: WebhookLogo,
    category: 'development',
    status: 'available',
    features: ['Custom event triggers', 'Retry with backoff', 'Payload templates', 'Delivery logs & debugging'],
    setupSteps: ['Add a webhook endpoint URL', 'Select events to subscribe', 'Configure payload format', 'Test and activate'],
    docsUrl: '#',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync task deadlines and milestones with Google Calendar for scheduling.',
    logo: GoogleCalendarLogo,
    category: 'productivity',
    status: 'available',
    features: ['Due date → calendar event', 'Milestone sync', 'Two-way updates', 'Team calendar view'],
    setupSteps: ['Sign in with Google', 'Select calendars', 'Choose sync direction', 'Set default reminders'],
    docsUrl: '#',
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Configure email digests, assignment alerts, and comment notifications.',
    logo: EmailLogo,
    category: 'communication',
    status: 'available',
    features: ['Daily/weekly digest', 'Assignment alerts', 'Comment reply notifications', 'Custom filter rules'],
    setupSteps: ['Choose notification types', 'Set digest frequency', 'Configure filter rules', 'Add recipient overrides'],
    docsUrl: '#',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Export project data to BI tools like Tableau or Power BI for reporting.',
    logo: AnalyticsLogo,
    category: 'analytics',
    status: 'coming_soon',
    features: ['CSV/JSON data export', 'Custom report builder', 'REST API access', 'Embeddable dashboards'],
    setupSteps: ['Enable analytics module', 'Configure data sources', 'Build report templates', 'Set up scheduled exports'],
    docsUrl: '#',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync documents and pages between Onekof and Notion workspaces.',
    logo: NotionLogo,
    category: 'productivity',
    status: 'coming_soon',
    features: ['Page ↔ task sync', 'Database import', 'Two-way linking', 'Template import'],
    setupSteps: ['Connect Notion workspace', 'Select databases to sync', 'Map fields', 'Enable auto-sync'],
    docsUrl: '#',
  },
];

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  communication: 'Communication',
  development: 'Development',
  productivity: 'Productivity',
  analytics: 'Analytics',
};

// ─── Page Component ────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');
  const [selected, setSelected] = useState<Integration | null>(null);

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
      <div className="flex h-full bg-white dark:bg-[#1B1F23]">
        {/* Main list */}
        <div className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-300',
          selected ? 'lg:mr-[420px]' : ''
        )}>
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                  <Puzzle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Integrations</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your favorite tools &middot; {INTEGRATIONS.filter(i => i.status !== 'coming_soon').length} available
                  </p>
                </div>
              </div>
            </div>

            {/* Search + filters */}
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
                {(['all', ...Object.keys(CATEGORY_LABELS)] as (IntegrationCategory | 'all')[]).map(key => (
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
                    {key === 'all' ? 'All' : CATEGORY_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {popular.length > 0 && (
              <IntegrationSection
                title="Popular"
                icon={<Star className="h-4 w-4 text-amber-500" />}
                integrations={popular}
                selected={selected}
                onSelect={setSelected}
              />
            )}

            {available.length > 0 && (
              <IntegrationSection
                title="Available"
                icon={<Zap className="h-4 w-4 text-primary-500" />}
                integrations={available}
                selected={selected}
                onSelect={setSelected}
              />
            )}

            {comingSoon.length > 0 && (
              <IntegrationSection
                title="Coming Soon"
                icon={<Clock className="h-4 w-4 text-slate-400" />}
                integrations={comingSoon}
                selected={selected}
                onSelect={setSelected}
              />
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No integrations match &quot;{search}&quot;</p>
              </div>
            )}

            {/* API section */}
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

        {/* Detail slide-out panel */}
        {selected && (
          <IntegrationDetailPanel
            integration={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

function IntegrationSection({
  title,
  icon,
  integrations,
  selected,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  integrations: Integration[];
  selected: Integration | null;
  onSelect: (i: Integration) => void;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isSelected={selected?.id === integration.id}
            onSelect={() => onSelect(integration)}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  isSelected,
  onSelect,
}: {
  integration: Integration;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isComingSoon = integration.status === 'coming_soon';
  const Logo = integration.logo;

  return (
    <button
      onClick={onSelect}
      disabled={false}
      className={cn(
        'group relative text-left rounded-xl border p-5 transition-all duration-200 w-full',
        'bg-white dark:bg-[#22272B]',
        isSelected
          ? 'border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/20 shadow-md'
          : isComingSoon
            ? 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-90'
            : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md',
      )}
    >
      <div className="flex items-start gap-3.5 mb-3">
        {/* Brand logo */}
        <div className="h-11 w-11 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 p-2">
          <Logo className="h-full w-full text-slate-900 dark:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{integration.name}</h3>
            {integration.popular && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          {isComingSoon ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Available
            </span>
          )}
        </div>
        <ChevronRight className={cn(
          'h-4 w-4 shrink-0 mt-1 transition-transform text-slate-400',
          isSelected ? 'text-primary-500 translate-x-0.5' : 'group-hover:translate-x-0.5'
        )} />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
        {integration.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {integration.features.slice(0, 3).map(feature => (
          <span key={feature} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
            {feature}
          </span>
        ))}
        {integration.features.length > 3 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">+{integration.features.length - 3}</span>
        )}
      </div>
    </button>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function IntegrationDetailPanel({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup'>('overview');
  const isComingSoon = integration.status === 'coming_soon';
  const Logo = integration.logo;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] z-40 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Panel header */}
      <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2.5">
              <Logo className="h-full w-full text-slate-900 dark:text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{integration.name}</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{integration.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'setup'
                ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            Setup Guide
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {integration.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Features</h3>
              <div className="space-y-2">
                {integration.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-slate-50 dark:bg-[#1B1F23]">
                    <CheckCircle2 className="h-4 w-4 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Status</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#1B1F23]">
                {isComingSoon ? (
                  <>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">In development — available soon</span>
                  </>
                ) : (
                  <>
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Ready to connect</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Setup Steps</h3>
              <div className="space-y-3">
                {integration.setupSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isComingSoon && (
              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
                <Settings2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configuration UI will appear here once connected
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-2">
        {isComingSoon ? (
          <Button variant="secondary" className="w-full gap-2 text-sm" disabled>
            <Clock className="h-4 w-4" />
            Coming Soon
          </Button>
        ) : (
          <>
            <Button className="w-full gap-2 text-sm">
              <ArrowRight className="h-4 w-4" />
              Connect {integration.name}
            </Button>
            <Button variant="outline" className="w-full gap-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              View Documentation
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
