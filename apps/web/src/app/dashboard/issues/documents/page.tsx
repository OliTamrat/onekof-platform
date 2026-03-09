'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { FileText } from 'lucide-react';

export default function IssuesDocumentsPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Documents"
        icon={<FileText className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="documents"
        baseHref="/dashboard/issues"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Documents Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
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
