'use client';

import { Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("nav.settings")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            {t('settings.orgSettings')}
          </p>
        </div>
      </div>
    </div>
  );
}
