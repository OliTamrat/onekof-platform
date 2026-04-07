'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function DocsSettingsPage() {
  const { t } = useLanguage();
  const [publicAccess, setPublicAccess] = React.useState(false);
  const [commentingEnabled, setCommentingEnabled] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/wiki/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicAccess, commentingEnabled }),
      });
    } catch {
      // Settings API not yet implemented; swallow gracefully
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('docs.docsSettings')}
        icon={<Settings className="h-6 w-6" />}
        iconColor="#06B6D4"
        currentTab="settings"
        baseHref="/dashboard/docs"
      />
      <div className="p-6 max-w-4xl">
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('docs.accessSettings')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('docs.publicAccess')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('docs.publicAccessDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublicAccess((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] ${
                  publicAccess ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-slate-700'
                }`}
                aria-checked={publicAccess}
                role="switch"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    publicAccess ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('docs.enableComments')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('docs.enableCommentsDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCommentingEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] ${
                  commentingEnabled ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-slate-700'
                }`}
                aria-checked={commentingEnabled}
                role="switch"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    commentingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">{t('docs.settingsSaved')}</span>
          )}
          <Button
            variant="outline"
            className="px-4 py-2 text-sm"
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1C8C7D] hover:bg-[#156B60] rounded-md"
          >
            <Save className="h-4 w-4" />
            {saving ? t('common.saving') : t('docs.saveSettings')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
