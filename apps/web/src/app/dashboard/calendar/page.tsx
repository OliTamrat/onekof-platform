'use client';

import {
  Calendar as CalendarIcon
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';

export default function CalendarPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Calendar"
        icon={<CalendarIcon className="h-6 w-6" />}
        iconColor="#3B82F6"

        currentTab="calendar"
        baseHref="/dashboard/calendar"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="p-8"><div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Calendar View</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Calendar functionality is coming soon. You will be able to view project timelines, schedule meetings, and track important dates.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
