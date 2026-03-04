'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { Plus, Code, BarChart3, FileText, Clock, Book, CheckSquare, Calendar } from 'lucide-react';

// Tab navigation items
const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline', active: true },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

interface Issue {
  id: string;
  key: string;
  title: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export default function IssuesTimelinePage() {
  const [viewMode, setViewMode] = useState<'month' | 'quarter'>('month');

  // Fetch issues
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  const issues = issuesData?.issues || [];

  // Group issues by month
  const groupedIssues = issues.reduce((acc: Record<string, Issue[]>, issue: Issue) => {
    const date = new Date(issue.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(issue);
    return acc;
  }, {});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'IN_REVIEW':
        return 'bg-purple-500';
      case 'BLOCKED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Project Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Clock className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Timeline
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'month' | 'quarter')}
                className="rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
              </select>
              <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
                <Plus className="h-4 w-4" />
                Create
              </button>
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

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-[#9FADBC]">Loading timeline...</div>
            </div>
          ) : Object.keys(groupedIssues).length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No timeline data</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#9FADBC]">
                  Create some issues to see them on the timeline.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#2C333A]" />

                {/* Timeline items */}
                <div className="space-y-8">
                  {Object.entries(groupedIssues)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([monthYear, monthIssues]) => (
                      <div key={monthYear} className="relative pl-16">
                        {/* Month marker */}
                        <div className="absolute left-0 top-0 flex items-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-[#22272B] border-2 border-[#0065FF]">
                            <Calendar className="h-6 w-6 text-[#0065FF]" />
                          </div>
                        </div>

                        {/* Month header */}
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {monthYear}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                            {monthIssues.length} {monthIssues.length === 1 ? 'issue' : 'issues'}
                          </p>
                        </div>

                        {/* Issues in this month */}
                        <div className="space-y-3">
                          {monthIssues.map((issue) => (
                            <div
                              key={issue.id}
                              className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] hover:border-[#0065FF] cursor-pointer transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckSquare className="h-4 w-4 text-[#0065FF]" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">
                                      {issue.key}
                                    </span>
                                    <span className={`h-2 w-2 rounded-full ${getStatusColor(issue.status)}`} />
                                  </div>
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    {issue.title}
                                  </h4>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-[#9FADBC]">
                                    <span>Created {formatDate(issue.createdAt)}</span>
                                    {issue.dueDate && (
                                      <span>Due {formatDate(issue.dueDate)}</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]">
                                    {issue.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
