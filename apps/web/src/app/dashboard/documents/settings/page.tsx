'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentsSettingsPage() {
  const [autoSave, setAutoSave] = useState(true);
  const [versionControl, setVersionControl] = useState(true);

  return (
    <AppLayout>
      <UnifiedPageHeader title="Documents Settings" icon={<Settings className="h-6 w-6" />} iconColor="#3B82F6" currentTab="settings" baseHref="/dashboard/documents" showTabs customTabs={DOCUMENTS_TABS} />
      <div className="p-6 max-w-4xl">
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Auto-Save</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically save document changes</p></div>
              <Button onClick={() => setAutoSave(!autoSave)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSave ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'}`}/></Button>
            </div>
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Version Control</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track document version history</p></div>
              <Button onClick={() => setVersionControl(!versionControl)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${versionControl ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${versionControl ? 'translate-x-6' : 'translate-x-1'}`}/></Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-700">Cancel</Button>
          <Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"><Save className="h-4 w-4" />Save Settings</Button>
        </div>
      </div>
    </AppLayout>
  );
}
