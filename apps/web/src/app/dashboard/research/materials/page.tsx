'use client';

import {
  FileSpreadsheet
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function MaterialsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Materials"
        icon={<FileSpreadsheet className="h-6 w-6" />}
        iconColor="#F59E0B"
        breadcrumbs={[{"label":"Research","href":"/dashboard/research"},{"label":"Materials"}]}
        currentTab="list"
        baseHref="/dashboard/research/materials"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#F59E0B20' }}>
              <FileSpreadsheet className="h-8 w-8" style={{ color: '#F59E0B' }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Materials</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Manage research materials and resources. Features are coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
