'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';

export default function FacilitiesPage() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Facilities</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Manage buildings, rooms, and facility maintenance
      </p>
      <EmptyState preset="facilities" className="mt-8" />
    </div>
  );
}
