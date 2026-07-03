'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  List,
  Plus,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS: { id: string; labelKey: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', labelKey: 'automations.tabSummary', icon: BarChart3, href: '/dashboard/automations/summary' },
  { id: 'list', labelKey: 'automations.tabList', icon: List, href: '/dashboard/automations/list' },
  { id: 'board', labelKey: 'automations.tabBoard', icon: null, href: '/dashboard/automations', active: true },
  { id: 'code', labelKey: 'automations.tabCode', icon: Code, href: '/dashboard/automations/code' },
  { id: 'forms', labelKey: 'automations.tabForms', icon: FileText, href: '/dashboard/automations/forms' },
  { id: 'timeline', labelKey: 'automations.tabTimeline', icon: Clock, href: '/dashboard/automations/timeline' },
  { id: 'pages', labelKey: 'automations.tabPages', icon: Book, href: '/dashboard/automations/pages' },
];

export default function AutomationsBoardPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                <Zap className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('automations.boardTitle')}
              </h1>
            </div>

            <Link
              href="/dashboard/automations/create"
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t('automations.create')}
            </Link>
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
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <Zap className="mx-auto h-16 w-16 text-gray-300 dark:text-slate-700" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('automations.boardTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
                {t('automations.boardDesc')} — {t('automations.comingSoon')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
