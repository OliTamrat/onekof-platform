'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Settings, Save } from 'lucide-react';

export default function DocsSettingsPage() {
  const [publicAccess, setPublicAccess] = useState(false);
  const [commentingEnabled, setCommentingEnabled] = useState(true);

  return (
    <AppLayout>
      <UnifiedPageHeader title="Docs Settings" icon={<Settings className="h-6 w-6" />} iconColor="#06B6D4" currentTab="settings" baseHref="/dashboard/docs" />
      <div className="p-6 max-w-4xl">
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Access</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allow anyone to view documentation</p></div>
              <button onClick={() => setPublicAccess(!publicAccess)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publicAccess ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publicAccess ? 'translate-x-6' : 'translate-x-1'}`}/></button>
            </div>
            <div className="flex items-center justify-between">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Comments</label><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allow users to comment on pages</p></div>
              <button onClick={() => setCommentingEnabled(!commentingEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${commentingEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${commentingEnabled ? 'translate-x-6' : 'translate-x-1'}`}/></button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-700">Cancel</button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"><Save className="h-4 w-4" />Save Settings</button>
        </div>
      </div>
    </AppLayout>
  );
}
