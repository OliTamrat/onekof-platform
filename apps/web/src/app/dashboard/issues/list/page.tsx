'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { Plus, Search, Filter, CheckSquare, Clock, BarChart3, Code, FileText, Calendar, Book } from 'lucide-react';

// Tab navigation items
const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list', active: true },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export default function IssuesListPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter issues based on search
  const filteredIssues = issues.filter((issue: Issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.key.toLowerCase().includes(query) ||
      issue.title.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'IN_REVIEW':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'DONE':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'BLOCKED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGHEST':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400';
      case 'LOWEST':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                IS
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Issues
              </h1>
            </div>

            <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Plus className="h-4 w-4" />
              Create
            </button>
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

          {/* Search Bar */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#9FADBC]" />
              <input
                type="text"
                placeholder="Search issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none"
              />
            </div>

            <button className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-100 dark:bg-[#282E33] px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2C333A]">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Issues Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-[#9FADBC]">Loading issues...</div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No issues</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#9FADBC]">
                  {searchQuery ? 'No issues match your search.' : 'Get started by creating a new issue.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2C333A]">
                <thead className="bg-gray-50 dark:bg-[#282E33]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#22272B] divide-y divide-gray-200 dark:divide-[#2C333A]">
                  {filteredIssues.map((issue: Issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-[#0065FF]" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {issue.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {issue.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#9FADBC]">
                          {issue.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            {issue.assignee.avatar ? (
                              <img
                                src={issue.assignee.avatar}
                                alt={issue.assignee.name || ''}
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                                {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {issue.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-[#6B7684]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.dueDate ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-[#9FADBC]">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(issue.dueDate)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-[#6B7684]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
