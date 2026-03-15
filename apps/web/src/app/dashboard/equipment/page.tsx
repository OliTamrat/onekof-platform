'use client';

import { EmptyState } from '@/components/ui/empty-state';

export default function EquipmentPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Equipment</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Track equipment inventory, maintenance, and utilization
      </p>
      <EmptyState preset="equipment" className="mt-8" />
    </div>
  );
}
