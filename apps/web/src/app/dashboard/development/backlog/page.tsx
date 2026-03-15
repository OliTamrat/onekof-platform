'use client';

import {
  ListChecks
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function BacklogPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Backlog"
        icon={<ListChecks className="h-6 w-6" />}
        iconColor="#22C55E"
        breadcrumbs={[{"label":"Development","href":"/dashboard/development"},{"label":"Backlog"}]}
        currentTab="list"
        baseHref="/dashboard/development/backlog"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <ListChecks className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Backlog Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Backlog features are coming soon. Organize and prioritize work items for upcoming sprints.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
