'use client';

import { EmptyState } from '@/components/ui/empty-state';

export default function SitesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Sites</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Track project sites and geographic operations
      </p>
      <EmptyState preset="sites" className="mt-8" />
    </div>
  );
}
