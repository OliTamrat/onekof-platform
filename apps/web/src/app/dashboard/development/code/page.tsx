'use client';

import {
  FileText
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function CodeReviewPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Code Review"
        icon={<FileText className="h-6 w-6" />}
        iconColor="#6366F1"
        breadcrumbs={[{"label":"Development","href":"/dashboard/development"},{"label":"Code Review"}]}
        currentTab="list"
        baseHref="/dashboard/development/code"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Code Review</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Code review features are coming soon. Review pull requests, leave comments, and approve changes.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
