'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function PatientsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('patientsPage.title')}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {t('patientsPage.description')}
      </p>
      <EmptyState
        icon={Stethoscope}
        title={t('emptyStates.noPatients')}
        description={t('emptyStates.noPatientsDesc')}
        actionLabel={t('emptyStates.addPatient')}
        className="mt-8"
      />
    </div>
  );
}
