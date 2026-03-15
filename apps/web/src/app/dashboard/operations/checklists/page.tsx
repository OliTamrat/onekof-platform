'use client';

import {
  CheckCircle2
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function ChecklistsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Checklists"
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconColor="#10B981"
        breadcrumbs={[{"label":"Operations","href":"/dashboard/operations"},{"label":"Checklists"}]}
        currentTab="list"
        baseHref="/dashboard/operations/checklists"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Operational Checklists</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Checklist features are coming soon. Create, assign, and track routine maintenance tasks.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
