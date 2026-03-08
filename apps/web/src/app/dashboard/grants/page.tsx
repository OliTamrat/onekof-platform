'use client';

import { DollarSign } from 'lucide-react';

export default function GrantsPage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-jira-dark-bg p-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Grants</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
          Grant management features are coming soon
        </p>
      </div>
    </div>
  );
}
