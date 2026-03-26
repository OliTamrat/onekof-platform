'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function IssuesSettingsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Settings"
        icon={<Settings className="h-6 w-6" />}
        iconColor="#6B7280"
        currentTab="settings"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Settings className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t("nav.settings")}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This page is under construction and will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
