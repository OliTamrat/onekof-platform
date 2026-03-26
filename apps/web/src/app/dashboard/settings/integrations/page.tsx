'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  AlertCircle,
  RefreshCw,
  Bell,
  BellOff,
  Unplug,
  GitBranch,
  GitPullRequest,
  Calendar,
  HardDrive,
  Hash,
  ToggleLeft,
  ToggleRight,
  Activity,
  Sparkles,
  UserCheck,
  MessageSquare,
  Rocket,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

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

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatusType = 'available' | 'connected' | 'coming_soon';
type IntegrationCategory = 'communication' | 'development' | 'productivity' | 'analytics';

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: React.FC<{ className?: string }>;
  category: IntegrationCategory;
  status: IntegrationStatusType;
  popular?: boolean;
  features: string[];
  setupSteps: string[];
  docsUrl: string;
  provider?: 'slack' | 'github' | 'google' | 'microsoft-teams' | 'webhooks' | 'email' | 'google-calendar' | 'jira';
}

interface ConnectionData {
  id: string;
  status: string;
  externalAccountName: string | null;
  configuration: any;
  metadata: any;
  connectedAt: string;
}

interface IntegrationEvent {
  id: string;
  connectionId: string;
  type: string;
  direction: string;
  status: string;
  payload: any;
  createdAt: string;
}

// ─── Integration Definitions ──────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send task notifications, daily standups, and project updates directly to Slack channels.',
    logo: SlackLogo,
    category: 'communication',
    status: 'available',
    popular: true,
    provider: 'slack',
    features: ['Task notifications in channels', 'Channel mapping per project', 'Slash commands (/onekof)', 'Daily standup digests'],
    setupSteps: ['Click "Connect Slack" to authorize', 'Select a default notification channel', 'Configure which events trigger notifications', 'Optionally map channels to specific projects'],
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
    provider: 'github',
    features: ['PR ↔ task linking', 'Auto status on merge', 'Branch tracking per task', 'Code review sync'],
    setupSteps: ['Click "Connect GitHub" to authorize', 'Select repositories to sync', 'Configure auto-linking rules', 'Set up webhook for real-time updates'],
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
    provider: 'google',
    features: ['Calendar ↔ deadline sync', 'Drive file attachments', 'Gmail notifications', 'Google Meet links on tasks'],
    setupSteps: ['Click "Connect Google" to sign in', 'Grant calendar and drive permissions', 'Select calendars to sync', 'Choose sync direction (one-way or two-way)'],
    docsUrl: '#',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Collaborate through Teams notifications, tab integration, and meeting scheduling.',
    logo: TeamsLogo,
    category: 'communication',
    status: 'available',
    provider: 'microsoft-teams',
    features: ['Chat notifications', 'Meeting scheduling', 'Teams tab integration', 'Bot commands'],
    setupSteps: ['Click "Connect Teams" to sign in with Microsoft', 'Select a team and channel', 'Configure which events trigger notifications', 'Optionally map channels to specific projects'],
    docsUrl: '#',
  },
  {
    id: 'jira',
    name: 'Jira Import',
    description: 'Import existing projects, issues, and workflows from Jira into Onekof.',
    logo: JiraLogo,
    category: 'productivity',
    status: 'available',
    provider: 'jira',
    features: ['Full project import', 'Issue & subtask migration', 'Status & workflow mapping', 'User matching'],
    setupSteps: ['Click "Connect Jira" to authorize with Atlassian', 'Select projects to import', 'Map statuses & fields', 'Review and confirm import'],
    docsUrl: '#',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Send real-time event data to any external service via HTTP webhooks.',
    logo: WebhookLogo,
    category: 'development',
    status: 'available',
    provider: 'webhooks',
    features: ['Custom event triggers', 'Retry with backoff', 'Payload templates', 'Delivery logs & debugging'],
    setupSteps: ['Click "Enable Webhooks" to activate', 'Add a webhook endpoint URL', 'Select events to subscribe', 'Test and activate'],
    docsUrl: '#',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync task deadlines and milestones with Google Calendar for scheduling.',
    logo: GoogleCalendarLogo,
    category: 'productivity',
    status: 'available',
    provider: 'google-calendar',
    features: ['Due date → calendar event', 'Milestone sync', 'Two-way updates', 'Team calendar view'],
    setupSteps: ['Click "Connect Google Calendar" to sign in', 'Select calendars to sync', 'Choose sync direction', 'Set default reminders'],
    docsUrl: '#',
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Configure email digests, assignment alerts, and comment notifications.',
    logo: EmailLogo,
    category: 'communication',
    status: 'available',
    provider: 'email',
    features: ['Daily/weekly digest', 'Assignment alerts', 'Comment reply notifications', 'Custom filter rules'],
    setupSteps: ['Click "Enable Email Notifications" to activate', 'Choose notification types', 'Set digest frequency', 'Add recipient overrides'],
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
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');
  const [selected, setSelected] = useState<Integration | null>(null);
  const [connections, setConnections] = useState<Record<string, ConnectionData>>({});
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations');
      if (res.ok) {
        const data = await res.json();
        const connMap: Record<string, ConnectionData> = {};
        for (const conn of data.connections || []) {
          connMap[conn.provider] = conn;
        }
        setConnections(connMap);
        setEvents(data.recentEvents || []);
      }
    } catch {
      // Silent fail on fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();

    // Check for callback params
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');

    if (connected) {
      setToast({ message: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`, type: 'success' });
      window.history.replaceState({}, '', window.location.pathname);
      fetchConnections();
    } else if (error) {
      setToast({ message: `Connection error: ${error}`, type: 'error' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchConnections]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast]);

  const handleConnect = async (integration: Integration) => {
    if (!integration.provider) return;
    setConnecting(integration.provider);

    try {
      const res = await fetch(`/api/integrations/${integration.provider}?action=oauth_url`);
      if (!res.ok) throw new Error('Failed to get OAuth URL');
      const data = await res.json();
      const url = data.url;
      // Direct activation integrations (webhooks, email) return relative URLs
      if (url.startsWith('/')) {
        setToast({ message: `${integration.name} enabled successfully!`, type: 'success' });
        setConnecting(null);
        await fetchConnections();
      } else {
        window.location.href = url;
      }
    } catch (err) {
      setToast({ message: `Failed to connect ${integration.name}`, type: 'error' });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!integration.provider) return;
    setDisconnecting(integration.provider);

    try {
      const res = await fetch(`/api/integrations/${integration.provider}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setToast({ message: `${integration.name} disconnected`, type: 'success' });
      await fetchConnections();
      if (selected?.id === integration.id) setSelected(null);
    } catch {
      setToast({ message: `Failed to disconnect ${integration.name}`, type: 'error' });
    } finally {
      setDisconnecting(null);
    }
  };

  // Merge live connection status into integration list
  const integrationsWithStatus = INTEGRATIONS.map(i => {
    if (i.provider && connections[i.provider]) {
      return { ...i, status: 'connected' as IntegrationStatusType };
    }
    return i;
  });

  const filtered = integrationsWithStatus.filter(i => {
    const matchesSearch = !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const connectedList = filtered.filter(i => i.status === 'connected');
  const popular = filtered.filter(i => i.popular && i.status !== 'connected');
  const available = filtered.filter(i => i.status === 'available' && !i.popular);
  const comingSoon = filtered.filter(i => i.status === 'coming_soon');

  const connectedCount = Object.keys(connections).length;

  return (
    <AppLayout>
      <div className="flex h-full bg-white dark:bg-[#1B1F23]">
        {/* Toast */}
        {toast && (
          <div className={cn(
            'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 duration-200',
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          )}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <Button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

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
                    {connectedCount > 0 && <span className="text-primary-500 font-medium">{connectedCount} connected</span>}
                    {connectedCount > 0 && ' · '}
                    {INTEGRATIONS.filter(i => i.provider).length} available · {INTEGRATIONS.filter(i => i.status === 'coming_soon').length} coming soon
                  </p>
                </div>
              </div>
              {connectedCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fetchConnections()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              )}
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
                  <Button
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
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                <span className="ml-2 text-sm text-slate-500">Loading integrations...</span>
              </div>
            ) : (
              <>
                {connectedList.length > 0 && (
                  <IntegrationSection
                    title="Connected"
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    integrations={connectedList}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {popular.length > 0 && (
                  <IntegrationSection
                    title="Popular"
                    icon={<Star className="h-4 w-4 text-amber-500" />}
                    integrations={popular}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {available.length > 0 && (
                  <IntegrationSection
                    title="Available"
                    icon={<Zap className="h-4 w-4 text-primary-500" />}
                    integrations={available}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {comingSoon.length > 0 && (
                  <IntegrationSection
                    title="Coming Soon"
                    icon={<Clock className="h-4 w-4 text-slate-400" />}
                    integrations={comingSoon}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
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
              </>
            )}
          </div>
        </div>

        {/* Detail slide-out panel */}
        {selected && (
          <IntegrationDetailPanel
            integration={selected}
            connection={selected.provider ? connections[selected.provider] : undefined}
            events={events.filter(e => {
              if (!selected.provider) return false;
              const conn = connections[selected.provider];
              return conn && e.connectionId === conn.id;
            })}
            onClose={() => setSelected(null)}
            onConnect={() => handleConnect(selected)}
            onDisconnect={() => handleDisconnect(selected)}
            connecting={connecting === selected.provider}
            disconnecting={disconnecting === selected.provider}
            onConfigUpdate={fetchConnections}
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
  connections,
}: {
  title: string;
  icon: React.ReactNode;
  integrations: Integration[];
  selected: Integration | null;
  onSelect: (i: Integration) => void;
  connections: Record<string, ConnectionData>;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-4">
        {icon}
        {title}
        <span className="text-xs font-normal text-slate-400">({integrations.length})</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isSelected={selected?.id === integration.id}
            onSelect={() => onSelect(integration)}
            connection={integration.provider ? connections[integration.provider] : undefined}
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
  connection,
}: {
  integration: Integration;
  isSelected: boolean;
  onSelect: () => void;
  connection?: ConnectionData;
}) {
  const isComingSoon = integration.status === 'coming_soon';
  const isConnected = !!connection;
  const Logo = integration.logo;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative text-left rounded-xl border p-5 transition-all duration-200 w-full h-auto overflow-hidden',
        'bg-white dark:bg-[#22272B]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:ring-offset-[#1B1F23]',
        isSelected
          ? 'border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/20 shadow-md'
          : isComingSoon
            ? 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-90'
            : isConnected
              ? 'border-emerald-300 dark:border-emerald-700 hover:shadow-md'
              : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md',
      )}
    >
      {/* Connected indicator line */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-primary-500 rounded-t-xl" />
      )}

      <div className="flex items-start gap-3.5 mb-3">
        <div className="h-11 w-11 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 p-2">
          <Logo className="h-full w-full text-slate-900 dark:text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{integration.name}</h3>
            {integration.popular && !isConnected && (
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
              {connection.externalAccountName && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                  {connection.externalAccountName}
                </span>
              )}
            </div>
          ) : isComingSoon ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              Coming Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Zap className="h-3 w-3" />
              Ready to connect
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

      <div className="flex flex-wrap gap-1.5 overflow-hidden">
        {integration.features.slice(0, 2).map(feature => (
          <span key={feature} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded truncate max-w-[160px]">
            {feature}
          </span>
        ))}
        {integration.features.length > 2 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">+{integration.features.length - 2}</span>
        )}
      </div>
    </button>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────────────

function IntegrationDetailPanel({
  integration,
  connection,
  events,
  onClose,
  onConnect,
  onDisconnect,
  connecting,
  disconnecting,
  onConfigUpdate,
}: {
  integration: Integration;
  connection?: ConnectionData;
  events: IntegrationEvent[];
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  connecting: boolean;
  disconnecting: boolean;
  onConfigUpdate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'activity'>('overview');
  const isComingSoon = integration.status === 'coming_soon';
  const isConnected = !!connection;
  const Logo = integration.logo;

  // Reset tab if not connected
  useEffect(() => {
    if (!isConnected && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [isConnected, activeTab]);

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
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{integration.category}</span>
                {isConnected && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <Button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            Overview
          </Button>
          {isConnected && (
            <>
              <Button
                onClick={() => setActiveTab('config')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeTab === 'config'
                    ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                Configure
              </Button>
              <Button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeTab === 'activity'
                    ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                Activity
              </Button>
            </>
          )}
          {!isConnected && (
            <Button
              onClick={() => setActiveTab('config')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeTab === 'config'
                  ? 'bg-white dark:bg-[#282E33] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              Setup Guide
            </Button>
          )}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' ? (
          <OverviewTab integration={integration} connection={connection} />
        ) : activeTab === 'config' ? (
          isConnected ? (
            <ConfigTab integration={integration} connection={connection} onUpdate={onConfigUpdate} />
          ) : (
            <SetupGuideTab integration={integration} isComingSoon={isComingSoon} />
          )
        ) : (
          <ActivityTab events={events} />
        )}
      </div>

      {/* Panel footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-2">
        {isComingSoon ? (
          <Button variant="secondary" className="w-full gap-2 text-sm" disabled>
            <Clock className="h-4 w-4" />
            Coming Soon
          </Button>
        ) : isConnected ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
              onClick={onDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
              Disconnect
            </Button>
            <Button variant="outline" className="flex-1 gap-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              Documentation
            </Button>
          </div>
        ) : (
          <>
            <Button
              className="w-full gap-2 text-sm"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {connecting ? 'Connecting...' : `Connect ${integration.name}`}
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

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ integration, connection }: { integration: Integration; connection?: ConnectionData }) {
  return (
    <div className="space-y-6">
      {/* Connection info */}
      {connection && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
          </div>
          <div className="space-y-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            {connection.externalAccountName && (
              <div className="flex justify-between">
                <span>Account</span>
                <span className="font-medium">{connection.externalAccountName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Connected</span>
              <span className="font-medium">{new Date(connection.connectedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium capitalize">{connection.status}</span>
            </div>
          </div>
        </div>
      )}

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
      {!connection && (
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Status</h3>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#1B1F23]">
            {integration.status === 'coming_soon' ? (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-sm text-slate-600 dark:text-slate-400">In development — available soon</span>
              </>
            ) : (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Ready to connect</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Setup Guide Tab ───────────────────────────────────────────────────────────

function SetupGuideTab({ integration, isComingSoon }: { integration: Integration; isComingSoon: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Setup Steps</h3>
        <div className="space-y-3">
          {integration.setupSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environment variables needed */}
      {integration.provider && (
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Required Configuration</h3>
          <div className="rounded-lg bg-slate-900 dark:bg-[#1B1F23] p-4 text-xs font-mono space-y-1">
            {integration.provider === 'slack' && (
              <>
                <div className="text-slate-400"># Slack App credentials</div>
                <div><span className="text-emerald-400">SLACK_CLIENT_ID</span>=<span className="text-slate-500">your-slack-client-id</span></div>
                <div><span className="text-emerald-400">SLACK_CLIENT_SECRET</span>=<span className="text-slate-500">your-slack-client-secret</span></div>
                <div><span className="text-emerald-400">SLACK_SIGNING_SECRET</span>=<span className="text-slate-500">your-signing-secret</span></div>
              </>
            )}
            {integration.provider === 'github' && (
              <>
                <div className="text-slate-400"># GitHub App credentials</div>
                <div><span className="text-emerald-400">GITHUB_APP_CLIENT_ID</span>=<span className="text-slate-500">your-github-app-id</span></div>
                <div><span className="text-emerald-400">GITHUB_APP_CLIENT_SECRET</span>=<span className="text-slate-500">your-github-secret</span></div>
                <div><span className="text-emerald-400">GITHUB_WEBHOOK_SECRET</span>=<span className="text-slate-500">your-webhook-secret</span></div>
              </>
            )}
            {integration.provider === 'google' && (
              <>
                <div className="text-slate-400"># Google OAuth (uses existing config)</div>
                <div><span className="text-emerald-400">GOOGLE_CLIENT_ID</span>=<span className="text-slate-500">your-google-client-id</span></div>
                <div><span className="text-emerald-400">GOOGLE_CLIENT_SECRET</span>=<span className="text-slate-500">your-google-secret</span></div>
                <div><span className="text-emerald-400">GOOGLE_INTEGRATION_REDIRECT_URI</span>=<span className="text-slate-500">callback-url</span></div>
              </>
            )}
          </div>
        </div>
      )}

      {isComingSoon && (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
          <Settings2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This integration is under development
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Config Tab ────────────────────────────────────────────────────────────────

function ConfigTab({
  integration,
  connection,
  onUpdate,
}: {
  integration: Integration;
  connection?: ConnectionData;
  onUpdate: () => void;
}) {
  const [saving, setSaving] = useState(false);

  if (!connection || !integration.provider) return null;

  const config = connection.configuration;

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true);
    try {
      if (integration.provider === 'slack' && key.startsWith('notifications.')) {
        const notifKey = key.replace('notifications.', '');
        await fetch(`/api/integrations/slack`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifications: { [notifKey]: value } }),
        });
      } else {
        await fetch(`/api/integrations/${integration.provider}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        });
      }
      onUpdate();
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slack Config */}
      {integration.provider === 'slack' && config && (
        <>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Workspace
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#1B1F23] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Team</span>
                <span className="font-medium text-slate-900 dark:text-white">{config.teamName}</span>
              </div>
              {config.defaultChannelName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Default channel</span>
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <Hash className="h-3 w-3" />{config.defaultChannelName}
                  </span>
                </div>
              )}
              {config.channels?.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Available channels</span>
                  <span className="font-medium text-slate-900 dark:text-white">{config.channels.length}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              Notification Rules
            </h3>
            <div className="space-y-1">
              {([
                { key: 'taskCreated', label: 'Task created', icon: Sparkles },
                { key: 'taskCompleted', label: 'Task completed', icon: CheckCircle2 },
                { key: 'taskAssigned', label: 'Task assigned', icon: UserCheck },
                { key: 'commentAdded', label: 'Comment added', icon: MessageSquare },
                { key: 'projectUpdated', label: 'Project updated', icon: Rocket },
                { key: 'dailyDigest', label: 'Daily digest', icon: ClipboardList },
              ] as { key: string; label: string; icon: LucideIcon }[]).map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  icon={<item.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                  enabled={config.notifications?.[item.key] ?? false}
                  onChange={v => handleToggle(`notifications.${item.key}`, v)}
                  disabled={saving}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* GitHub Config */}
      {integration.provider === 'github' && config && (
        <>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#1B1F23] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Account</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <GitBranch className="h-3 w-3" />
                  {config.accountLogin}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Type</span>
                <span className="font-medium text-slate-900 dark:text-white">{config.accountType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Repositories</span>
                <span className="font-medium text-slate-900 dark:text-white">{config.repositories?.length || 0}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitPullRequest className="h-3.5 w-3.5" />
              Automation
            </h3>
            <div className="space-y-1">
              <ToggleRow
                label="Auto-link PRs to tasks"
                description="Match task keys (e.g., PROJ-123) in PR titles and descriptions"
                enabled={config.autoLinkPRs ?? true}
                onChange={v => handleToggle('autoLinkPRs', v)}
                disabled={saving}
              />
              <ToggleRow
                label="Auto-close on merge"
                description="Mark linked tasks as done when PR is merged"
                enabled={config.autoCloseOnMerge ?? true}
                onChange={v => handleToggle('autoCloseOnMerge', v)}
                disabled={saving}
              />
            </div>
          </div>

          {config.repositories?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Repositories ({config.repositories.length})
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {config.repositories.slice(0, 20).map((repo: any) => (
                  <div key={repo.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-slate-50 dark:bg-[#1B1F23] text-sm">
                    <GitBranch className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{repo.fullName}</span>
                    {repo.private && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">private</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Google Config */}
      {integration.provider === 'google' && config && (
        <>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#1B1F23] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Email</span>
                <span className="font-medium text-slate-900 dark:text-white">{config.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Sync direction</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">{config.syncDirection?.replace('_', '-')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" />
              Sync Settings
            </h3>
            <div className="space-y-1">
              <ToggleRow
                label="Calendar sync"
                description="Sync task deadlines to Google Calendar"
                enabled={config.calendarSync ?? true}
                onChange={v => handleToggle('calendarSync', v)}
                disabled={saving}
                icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
              />
              <ToggleRow
                label="Drive sync"
                description="Attach Google Drive files to tasks"
                enabled={config.driveSync ?? true}
                onChange={v => handleToggle('driveSync', v)}
                disabled={saving}
                icon={<HardDrive className="h-3.5 w-3.5 text-green-500" />}
              />
            </div>
          </div>

          {config.selectedCalendars?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Calendars ({config.selectedCalendars.length})
              </h3>
              <div className="space-y-1">
                {config.selectedCalendars.map((cal: any) => (
                  <div key={cal.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-slate-50 dark:bg-[#1B1F23] text-sm">
                    <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{cal.summary}</span>
                    {cal.primary && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Activity Tab ──────────────────────────────────────────────────────────────

function ActivityTab({ events }: { events: IntegrationEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Events will appear here as the integration is used</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
        Recent Events
      </h3>
      {events.map(event => (
        <div key={event.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-[#1B1F23]">
          <div className={cn(
            'mt-1 h-2 w-2 rounded-full shrink-0',
            event.status === 'success' ? 'bg-emerald-500' : event.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {event.type}
            </p>
            <p className="text-[10px] text-slate-400">
              {event.direction === 'inbound' ? '← Received' : '→ Sent'} · {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={cn(
            'text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0',
            event.status === 'success'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
              : event.status === 'failed'
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
          )}>
            {event.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1B1F23] transition-colors text-left disabled:opacity-50"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon}
        <div className="min-w-0">
          <span className="text-sm text-slate-700 dark:text-slate-300 block truncate">{label}</span>
          {description && (
            <span className="text-[10px] text-slate-400 block truncate">{description}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 ml-3">
        {enabled ? (
          <ToggleRight className="h-5 w-5 text-primary-500" />
        ) : (
          <ToggleLeft className="h-5 w-5 text-slate-300 dark:text-slate-600" />
        )}
      </div>
    </Button>
  );
}
