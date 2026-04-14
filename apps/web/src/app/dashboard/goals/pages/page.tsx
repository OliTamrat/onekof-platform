'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Calendar,
  Clock,
  Code,
  FileIcon,
  FileText,
  Map,
  Pencil,
  Plus,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const EXISTING_PAGES = [
  { id: 1, name: 'Q2 2024 OKR Planning', goal: 'Company-wide', lastModified: '2024-03-15', author: 'Alice Johnson' },
  { id: 2, name: 'Product Roadmap Q2-Q3', goal: 'Product Strategy', lastModified: '2024-03-10', author: 'Bob Smith' },
  { id: 3, name: 'Engineering Team Goals', goal: 'Team Alignment', lastModified: '2024-03-08', author: 'Carol White' },
  { id: 4, name: 'Revenue Growth Strategy', goal: 'Business Goals', lastModified: '2024-03-12', author: 'David Brown' },
];

export default function GoalsPagesPage() {
  const { t } = useLanguage();
  const [selectedView, setSelectedView] = useState<'templates' | 'pages'>('pages');

  const TAB_ITEMS = [
    { id: 'summary', label: t('tabs.summary'), icon: BarChart3, href: '/dashboard/goals/summary' },
    { id: 'list', label: t('tabs.list'), icon: null, href: '/dashboard/goals/list' },
    { id: 'board', label: t('tabs.board'), icon: null, href: '/dashboard/goals/board' },
    { id: 'code', label: t('tabs.code'), icon: Code, href: '/dashboard/goals/code' },
    { id: 'forms', label: t('tabs.forms'), icon: FileText, href: '/dashboard/goals/forms' },
    { id: 'timeline', label: t('tabs.timeline'), icon: Clock, href: '/dashboard/goals/timeline' },
    { id: 'pages', label: t('tabs.pages'), icon: Book, href: '/dashboard/goals/pages', active: true },
  ];

  const PAGE_TEMPLATES: { id: string; nameKey: string; descKey: string; icon: LucideIcon }[] = [
    { id: 'okr-framework', nameKey: 'goalPages.okrFrameworkGuide', descKey: 'goalPages.okrFrameworkGuideDesc', icon: Book },
    { id: 'goal-planning', nameKey: 'goalPages.goalPlanning', descKey: 'goalPages.goalPlanningDesc', icon: Calendar },
    { id: 'strategy-doc', nameKey: 'goalPages.strategyDocument', descKey: 'goalPages.strategyDocumentDesc', icon: Target },
    { id: 'okr-review', nameKey: 'goalPages.okrReviewNotes', descKey: 'goalPages.okrReviewNotesDesc', icon: Pencil },
    { id: 'goal-alignment', nameKey: 'goalPages.goalAlignmentMap', descKey: 'goalPages.goalAlignmentMapDesc', icon: Map },
    { id: 'success-metrics', nameKey: 'goalPages.successMetricsDashboard', descKey: 'goalPages.successMetricsDashboardDesc', icon: BarChart3 },
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('goalPages.title')}</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              {t('goalPages.createPage')}
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
                      : 'border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
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
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              {t('goalPages.allPages')}
            </Button>
            <Button
              onClick={() => setSelectedView('templates')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedView === 'templates'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'
              }`}
            >
              {t('goalPages.templates')}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'templates' ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('goalPages.pageTemplates')}</h2>
                <p className="text-gray-600 dark:text-white/50">
                  {t('goalPages.templatesSubtitle')}
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
                    <p className="text-sm text-gray-600 dark:text-white/50 mb-4">
                      {t(template.descKey)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary-500">
                      <Plus className="h-4 w-4" />
                      {t('goalPages.create', { name: t(template.nameKey) })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('goalPages.title')}</h2>
                <p className="text-gray-600 dark:text-white/50">
                  {t('goalPages.browseAndManage')}
                </p>
              </div>

              <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">
                        {t('goalPages.page')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">
                        {t('goalPages.relatedGoal')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">
                        {t('goalPages.author')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">
                        {t('goalPages.lastModified')}
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
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-white/50">
                              {page.goal}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-white/50">
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
