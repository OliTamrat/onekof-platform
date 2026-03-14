'use client';

import { EmptyState } from '@/components/ui/empty-state';

export default function ResourcesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Resources</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Manage resource allocation and capacity planning
      </p>
      <EmptyState preset="resources" className="mt-8" />
    </div>
  );
}
