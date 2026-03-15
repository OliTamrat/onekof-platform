'use client';

import { EmptyState } from '@/components/ui/empty-state';

export default function ImpactMeasurementPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Impact Measurement</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Measure and report on project outcomes and KPIs
      </p>
      <EmptyState preset="impact" className="mt-8" />
    </div>
  );
}
