'use client';

import {
  GitBranch
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';

export default function DevelopmentPage() {
  return (
    <AppLayout>
      <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Development</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage technical development, releases, and code reviews
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <GitBranch className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Development Management</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            Development tools are coming soon. Track backlog, manage releases, and review code.
          </p>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
