'use client';

import {
  BarChart3
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function ReportsAndAnalyticsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Reports"
        icon={<BarChart3 className="h-6 w-6" />}
        iconColor="#3B82F6"

        currentTab="summary"
        baseHref="/dashboard/reports"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="p-8"><div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Analytics and reporting features are coming soon. You will be able to view insights, generate reports, and track metrics here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
