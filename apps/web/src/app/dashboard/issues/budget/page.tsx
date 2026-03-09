'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DollarSign } from 'lucide-react';

export default function IssuesBudgetPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Budget"
        icon={<DollarSign className="h-6 w-6" />}
        iconColor="#10B981"
        currentTab="budget"
        baseHref="/dashboard/issues"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Budget Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Budget</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-[#9FADBC]">
                This feature is coming soon. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
