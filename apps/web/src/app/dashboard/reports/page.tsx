'use client';

import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-jira-dark-bg p-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
          Analytics and reporting features are coming soon. You'll be able to view insights, generate reports, and track metrics here.
        </p>
      </div>
    </div>
  );
}
