'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Settings, Save, Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { AUTOMATIONS_TABS } from '@/config/department-tabs';

export default function AutomationsSettingsPage() {
  const { t } = useLanguage();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoRetry, setEnableAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState('3');
  const [executionTimeout, setExecutionTimeout] = useState('30');

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('automations.settingsTitle')}
        icon={<Settings className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="settings"
        baseHref="/dashboard/automations"
        customTabs={AUTOMATIONS_TABS}
        showTabs
      />
      <div className="p-6 max-w-4xl">
        {/* Notifications Section */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-[#EC4899]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('automations.settingsNotifications')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('automations.settingsEnableNotifications')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('automations.settingsNotificationsDesc')}
                </p>
              </div>
              <Button
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enableNotifications ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Execution Settings Section */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-[#EC4899]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('automations.settingsExecution')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('automations.settingsEnableAutoRetry')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('automations.settingsAutoRetryDesc')}
                </p>
              </div>
              <Button
                onClick={() => setEnableAutoRetry(!enableAutoRetry)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enableAutoRetry ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableAutoRetry ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('automations.settingsMaxRetries')}
              </label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                min="1"
                max="10"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('automations.settingsExecutionTimeout')}
              </label>
              <input
                type="number"
                value={executionTimeout}
                onChange={(e) => setExecutionTimeout(e.target.value)}
                min="10"
                max="300"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-700">
            {t('common.cancel')}
          </Button>
          <Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md">
            <Save className="h-4 w-4" />
            {t('automations.settingsSave')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
