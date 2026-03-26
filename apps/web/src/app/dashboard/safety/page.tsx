'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';

export default function SafetyManagementPage() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Safety Management</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Monitor safety incidents, inspections, and compliance
      </p>
      <EmptyState preset="safety" className="mt-8" />
    </div>
  );
}
