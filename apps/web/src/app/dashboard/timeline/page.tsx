'use client';

import {
  GitBranch
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { useLanguage } from '@/contexts/language-context';

export default function TimelinePage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('timeline.title')}
        icon={<GitBranch className="h-6 w-6" />}
        iconColor="#A855F7"

        currentTab="timeline"
        baseHref="/dashboard/timeline"
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="p-8"><div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <GitBranch className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{t('timeline.projectTimeline')}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              {t('timeline.comingSoonDesc')}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
