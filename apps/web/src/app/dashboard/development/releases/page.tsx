'use client';

import {
  GitBranch
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function ReleasesPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Releases"
        icon={<GitBranch className="h-6 w-6" />}
        iconColor="#A855F7"
        breadcrumbs={[{"label":"Development","href":"/dashboard/development"},{"label":"Releases"}]}
        currentTab="list"
        baseHref="/dashboard/development/releases"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <GitBranch className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Release Management</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Release management features are coming soon. Track versions, deployment status, and release notes.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
