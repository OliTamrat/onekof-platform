'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Code,
  FileText,
  Book,
  List as ListIcon,
  Power,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/automations/summary', active: true },
  { id: 'list', label: 'List', icon: ListIcon, href: '/dashboard/automations/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/automations' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/automations/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/automations/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/automations/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/automations/pages' },
] as const;

export default function AutomationsSummaryPage() {
  const { currentOrganization } = useWorkspace();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch automations data
  const { data: automationsData } = useQuery({
    queryKey: ['automations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { automations: [] };
      const res = await fetch(`/api/automations?organizationId=${currentOrganization.id}`);
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
    enabled: !!currentOrganization?.id,
  });

  useEffect(() => {
    // Simulate loading analytics
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnalytics(automationsData);
      } finally {
        setLoading(false);
      }
    };

    if (automationsData) {
      loadAnalytics();
    }
  }, [automationsData, timeRange]);

  const automations = automationsData?.automations || [];
  const totalAutomations = automations.length;
  const enabledAutomations = automations.filter((a: any) => a.isEnabled).length;
  const disabledAutomations = automations.filter((a: any) => !a.isEnabled).length;
  const aiGeneratedAutomations = automations.filter((a: any) => a.aiGenerated).length;

  const totalExecutions = automations.reduce((sum: number, a: any) => sum + (a.executionCount || 0), 0);
  const totalSuccesses = automations.reduce((sum: number, a: any) => sum + (a.successCount || 0), 0);
  const totalFailures = automations.reduce((sum: number, a: any) => sum + (a.failureCount || 0), 0);
  const totalTimeSaved = automations.reduce((sum: number, a: any) => sum + (a.estimatedSavedHours || 0), 0);

  // Automation breakdown by entity
  const automationsByEntity = {
    issue: automations.filter((a: any) => a.entityType === 'ISSUE').length,
    project: automations.filter((a: any) => a.entityType === 'PROJECT').length,
    task: automations.filter((a: any) => a.entityType === 'TASK').length,
    comment: automations.filter((a: any) => a.entityType === 'COMMENT').length,
  };

  // Automation breakdown by scope
  const automationsByScope = {
    organization: automations.filter((a: any) => a.scope === 'ORGANIZATION').length,
    project: automations.filter((a: any) => a.scope === 'PROJECT').length,
    personal: automations.filter((a: any) => a.scope === 'PERSONAL').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
          <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Automations Overview</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 px-6">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                      tab.active
                        ? 'border-[#0065FF] text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-[#2C333A] rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-[#2C333A] rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-[#2C333A] rounded w-20"></div>
                  </div>
                ))}
              </div>
              <div className="text-center py-12 text-gray-500 dark:text-[#9FADBC]">
                Loading automations analytics...
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Automations Overview</h1>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
                className="rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
              <Link
                href="/dashboard/automations/create"
                className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Automation
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Automations"
                value={totalAutomations}
                change={8}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Zap}
                iconColor="bg-purple-500"
                trend="up"
              />

              <MetricCard
                title="Active Automations"
                value={enabledAutomations}
                change={5}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Power}
                iconColor="bg-green-500"
                trend="up"
              />

              <MetricCard
                title="Total Executions"
                value={totalExecutions}
                change={15}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Activity}
                iconColor="bg-blue-500"
                trend="up"
              />

              <MetricCard
                title="Time Saved (Hours)"
                value={totalTimeSaved.toFixed(1)}
                change={12}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Clock}
                iconColor="bg-amber-500"
                trend="up"
              />
            </div>

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Automations by Entity */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Automations by Entity</h3>
                <div className="space-y-4">
                  <AutomationTypeBar label="Issues" count={automationsByEntity.issue} total={totalAutomations} color="bg-blue-500" />
                  <AutomationTypeBar label="Projects" count={automationsByEntity.project} total={totalAutomations} color="bg-purple-500" />
                  <AutomationTypeBar label="Tasks" count={automationsByEntity.task} total={totalAutomations} color="bg-green-500" />
                  <AutomationTypeBar label="Comments" count={automationsByEntity.comment} total={totalAutomations} color="bg-amber-500" />
                </div>
              </div>

              {/* Automations by Scope */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Automations by Scope</h3>
                <div className="space-y-4">
                  <StatusBar label="Organization" count={automationsByScope.organization} total={totalAutomations} color="bg-indigo-500" />
                  <StatusBar label="Project" count={automationsByScope.project} total={totalAutomations} color="bg-blue-500" />
                  <StatusBar label="Personal" count={automationsByScope.personal} total={totalAutomations} color="bg-teal-500" />
                </div>
              </div>

              {/* Execution Stats */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Execution Statistics</h3>
                <div className="space-y-4">
                  <ExecutionBar label="Successful" count={totalSuccesses} total={totalExecutions} color="bg-green-500" icon={CheckCircle2} />
                  <ExecutionBar label="Failed" count={totalFailures} total={totalExecutions} color="bg-red-500" icon={AlertCircle} />
                </div>
              </div>

              {/* AI-Generated Automations */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">AI Assistance</h3>
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Sparkles className="h-12 w-12 text-amber-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{aiGeneratedAutomations}</p>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">AI-Generated Automations</p>
                    <p className="text-xs text-gray-500 dark:text-[#6B7684] mt-2">
                      {totalAutomations > 0 ? Math.round((aiGeneratedAutomations / totalAutomations) * 100) : 0}% of total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Automations */}
            <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Recent Automations</h3>
              <div className="space-y-3">
                {automations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-[#9FADBC]">
                    No automations yet. Create your first automation to get started!
                  </div>
                ) : (
                  automations.slice(0, 5).map((automation: any) => (
                    <div key={automation.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23] hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded" style={{ backgroundColor: automation.color || '#6B7684' }}>
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
                          {automation.name}
                          {automation.aiGenerated && <Sparkles className="h-3 w-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#9FADBC] mt-1">
                          {automation.entityType} • {automation.executionCount} runs
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        automation.isEnabled
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {automation.isEnabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  changeLabel: string;
  icon: any;
  iconColor: string;
  trend: 'up' | 'down';
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, iconColor, trend }: MetricCardProps) {
  const isPositive = trend === 'up' ? change >= 0 : change <= 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">{title}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded ${iconColor}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500 dark:text-[#9FADBC]">{changeLabel}</span>
      </div>
    </div>
  );
}

// Automation Type Bar Component
function AutomationTypeBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-[#2C333A] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Status Bar Component
function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-[#2C333A] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Execution Bar Component
function ExecutionBar({ label, count, total, color, icon: Icon }: { label: string; count: number; total: number; color: string; icon: any }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600 dark:text-[#9FADBC]" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-[#2C333A] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
