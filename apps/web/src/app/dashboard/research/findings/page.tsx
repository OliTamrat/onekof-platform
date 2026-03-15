'use client';

import {
  FileText
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function FindingsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Findings"
        icon={<FileText className="h-6 w-6" />}
        iconColor="#3B82F6"
        breadcrumbs={[{"label":"Research","href":"/dashboard/research"},{"label":"Findings"}]}
        currentTab="list"
        baseHref="/dashboard/research/findings"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#3B82F620' }}>
              <FileText className="h-8 w-8" style={{ color: '#3B82F6' }} />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Findings</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Document research findings and insights. Features are coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
