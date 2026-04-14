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
  descriptionKey: string;
  logo: React.FC<{ className?: string }>;
  category: IntegrationCategory;
  status: IntegrationStatusType;
  popular?: boolean;
  featureKeys: string[];
  setupStepKeys: string[];
  docsUrl: string;
  provider?: 'slack' | 'github' | 'google' | 'microsoft-teams' | 'webhooks' | 'email' | 'google-calendar' | 'jira';
}

interface ConnectionData {
  id: string;
  status: string;
  externalAccountName: string | null;
  configuration: Record<string, unknown>;
  metadata: Record<string, unknown>;
  connectedAt: string;
}

interface IntegrationEvent {
  id: string;
  connectionId: string;
  type: string;
  direction: string;
  status: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ─── Integration Definitions ──────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    descriptionKey: 'integrationSlackDesc',
    logo: SlackLogo,
    category: 'communication',
    status: 'available',
    popular: true,
    provider: 'slack',
    featureKeys: ['featureSlack1', 'featureSlack2', 'featureSlack3', 'featureSlack4'],
    setupStepKeys: ['setupSlack1', 'setupSlack2', 'setupSlack3', 'setupSlack4'],
    docsUrl: '#',
  },
  {
    id: 'github',
    name: 'GitHub',
    descriptionKey: 'integrationGithubDesc',
    logo: GitHubLogo,
    category: 'development',
    status: 'available',
    popular: true,
    provider: 'github',
    featureKeys: ['featureGithub1', 'featureGithub2', 'featureGithub3', 'featureGithub4'],
    setupStepKeys: ['setupGithub1', 'setupGithub2', 'setupGithub3', 'setupGithub4'],
    docsUrl: '#',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    descriptionKey: 'integrationGoogleWorkspaceDesc',
    logo: GoogleLogo,
    category: 'productivity',
    status: 'available',
    popular: true,
    provider: 'google',
    featureKeys: ['featureGoogle1', 'featureGoogle2', 'featureGoogle3', 'featureGoogle4'],
    setupStepKeys: ['setupGoogle1', 'setupGoogle2', 'setupGoogle3', 'setupGoogle4'],
    docsUrl: '#',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    descriptionKey: 'integrationMicrosoftTeamsDesc',
    logo: TeamsLogo,
    category: 'communication',
    status: 'available',
    provider: 'microsoft-teams',
    featureKeys: ['featureTeams1', 'featureTeams2', 'featureTeams3', 'featureTeams4'],
    setupStepKeys: ['setupTeams1', 'setupTeams2', 'setupTeams3', 'setupTeams4'],
    docsUrl: '#',
  },
  {
    id: 'jira',
    name: 'Jira Import',
    descriptionKey: 'integrationJiraDesc',
    logo: JiraLogo,
    category: 'productivity',
    status: 'available',
    provider: 'jira',
    featureKeys: ['featureJira1', 'featureJira2', 'featureJira3', 'featureJira4'],
    setupStepKeys: ['setupJira1', 'setupJira2', 'setupJira3', 'setupJira4'],
    docsUrl: '#',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    descriptionKey: 'integrationWebhooksDesc',
    logo: WebhookLogo,
    category: 'development',
    status: 'available',
    provider: 'webhooks',
    featureKeys: ['featureWebhooks1', 'featureWebhooks2', 'featureWebhooks3', 'featureWebhooks4'],
    setupStepKeys: ['setupWebhooks1', 'setupWebhooks2', 'setupWebhooks3', 'setupWebhooks4'],
    docsUrl: '#',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    descriptionKey: 'integrationGoogleCalendarDesc',
    logo: GoogleCalendarLogo,
    category: 'productivity',
    status: 'available',
    provider: 'google-calendar',
    featureKeys: ['featureGoogleCalendar1', 'featureGoogleCalendar2', 'featureGoogleCalendar3', 'featureGoogleCalendar4'],
    setupStepKeys: ['setupGoogleCalendar1', 'setupGoogleCalendar2', 'setupGoogleCalendar3', 'setupGoogleCalendar4'],
    docsUrl: '#',
  },
  {
    id: 'email',
    name: 'Email Notifications',
    descriptionKey: 'integrationEmailDesc',
    logo: EmailLogo,
    category: 'communication',
    status: 'available',
    provider: 'email',
    featureKeys: ['featureEmail1', 'featureEmail2', 'featureEmail3', 'featureEmail4'],
    setupStepKeys: ['setupEmail1', 'setupEmail2', 'setupEmail3', 'setupEmail4'],
    docsUrl: '#',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    descriptionKey: 'integrationAnalyticsDesc',
    logo: AnalyticsLogo,
    category: 'analytics',
    status: 'coming_soon',
    featureKeys: ['featureAnalytics1', 'featureAnalytics2', 'featureAnalytics3', 'featureAnalytics4'],
    setupStepKeys: ['setupAnalytics1', 'setupAnalytics2', 'setupAnalytics3', 'setupAnalytics4'],
    docsUrl: '#',
  },
  {
    id: 'notion',
    name: 'Notion',
    descriptionKey: 'integrationNotionDesc',
    logo: NotionLogo,
    category: 'productivity',
    status: 'coming_soon',
    featureKeys: ['featureNotion1', 'featureNotion2', 'featureNotion3', 'featureNotion4'],
    setupStepKeys: ['setupNotion1', 'setupNotion2', 'setupNotion3', 'setupNotion4'],
    docsUrl: '#',
  },
];

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
      const name = connected.charAt(0).toUpperCase() + connected.slice(1);
      setToast({ message: t('integrationsPage.toastConnectedSuccess').replace('{name}', name), type: 'success' });
      window.history.replaceState({}, '', window.location.pathname);
      fetchConnections();
    } else if (error) {
      setToast({ message: t('integrationsPage.toastConnectionError').replace('{error}', error), type: 'error' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchConnections, t]);

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
        setToast({ message: t('integrationsPage.toastEnabledSuccess').replace('{name}', integration.name), type: 'success' });
        setConnecting(null);
        await fetchConnections();
      } else {
        window.location.href = url;
      }
    } catch {
      setToast({ message: t('integrationsPage.toastConnectFailed').replace('{name}', integration.name), type: 'error' });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!integration.provider) return;
    setDisconnecting(integration.provider);

    try {
      const res = await fetch(`/api/integrations/${integration.provider}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setToast({ message: t('integrationsPage.toastDisconnected').replace('{name}', integration.name), type: 'success' });
      await fetchConnections();
      if (selected?.id === integration.id) setSelected(null);
    } catch {
      setToast({ message: t('integrationsPage.toastDisconnectFailed').replace('{name}', integration.name), type: 'error' });
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
    const description = t(`integrationsPage.${i.descriptionKey}`);
    const matchesSearch = !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const connectedList = filtered.filter(i => i.status === 'connected');
  const popular = filtered.filter(i => i.popular && i.status !== 'connected');
  const available = filtered.filter(i => i.status === 'available' && !i.popular);
  const comingSoon = filtered.filter(i => i.status === 'coming_soon');

  const connectedCount = Object.keys(connections).length;

  const categoryFilterLabels: Record<IntegrationCategory | 'all', string> = {
    all: t('integrationsPage.filterAll'),
    communication: t('integrationsPage.filterCommunication'),
    development: t('integrationsPage.filterDevelopment'),
    productivity: t('integrationsPage.filterProductivity'),
    analytics: t('integrationsPage.filterAnalytics'),
  };

  return (
    <AppLayout>
      <div className="flex h-full bg-white dark:bg-[#0B0E11]">
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
          <div className="border-b border-slate-200 dark:border-white/[0.08] bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center shadow-sm">
                  <Puzzle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{t('integrationsPage.title')}</h1>
                  <p className="text-xs text-white/30 dark:text-white/50">
                    {connectedCount > 0 && (
                      <span className="text-[#1C8C7D] font-medium">
                        {t('integrationsPage.connectedCount').replace('{count}', String(connectedCount))}
                      </span>
                    )}
                    {connectedCount > 0 && ' · '}
                    {t('integrationsPage.availableCount').replace('{count}', String(INTEGRATIONS.filter(i => i.provider).length))}
                    {' · '}
                    {t('integrationsPage.comingSoonCount').replace('{count}', String(INTEGRATIONS.filter(i => i.status === 'coming_soon').length))}
                  </p>
                </div>
              </div>
              {connectedCount > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fetchConnections()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('integrationsPage.refresh')}
                </Button>
              )}
            </div>

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder={t('integrationsPage.searchPlaceholder')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'communication', 'development', 'productivity', 'analytics'] as (IntegrationCategory | 'all')[]).map(key => (
                  <Button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                      categoryFilter === key
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-[#181D23] text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {categoryFilterLabels[key]}
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
                <span className="ml-2 text-sm text-white/30">{t('integrationsPage.loadingIntegrations')}</span>
              </div>
            ) : (
              <>
                {connectedList.length > 0 && (
                  <IntegrationSection
                    title={t('integrationsPage.sectionConnected')}
                    icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    integrations={connectedList}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {popular.length > 0 && (
                  <IntegrationSection
                    title={t('integrationsPage.sectionPopular')}
                    icon={<Star className="h-4 w-4 text-amber-500" />}
                    integrations={popular}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {available.length > 0 && (
                  <IntegrationSection
                    title={t('integrationsPage.sectionAvailable')}
                    icon={<Zap className="h-4 w-4 text-primary-500" />}
                    integrations={available}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {comingSoon.length > 0 && (
                  <IntegrationSection
                    title={t('integrationsPage.sectionComingSoon')}
                    icon={<Clock className="h-4 w-4 text-white/50" />}
                    integrations={comingSoon}
                    selected={selected}
                    onSelect={setSelected}
                    connections={connections}
                  />
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-white/30 dark:text-white/50">
                      {t('integrationsPage.noMatch').replace('{search}', search)}
                    </p>
                  </div>
                )}

                {/* API section */}
                <section>
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-gradient-to-r from-slate-50 to-white dark:from-[#12161B] dark:to-[#0B0E11] p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-slate-100 dark:bg-[#181D23] p-3">
                        <Shield className="h-6 w-6 text-slate-600 dark:text-white/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                          {t('integrationsPage.buildCustomTitle')}
                        </h3>
                        <p className="text-xs text-white/30 dark:text-white/50 leading-relaxed mb-3">
                          {t('integrationsPage.buildCustomDesc')}
                        </p>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            {t('integrationsPage.apiDocumentation')}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Zap className="h-3.5 w-3.5" />
                            {t('integrationsPage.webhookGuide')}
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
        <span className="text-xs font-normal text-white/50">({integrations.length})</span>
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
  const { t } = useLanguage();
  const isComingSoon = integration.status === 'coming_soon';
  const isConnected = !!connection;
  const Logo = integration.logo;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative text-left rounded-xl border p-5 transition-all duration-200 w-full h-auto overflow-hidden',
        'bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:ring-offset-[#0B0E11]',
        isSelected
          ? 'border-[#1C8C7D] dark:border-[#1C8C7D] ring-2 ring-[#1C8C7D]/20 shadow-md'
          : isComingSoon
            ? 'border-slate-200/60 dark:border-white/[0.08]/60 opacity-70 hover:opacity-90'
            : isConnected
              ? 'border-emerald-300/60 dark:border-emerald-700/60 hover:shadow-lg hover:border-[#1C8C7D]/40 hover:-translate-y-0.5'
              : 'border-slate-200/60 dark:border-white/[0.08]/60 hover:border-[#1C8C7D]/40 hover:shadow-lg hover:-translate-y-0.5',
      )}
    >
      {/* Connected indicator line */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-primary-500 rounded-t-xl" />
      )}

      <div className="flex items-start gap-3.5 mb-3">
        <div className="h-11 w-11 rounded-lg bg-slate-50 dark:bg-[#181D23] flex items-center justify-center shrink-0 p-2">
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
                {t('integrationsPage.statusConnected')}
              </span>
              {connection.externalAccountName && (
                <span className="text-[10px] text-white/50 dark:text-white/30 truncate max-w-[120px]">
                  {connection.externalAccountName}
                </span>
              )}
            </div>
          ) : isComingSoon ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-white/30 dark:bg-white/[0.08] dark:text-white/50">
              <Clock className="h-3 w-3" />
              {t('integrationsPage.statusComingSoon')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Zap className="h-3 w-3" />
              {t('integrationsPage.statusReadyToConnect')}
            </span>
          )}
        </div>
        <ChevronRight className={cn(
          'h-4 w-4 shrink-0 mt-1 transition-transform text-white/50',
          isSelected ? 'text-primary-500 translate-x-0.5' : 'group-hover:translate-x-0.5'
        )} />
      </div>

      <p className="text-xs text-white/30 dark:text-white/50 leading-relaxed mb-3 line-clamp-2">
        {t(`integrationsPage.${integration.descriptionKey}`)}
      </p>

      <div className="flex flex-wrap gap-1.5 overflow-hidden">
        {integration.featureKeys.slice(0, 2).map(key => (
          <span key={key} className="text-[10px] font-medium bg-slate-100 dark:bg-[#181D23] text-slate-600 dark:text-white/50 px-2 py-0.5 rounded truncate max-w-[160px]">
            {t(`integrationsPage.${key}`)}
          </span>
        ))}
        {integration.featureKeys.length > 2 && (
          <span className="text-[10px] text-white/50 dark:text-white/30 shrink-0">+{integration.featureKeys.length - 2}</span>
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
  const { t } = useLanguage();
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
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] z-40 border-l border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Panel header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-slate-50 dark:bg-[#181D23] flex items-center justify-center p-2.5">
              <Logo className="h-full w-full text-slate-900 dark:text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{integration.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30 dark:text-white/50 capitalize">{integration.category}</span>
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
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-[#181D23] text-white/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-[#181D23] rounded-lg p-1">
          <Button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#181D23] text-slate-900 dark:text-white shadow-sm'
                : 'text-white/30 dark:text-white/50 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {t('integrationsPage.tabOverview')}
          </Button>
          {isConnected && (
            <>
              <Button
                onClick={() => setActiveTab('config')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeTab === 'config'
                    ? 'bg-white dark:bg-[#181D23] text-slate-900 dark:text-white shadow-sm'
                    : 'text-white/30 dark:text-white/50 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {t('integrationsPage.tabConfigure')}
              </Button>
              <Button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeTab === 'activity'
                    ? 'bg-white dark:bg-[#181D23] text-slate-900 dark:text-white shadow-sm'
                    : 'text-white/30 dark:text-white/50 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {t('integrationsPage.tabActivity')}
              </Button>
            </>
          )}
          {!isConnected && (
            <Button
              onClick={() => setActiveTab('config')}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeTab === 'config'
                  ? 'bg-white dark:bg-[#181D23] text-slate-900 dark:text-white shadow-sm'
                  : 'text-white/30 dark:text-white/50 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {t('integrationsPage.tabSetupGuide')}
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
      <div className="border-t border-slate-200 dark:border-white/[0.08] px-6 py-4 space-y-2">
        {isComingSoon ? (
          <Button variant="secondary" className="w-full gap-2 text-sm" disabled>
            <Clock className="h-4 w-4" />
            {t('integrationsPage.statusComingSoon')}
          </Button>
        ) : isConnected ? (
          <>
            <TestConnectionButton provider={integration.provider} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                onClick={onDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                {t('integrationsPage.disconnect')}
              </Button>
              <Button variant="outline" className="flex-1 gap-2 text-sm">
                <ExternalLink className="h-4 w-4" />
                {t('integrationsPage.documentation')}
              </Button>
            </div>
          </>
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
              {connecting
                ? t('integrationsPage.connecting')
                : t('integrationsPage.connect').replace('{name}', integration.name)}
            </Button>
            <Button variant="outline" className="w-full gap-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              {t('integrationsPage.viewDocumentation')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ integration, connection }: { integration: Integration; connection?: ConnectionData }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Connection info */}
      {connection && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 block">
                {t('integrationsPage.statusConnected')}
              </span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                Integration is active and syncing
              </span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {connection.externalAccountName && (
              <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-white/60 dark:bg-[#0B0E11]/60">
                <span className="text-emerald-600 dark:text-emerald-400">{t('integrationsPage.overviewAccountLabel')}</span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">{connection.externalAccountName}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-white/60 dark:bg-[#0B0E11]/60">
              <span className="text-emerald-600 dark:text-emerald-400">{t('integrationsPage.overviewConnectedLabel')}</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-200">{new Date(connection.connectedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-white/60 dark:bg-[#0B0E11]/60">
              <span className="text-emerald-600 dark:text-emerald-400">{t('integrationsPage.overviewStatusLabel')}</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* What this integration does when connected */}
      {connection && (
        <div className="rounded-xl border border-[#1C8C7D]/20 bg-gradient-to-br from-[#1C8C7D]/5 to-[#16A085]/5 dark:from-[#1C8C7D]/10 dark:to-[#16A085]/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Active Capabilities</h4>
          </div>
          <div className="space-y-2">
            {integration.featureKeys.map((key, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1C8C7D] shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300">{t(`integrationsPage.${key}`)}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 dark:text-white/50 mt-3 leading-relaxed">
            Configure notification rules and sync settings in the Configure tab.
          </p>
        </div>
      )}

      <div>
        <p className="text-sm text-slate-600 dark:text-white/50 leading-relaxed">
          {t(`integrationsPage.${integration.descriptionKey}`)}
        </p>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          {t('integrationsPage.overviewFeaturesTitle')}
        </h3>
        <div className="space-y-2">
          {integration.featureKeys.map((key, i) => (
            <div key={i} className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-slate-50 dark:bg-[#0B0E11]">
              <CheckCircle2 className="h-4 w-4 text-primary-500 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{t(`integrationsPage.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      {!connection && (
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            {t('integrationsPage.overviewStatusTitle')}
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0E11]">
            {integration.status === 'coming_soon' ? (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="text-sm text-slate-600 dark:text-white/50">
                  {t('integrationsPage.statusInDevelopment')}
                </span>
              </>
            ) : (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                <span className="text-sm text-slate-600 dark:text-white/50">
                  {t('integrationsPage.statusReadyToConnect')}
                </span>
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
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          {t('integrationsPage.setupStepsTitle')}
        </h3>
        <div className="space-y-3">
          {integration.setupStepKeys.map((key, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{t(`integrationsPage.${key}`)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environment variables needed */}
      {integration.provider && (
        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            {t('integrationsPage.setupRequiredConfig')}
          </h3>
          <div className="rounded-lg bg-slate-900 dark:bg-[#0B0E11] p-4 text-xs font-mono space-y-1">
            {integration.provider === 'slack' && (
              <>
                <div className="text-white/50"># Slack App credentials</div>
                <div><span className="text-emerald-400">SLACK_CLIENT_ID</span>=<span className="text-white/30">your-slack-client-id</span></div>
                <div><span className="text-emerald-400">SLACK_CLIENT_SECRET</span>=<span className="text-white/30">your-slack-client-secret</span></div>
                <div><span className="text-emerald-400">SLACK_SIGNING_SECRET</span>=<span className="text-white/30">your-signing-secret</span></div>
              </>
            )}
            {integration.provider === 'github' && (
              <>
                <div className="text-white/50"># GitHub App credentials</div>
                <div><span className="text-emerald-400">GITHUB_APP_CLIENT_ID</span>=<span className="text-white/30">your-github-app-id</span></div>
                <div><span className="text-emerald-400">GITHUB_APP_CLIENT_SECRET</span>=<span className="text-white/30">your-github-secret</span></div>
                <div><span className="text-emerald-400">GITHUB_WEBHOOK_SECRET</span>=<span className="text-white/30">your-webhook-secret</span></div>
              </>
            )}
            {integration.provider === 'google' && (
              <>
                <div className="text-white/50"># Google OAuth (uses existing config)</div>
                <div><span className="text-emerald-400">GOOGLE_CLIENT_ID</span>=<span className="text-white/30">your-google-client-id</span></div>
                <div><span className="text-emerald-400">GOOGLE_CLIENT_SECRET</span>=<span className="text-white/30">your-google-secret</span></div>
                <div><span className="text-emerald-400">GOOGLE_INTEGRATION_REDIRECT_URI</span>=<span className="text-white/30">callback-url</span></div>
              </>
            )}
          </div>
        </div>
      )}

      {isComingSoon && (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
          <Settings2 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-white/30 dark:text-white/50">
            {t('integrationsPage.setupUnderDevelopment')}
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
  const { t } = useLanguage();
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
              {t('integrationsPage.configWorkspace')}
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#0B0E11] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configTeam')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{(config as Record<string, unknown>).teamName as string}</span>
              </div>
              {!!(config as Record<string, unknown>).defaultChannelName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configDefaultChannel')}</span>
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <Hash className="h-3 w-3" />{(config as Record<string, unknown>).defaultChannelName as string}
                  </span>
                </div>
              )}
              {Array.isArray((config as Record<string, unknown>).channels) && ((config as Record<string, unknown>).channels as unknown[]).length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configAvailableChannels')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{((config as Record<string, unknown>).channels as unknown[]).length}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" />
              {t('integrationsPage.configNotificationRules')}
            </h3>
            <div className="space-y-1">
              {([
                { key: 'taskCreated', labelKey: 'slackNotifTaskCreated', icon: Sparkles },
                { key: 'taskCompleted', labelKey: 'slackNotifTaskCompleted', icon: CheckCircle2 },
                { key: 'taskAssigned', labelKey: 'slackNotifTaskAssigned', icon: UserCheck },
                { key: 'commentAdded', labelKey: 'slackNotifCommentAdded', icon: MessageSquare },
                { key: 'projectUpdated', labelKey: 'slackNotifProjectUpdated', icon: Rocket },
                { key: 'dailyDigest', labelKey: 'slackNotifDailyDigest', icon: ClipboardList },
              ] as { key: string; labelKey: string; icon: LucideIcon }[]).map(item => (
                <ToggleRow
                  key={item.key}
                  label={t(`integrationsPage.${item.labelKey}`)}
                  icon={<item.icon className="h-4 w-4 text-white/30 dark:text-white/50" />}
                  enabled={(config as Record<string, Record<string, boolean>>).notifications?.[item.key] ?? false}
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
              {t('integrationsPage.configAccount')}
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#0B0E11] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configAccount')}</span>
                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <GitBranch className="h-3 w-3" />
                  {(config as Record<string, unknown>).accountLogin as string}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configType')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{(config as Record<string, unknown>).accountType as string}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configRepositories')}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {Array.isArray((config as Record<string, unknown>).repositories) ? ((config as Record<string, unknown>).repositories as unknown[]).length : 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitPullRequest className="h-3.5 w-3.5" />
              {t('integrationsPage.configAutomation')}
            </h3>
            <div className="space-y-1">
              <ToggleRow
                label={t('integrationsPage.githubAutoLinkLabel')}
                description={t('integrationsPage.githubAutoLinkDesc')}
                enabled={(config as Record<string, boolean>).autoLinkPRs ?? true}
                onChange={v => handleToggle('autoLinkPRs', v)}
                disabled={saving}
              />
              <ToggleRow
                label={t('integrationsPage.githubAutoCloseLabel')}
                description={t('integrationsPage.githubAutoCloseDesc')}
                enabled={(config as Record<string, boolean>).autoCloseOnMerge ?? true}
                onChange={v => handleToggle('autoCloseOnMerge', v)}
                disabled={saving}
              />
            </div>
          </div>

          {Array.isArray((config as Record<string, unknown>).repositories) && ((config as Record<string, unknown>).repositories as unknown[]).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {t('integrationsPage.configRepositories')} ({((config as Record<string, unknown>).repositories as unknown[]).length})
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(((config as Record<string, unknown>).repositories as Array<{ id: string; fullName: string; private: boolean }>)).slice(0, 20).map(repo => (
                  <div key={repo.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-slate-50 dark:bg-[#0B0E11] text-sm">
                    <GitBranch className="h-3 w-3 text-white/50 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{repo.fullName}</span>
                    {repo.private && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] text-white/30 dark:text-white/50 shrink-0">private</span>
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
              {t('integrationsPage.configAccount')}
            </h3>
            <div className="rounded-lg bg-slate-50 dark:bg-[#0B0E11] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configEmail')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{(config as Record<string, unknown>).email as string}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-white/50">{t('integrationsPage.configSyncDirection')}</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {((config as Record<string, unknown>).syncDirection as string)?.replace('_', '-')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5" />
              {t('integrationsPage.configSyncSettings')}
            </h3>
            <div className="space-y-1">
              <ToggleRow
                label={t('integrationsPage.googleCalendarSyncLabel')}
                description={t('integrationsPage.googleCalendarSyncDesc')}
                enabled={(config as Record<string, boolean>).calendarSync ?? true}
                onChange={v => handleToggle('calendarSync', v)}
                disabled={saving}
                icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
              />
              <ToggleRow
                label={t('integrationsPage.googleDriveSyncLabel')}
                description={t('integrationsPage.googleDriveSyncDesc')}
                enabled={(config as Record<string, boolean>).driveSync ?? true}
                onChange={v => handleToggle('driveSync', v)}
                disabled={saving}
                icon={<HardDrive className="h-3.5 w-3.5 text-green-500" />}
              />
            </div>
          </div>

          {Array.isArray((config as Record<string, unknown>).selectedCalendars) && ((config as Record<string, unknown>).selectedCalendars as unknown[]).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                {t('integrationsPage.configCalendars')} ({((config as Record<string, unknown>).selectedCalendars as unknown[]).length})
              </h3>
              <div className="space-y-1">
                {(((config as Record<string, unknown>).selectedCalendars as Array<{ id: string; summary: string; primary: boolean }>)).map(cal => (
                  <div key={cal.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md bg-slate-50 dark:bg-[#0B0E11] text-sm">
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
  const { t } = useLanguage();

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-white/30 dark:text-white/50">{t('integrationsPage.activityNoEvents')}</p>
        <p className="text-xs text-white/50 dark:text-white/30 mt-1">{t('integrationsPage.activityNoEventsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
        {t('integrationsPage.activityRecentEvents')}
      </h3>
      {events.map(event => (
        <div key={event.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-slate-50 dark:bg-[#0B0E11]">
          <div className={cn(
            'mt-1 h-2 w-2 rounded-full shrink-0',
            event.status === 'success' ? 'bg-emerald-500' : event.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
              {event.type}
            </p>
            <p className="text-[10px] text-white/50">
              {event.direction === 'inbound'
                ? `\u2190 ${t('integrationsPage.activityReceived')}`
                : `\u2192 ${t('integrationsPage.activitySent')}`}
              {' · '}{new Date(event.createdAt).toLocaleString()}
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

// ─── Test Connection Button ──────────────────────────────────────────────────

function TestConnectionButton({ provider }: { provider?: string }) {
  const { t } = useLanguage();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!provider) return;
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/integrations/${provider}/test`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setResult({ success: true, message: data.message || 'Connection is working' });
      } else {
        setResult({ success: false, message: data.error || data.message || 'Connection test failed' });
      }
    } catch {
      setResult({ success: false, message: 'Failed to reach test endpoint' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleTest}
        disabled={testing}
        className="w-full gap-2 text-sm bg-[#1C8C7D] hover:bg-[#156B60] text-white"
      >
        {testing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {testing ? 'Testing Connection...' : 'Test Connection'}
      </Button>
      {result && (
        <div className={cn(
          'mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
          result.success
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        )}>
          {result.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {result.message}
        </div>
      )}
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
      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#0B0E11] transition-colors text-left disabled:opacity-50"
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon}
        <div className="min-w-0">
          <span className="text-sm text-slate-700 dark:text-slate-300 block truncate">{label}</span>
          {description && (
            <span className="text-[10px] text-white/50 block truncate">{description}</span>
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
