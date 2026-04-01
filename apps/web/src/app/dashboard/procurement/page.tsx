'use client';

import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';

export default function ProcurementPage() {
  const { t } = useLanguage();
  const router = useRouter();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('procurementPage.title')}</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {t('procurementPage.description')}
      </p>
      <EmptyState preset="procurement" className="mt-8" onAction={() => router.push('/dashboard/issues?create=issue')} />
    </div>
  );
}
