'use client';

import {
  TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Marketing Analytics"
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="#F97316"
        breadcrumbs={[{"label":"Marketing","href":"/dashboard/marketing"},{"label":"Analytics"}]}
        currentTab="summary"
        baseHref="/dashboard/marketing/analytics"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

            <div className="p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Marketing Analytics</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Analytics features are coming soon. Track KPIs, measure ROI, and analyze campaign performance.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
