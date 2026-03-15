'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileIcon,
  FileText,
  Plus,
  Target
} from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages', active: true },
];

const PAGE_TEMPLATES = [
  {
    id: 'okr-framework',
    name: 'OKR Framework Guide',
    description: 'Document your OKR methodology and best practices',
    icon: '📚',
  },
  {
    id: 'goal-planning',
    name: 'Goal Planning',
    description: 'Template for quarterly and annual planning',
    icon: '📅',
  },
  {
    id: 'strategy-doc',
    name: 'Strategy Document',
    description: 'Long-term strategic goals and initiatives',
    icon: '🎯',
  },
  {
    id: 'okr-review',
    name: 'OKR Review Notes',
    description: 'Template for OKR review meetings',
    icon: '📝',
  },
  {
    id: 'goal-alignment',
    name: 'Goal Alignment Map',
    description: 'Visualize how team goals align with company objectives',
    icon: '🗺️',
  },
  {
    id: 'success-metrics',
    name: 'Success Metrics Dashboard',
    description: 'Track and document key success indicators',
    icon: '📊',
  },
];

const EXISTING_PAGES = [
  { id: 1, name: 'Q2 2024 OKR Planning', goal: 'Company-wide', lastModified: '2024-03-15', author: 'Alice Johnson' },
  { id: 2, name: 'Product Roadmap Q2-Q3', goal: 'Product Strategy', lastModified: '2024-03-10', author: 'Bob Smith' },
  { id: 3, name: 'Engineering Team Goals', goal: 'Team Alignment', lastModified: '2024-03-08', author: 'Carol White' },
  { id: 4, name: 'Revenue Growth Strategy', goal: 'Business Goals', lastModified: '2024-03-12', author: 'David Brown' },
];

export default function GoalsPagesPage() {
  const [selectedView, setSelectedView] = useState<'templates' | 'pages'>('pages');

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Book className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goal Pages</h1>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              Create Page
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* View Selector */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedView('pages')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'pages'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
              }`}
            >
              All Pages
            </button>
            <button
              onClick={() => setSelectedView('templates')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'templates'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'templates' ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Templates</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Choose a template to create goal planning and strategy documentation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAGE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className="text-left p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="text-4xl mb-4">{template.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary-500">
                      <Plus className="h-4 w-4" />
                      Create {template.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Goal Pages</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Browse and manage goal planning documentation
                </p>
              </div>

              <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Related Goal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Last Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {EXISTING_PAGES.map((page) => (
                      <tr
                        key={page.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-primary-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {page.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-slate-400">
                              {page.goal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            {page.author}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 dark:text-[#6B7684]">
                            {new Date(page.lastModified).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
