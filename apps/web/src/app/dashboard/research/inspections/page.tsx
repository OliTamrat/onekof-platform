'use client';

import {
  CheckCircle2
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function InspectionsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Inspections"
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconColor="#EF4444"
        breadcrumbs={[{"label":"Research","href":"/dashboard/research"},{"label":"Inspections"}]}
        currentTab="list"
        baseHref="/dashboard/research/inspections"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#EF444420' }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: '#EF4444' }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Inspections</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Schedule and track site inspections and surveys. Features are coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
