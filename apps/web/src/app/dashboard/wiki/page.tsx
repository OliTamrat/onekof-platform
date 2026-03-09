'use client';

import {
  BookOpen
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function WikiPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Wiki"
        icon={<BookOpen className="h-6 w-6" />}
        iconColor="#3B82F6"
        breadcrumbs={[{"label":"Knowledge","href":"/dashboard/documents"},{"label":"Wiki"}]}
        currentTab="wiki"
        baseHref="/dashboard/wiki"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Wiki & Knowledge Base</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Wiki features are coming soon. Create, organize, and share knowledge across your organization.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
