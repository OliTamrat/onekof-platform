'use client';

import {
  Map
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function CampaignsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Campaigns"
        icon={<Map className="h-6 w-6" />}
        iconColor="#EC4899"
        breadcrumbs={[{"label":"Marketing","href":"/dashboard/marketing"},{"label":"Campaigns"}]}
        currentTab="list"
        baseHref="/dashboard/marketing/campaigns"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/20">
              <Map className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Campaign Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Campaign features are coming soon. Plan, execute, and track marketing campaigns across channels.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
