'use client';

import {
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function IncidentsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Incidents"
        icon={<AlertCircle className="h-6 w-6" />}
        iconColor="#EF4444"
        breadcrumbs={[{"label":"Operations","href":"/dashboard/operations"},{"label":"Incidents"}]}
        currentTab="list"
        baseHref="/dashboard/operations/incidents"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Incident Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Incident management features are coming soon. Report, track, and resolve operational issues quickly.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
