'use client';

import {
  Activity
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';

export default function OperationsPage() {
  return (
    <AppLayout>
      <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operations</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor operations, manage incidents, and track maintenance checklists
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Activity className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Operations Management</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            Operations tools are coming soon. Monitor systems, manage incidents, and track checklists.
          </p>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
