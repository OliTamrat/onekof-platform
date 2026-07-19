'use client';

import { useParams } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectAutomationPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-[#1B1F23] p-6">
      <Zap className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('nav.automation')}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        {t('common.comingSoon')}
      </p>
    </div>
  );
}
