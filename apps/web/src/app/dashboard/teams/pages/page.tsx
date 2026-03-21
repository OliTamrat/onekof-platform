'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Book,
  BookOpen,
  ClipboardList,
  Clock,
  Code,
  FileIcon,
  FileText,
  FolderIcon,
  Pencil,
  Plus,
  RotateCcw,
  Target,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/teams/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/teams/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/teams/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/teams/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/teams/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/teams/pages', active: true },
];

const PAGE_TEMPLATES: { id: string; name: string; description: string; icon: LucideIcon }[] = [
  {
    id: 'team-charter',
    name: 'Team Charter',
    description: 'Define team mission, values, and goals',
    icon: ClipboardList,
  },
  {
    id: 'team-handbook',
    name: 'Team Handbook',
    description: 'Document team processes and best practices',
    icon: BookOpen,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for team meeting minutes',
    icon: Pencil,
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    description: 'Sprint or quarterly retrospective template',
    icon: RotateCcw,
  },
  {
    id: 'team-goals',
    name: 'Team Goals',
    description: 'Document quarterly or annual team objectives',
    icon: Target,
  },
  {
    id: 'team-roster',
    name: 'Team Roster',
    description: 'Team member directory with roles and contacts',
    icon: Users,
  },
];

const EXISTING_PAGES = [
  { id: 1, name: 'Engineering Team Charter', team: 'Engineering', lastModified: '2024-03-15', author: 'Alice Johnson' },
  { id: 2, name: 'Q1 2024 Retrospective', team: 'Engineering', lastModified: '2024-03-10', author: 'Bob Smith' },
  { id: 3, name: 'Design Team Handbook', team: 'Design', lastModified: '2024-03-08', author: 'Carol White' },
  { id: 4, name: 'Weekly Sync Notes - March', team: 'Marketing', lastModified: '2024-03-12', author: 'David Brown' },
];

export default function TeamsPagesPage() {
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Pages</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
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
            <Button
              onClick={() => setSelectedView('pages')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'pages'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
              }`}
            >
              All Pages
            </Button>
            <Button
              onClick={() => setSelectedView('templates')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'templates'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
              }`}
            >
              Templates
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'templates' ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Page Templates</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Choose a template to create team documentation and collaboration pages
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAGE_TEMPLATES.map((template) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={template.id}
                    className="cursor-pointer text-left p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                      <template.icon className="h-5 w-5 text-primary-500" />
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Team Pages</h2>
                <p className="text-gray-600 dark:text-slate-400">
                  Browse and manage team documentation
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
                        Team
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
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            {page.team}
                          </span>
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
