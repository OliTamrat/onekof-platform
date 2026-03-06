'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bug,
  FileText,
  Zap,
  BarChart3,
  Settings,
  Users,
  Calendar,
  Target,
  Activity,
  Code,
  Book,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary', active: true },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

export default function IssuesSummaryPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch issues data
  const { data: issuesData } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  useEffect(() => {
    // Simulate loading analytics - will use real endpoint when available
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        // For now, calculate from issues data
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnalytics(issuesData);
      } finally {
        setLoading(false);
      }
    };

    if (issuesData) {
      loadAnalytics();
    }
  }, [issuesData, timeRange]);

  const issues = issuesData?.issues || [];
  const totalIssues = issues.length;
  const openIssues = issues.filter((i: any) => i.status !== 'DONE').length;
  const completedIssues = issues.filter((i: any) => i.status === 'DONE').length;
  const blockedIssues = issues.filter((i: any) => i.status === 'BLOCKED').length;

  // Issue breakdown
  const issuesByType = {
    task: issues.filter((i: any) => i.type === 'TASK').length,
    bug: issues.filter((i: any) => i.type === 'BUG').length,
    story: issues.filter((i: any) => i.type === 'STORY').length,
    epic: issues.filter((i: any) => i.type === 'EPIC').length,
  };

  const issuesByStatus = {
    todo: issues.filter((i: any) => i.status === 'TODO').length,
    inProgress: issues.filter((i: any) => i.status === 'IN_PROGRESS').length,
    inReview: issues.filter((i: any) => i.status === 'IN_REVIEW').length,
    done: issues.filter((i: any) => i.status === 'DONE').length,
  };

  const issuesByPriority = {
    highest: issues.filter((i: any) => i.priority === 'HIGHEST').length,
    high: issues.filter((i: any) => i.priority === 'HIGH').length,
    medium: issues.filter((i: any) => i.priority === 'MEDIUM').length,
    low: issues.filter((i: any) => i.priority === 'LOW' || i.priority === 'LOWEST').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
          <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Issues Overview</h1>
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
                Loading issues analytics...
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Issues Overview</h1>
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
                href="/dashboard/issues?create=true"
                className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Issue
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
                title="Total Issues"
                value={totalIssues}
                change={10}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={FileText}
                iconColor="bg-blue-500"
                trend="up"
              />

              <MetricCard
                title="Open Issues"
                value={openIssues}
                change={5}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Activity}
                iconColor="bg-orange-500"
                trend="up"
              />

              <MetricCard
                title="Completed"
                value={completedIssues}
                change={12}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={CheckCircle2}
                iconColor="bg-green-500"
                trend="up"
              />

              <MetricCard
                title="Blocked"
                value={blockedIssues}
                change={-2}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={AlertCircle}
                iconColor="bg-red-500"
                trend="down"
              />
            </div>

            {/* Charts and Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues by Type */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Issues by Type</h3>
                <div className="space-y-4">
                  <IssueTypeBar label="Tasks" count={issuesByType.task} total={totalIssues} color="bg-blue-500" icon={CheckCircle2} />
                  <IssueTypeBar label="Bugs" count={issuesByType.bug} total={totalIssues} color="bg-red-500" icon={Bug} />
                  <IssueTypeBar label="Stories" count={issuesByType.story} total={totalIssues} color="bg-purple-500" icon={FileText} />
                  <IssueTypeBar label="Epics" count={issuesByType.epic} total={totalIssues} color="bg-indigo-500" icon={Zap} />
                </div>
              </div>

              {/* Issues by Status */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Issues by Status</h3>
                <div className="space-y-4">
                  <StatusBar label="To Do" count={issuesByStatus.todo} total={totalIssues} color="bg-gray-500" />
                  <StatusBar label="In Progress" count={issuesByStatus.inProgress} total={totalIssues} color="bg-blue-500" />
                  <StatusBar label="In Review" count={issuesByStatus.inReview} total={totalIssues} color="bg-yellow-500" />
                  <StatusBar label="Done" count={issuesByStatus.done} total={totalIssues} color="bg-green-500" />
                </div>
              </div>

              {/* Issues by Priority */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Issues by Priority</h3>
                <div className="space-y-4">
                  <PriorityBar label="Highest" count={issuesByPriority.highest} total={totalIssues} color="bg-red-600" />
                  <PriorityBar label="High" count={issuesByPriority.high} total={totalIssues} color="bg-orange-500" />
                  <PriorityBar label="Medium" count={issuesByPriority.medium} total={totalIssues} color="bg-yellow-500" />
                  <PriorityBar label="Low" count={issuesByPriority.low} total={totalIssues} color="bg-green-500" />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                <div className="space-y-3">
                  {issues.slice(0, 5).map((issue: any) => (
                    <div key={issue.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1B1F23] hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{issue.title}</div>
                        <div className="text-xs text-gray-500 dark:text-[#9FADBC] mt-1">{issue.key} • {issue.project?.name}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                        issue.status === 'BLOCKED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
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
  value: number;
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

// Issue Type Bar Component
function IssueTypeBar({ label, count, total, color, icon: Icon }: { label: string; count: number; total: number; color: string; icon: any }) {
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

// Priority Bar Component
function PriorityBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
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
