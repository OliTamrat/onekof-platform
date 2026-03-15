'use client';

import {
  Map
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function PlansPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Plans"
        icon={<Map className="h-6 w-6" />}
        iconColor="#10B981"
        breadcrumbs={[{"label":"Research","href":"/dashboard/research"},{"label":"Plans"}]}
        currentTab="list"
        baseHref="/dashboard/research/plans"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#10B98120' }}>
              <Map className="h-8 w-8" style={{ color: '#10B981' }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Plans</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Develop and track research plans and methodologies. Features are coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
