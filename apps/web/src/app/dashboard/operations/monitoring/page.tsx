'use client';

import {
  Activity
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function MonitoringPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Monitoring"
        icon={<Activity className="h-6 w-6" />}
        iconColor="#06B6D4"
        breadcrumbs={[{"label":"Operations","href":"/dashboard/operations"},{"label":"Monitoring"}]}
        currentTab="summary"
        baseHref="/dashboard/operations/monitoring"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/20">
              <Activity className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">System Monitoring</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Monitoring features are coming soon. Track system metrics, uptime, and performance indicators.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
