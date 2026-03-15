'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Settings, Save, Bell, Zap, Shield } from 'lucide-react';

export default function AutomationsSettingsPage() {
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAutoRetry, setEnableAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState('3');
  const [executionTimeout, setExecutionTimeout] = useState('30');

  return (
    <AppLayout>
      <UnifiedPageHeader title="Automation Settings" icon={<Settings className="h-6 w-6" />} iconColor="#EC4899" currentTab="settings" baseHref="/dashboard/automations" />
      <div className="p-6 max-w-4xl">
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Bell className="h-5 w-5 text-[#EC4899]" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Execution Notifications</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive notifications when automations execute</p></div>
              <button onClick={() => setEnableNotifications(!enableNotifications)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableNotifications ? 'bg-[#0065FF]' : 'bg-gray-200 dark:bg-[#2C333A]'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableNotifications ? 'translate-x-6' : 'translate-x-1'}`}/></button>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Zap className="h-5 w-5 text-[#EC4899]" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Settings</h2></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Auto-Retry</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically retry failed executions</p></div>
              <button onClick={() => setEnableAutoRetry(!enableAutoRetry)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableAutoRetry ? 'bg-[#0065FF]' : 'bg-gray-200 dark:bg-[#2C333A]'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableAutoRetry ? 'translate-x-6' : 'translate-x-1'}`}/></button>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Retry Attempts</label><input type="number" value={maxRetries} onChange={(e) => setMaxRetries(e.target.value)} min="1" max="10" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"/></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Execution Timeout (seconds)</label><input type="number" value={executionTimeout} onChange={(e) => setExecutionTimeout(e.target.value)} min="10" max="300" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"/></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C333A] rounded-md border border-gray-300 dark:border-[#2C333A]">Cancel</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0065FF] hover:bg-[#0052CC] rounded-md"><Save className="h-4 w-4" />Save Settings</button>
        </div>
      </div>
    </AppLayout>
  );
}
