'use client';

import {
  FileSpreadsheet
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function DataPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Data"
        icon={<FileSpreadsheet className="h-6 w-6" />}
        iconColor="#8B5CF6"
        breadcrumbs={[{"label":"Research","href":"/dashboard/research"},{"label":"Data"}]}
        currentTab="list"
        baseHref="/dashboard/research/data"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#8B5CF620' }}>
              <FileSpreadsheet className="h-8 w-8" style={{ color: '#8B5CF6' }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Data</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Collect and manage research data for feasibility studies. Features are coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
