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
import { useLanguage } from '@/contexts/language-context';

const EXISTING_PAGES = [
  { id: 1, name: 'Engineering Team Charter', team: 'Engineering', lastModified: '2024-03-15', author: 'Alice Johnson' },
  { id: 2, name: 'Q1 2024 Retrospective', team: 'Engineering', lastModified: '2024-03-10', author: 'Bob Smith' },
  { id: 3, name: 'Design Team Handbook', team: 'Design', lastModified: '2024-03-08', author: 'Carol White' },
  { id: 4, name: 'Weekly Sync Notes - March', team: 'Marketing', lastModified: '2024-03-12', author: 'David Brown' },
];

export default function TeamsPagesPage() {
  const { t } = useLanguage();
  const [selectedView, setSelectedView] = useState<'templates' | 'pages'>('pages');

  const TAB_ITEMS = [
    { id: 'summary', label: t('tabs.summary'), icon: BarChart3, href: '/dashboard/teams/overview' },
    { id: 'list', label: t('tabs.list'), icon: null, href: '/dashboard/teams/list' },
    { id: 'board', label: t('tabs.board'), icon: null, href: '/dashboard/teams/board' },
    { id: 'code', label: t('tabs.code'), icon: Code, href: '/dashboard/teams/code' },
    { id: 'forms', label: t('tabs.forms'), icon: FileText, href: '/dashboard/teams/forms' },
    { id: 'timeline', label: t('tabs.timeline'), icon: Clock, href: '/dashboard/teams/timeline' },
    { id: 'pages', label: t('tabs.pages'), icon: Book, href: '/dashboard/teams/pages', active: true },
  ];

  const PAGE_TEMPLATES: { id: string; nameKey: string; descKey: string; icon: LucideIcon }[] = [
    { id: 'team-charter', nameKey: 'teamPages.teamCharter', descKey: 'teamPages.teamCharterDesc', icon: ClipboardList },
    { id: 'team-handbook', nameKey: 'teamPages.teamHandbook', descKey: 'teamPages.teamHandbookDesc', icon: BookOpen },
    { id: 'meeting-notes', nameKey: 'teamPages.meetingNotes', descKey: 'teamPages.meetingNotesDesc', icon: Pencil },
    { id: 'retrospective', nameKey: 'teamPages.retrospective', descKey: 'teamPages.retrospectiveDesc', icon: RotateCcw },
    { id: 'team-goals', nameKey: 'teamPages.teamGoals', descKey: 'teamPages.teamGoalsDesc', icon: Target },
    { id: 'team-roster', nameKey: 'teamPages.teamRoster', descKey: 'teamPages.teamRosterDesc', icon: Users },
  ];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Book className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('teamPages.title')}</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              {t('teamPages.createPage')}
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
                      : 'border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
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
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedView('pages')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'pages'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              {t('teamPages.allPages')}
            </Button>
            <Button
              onClick={() => setSelectedView('templates')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'templates'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              {t('teamPages.templates')}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'templates' ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('teamPages.pageTemplates')}</h2>
                <p className="text-gray-600 dark:text-white/70">
                  {t('teamPages.templatesSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PAGE_TEMPLATES.map((template) => (
                  <div
                    role="button"
                    tabIndex={0}
                    key={template.id}
                    className="cursor-pointer text-left p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                      <template.icon className="h-5 w-5 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t(template.nameKey)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                      {t(template.descKey)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary-500">
                      <Plus className="h-4 w-4" />
                      {t('teamPages.create', { name: t(template.nameKey) })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('teamPages.title')}</h2>
                <p className="text-gray-600 dark:text-white/70">
                  {t('teamPages.browseAndManage')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('teamPages.page')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('teamPages.team')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('teamPages.author')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                        {t('teamPages.lastModified')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {EXISTING_PAGES.map((page) => (
                      <tr
                        key={page.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#181D23] cursor-pointer transition-colors"
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
                          <span className="text-sm text-gray-600 dark:text-white/70">
                            {page.team}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-white/70">
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
