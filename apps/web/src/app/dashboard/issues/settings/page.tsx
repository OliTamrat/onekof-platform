'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { Settings, Save, Eye, Workflow, Tag, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';

export default function IssuesSettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Display preferences (persisted to localStorage)
  const [defaultView, setDefaultView] = useState<'list' | 'board' | 'timeline'>('list');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showCompletedIssues, setShowCompletedIssues] = useState(true);
  const [groupByDefault, setGroupByDefault] = useState<'status' | 'priority' | 'assignee' | 'none'>('status');

  // Notification preferences
  const [emailOnAssign, setEmailOnAssign] = useState(true);
  const [emailOnMention, setEmailOnMention] = useState(true);
  const [emailOnStatusChange, setEmailOnStatusChange] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('issues-settings');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.defaultView) setDefaultView(s.defaultView);
        if (s.showSubtasks !== undefined) setShowSubtasks(s.showSubtasks);
        if (s.showCompletedIssues !== undefined) setShowCompletedIssues(s.showCompletedIssues);
        if (s.groupByDefault) setGroupByDefault(s.groupByDefault);
        if (s.emailOnAssign !== undefined) setEmailOnAssign(s.emailOnAssign);
        if (s.emailOnMention !== undefined) setEmailOnMention(s.emailOnMention);
        if (s.emailOnStatusChange !== undefined) setEmailOnStatusChange(s.emailOnStatusChange);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    const settings = {
      defaultView,
      showSubtasks,
      showCompletedIssues,
      groupByDefault,
      emailOnAssign,
      emailOnMention,
      emailOnStatusChange,
    };
    localStorage.setItem('issues-settings', JSON.stringify(settings));
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved');
    }, 300);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] ${
        checked ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-white/[0.08]'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Settings"
        icon={<Settings className="h-6 w-6" />}
        iconColor="#6B7280"
        currentTab="settings"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <div className="flex-1 overflow-auto p-3 md:p-6">
          <div className="space-y-6">
            {/* Display Preferences */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-[#1C8C7D]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Display Preferences</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Default View</label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value as any)}
                    className="w-full rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none"
                  >
                    <option value="list">List</option>
                    <option value="board">Board (Kanban)</option>
                    <option value="timeline">Timeline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Group By Default</label>
                  <select
                    value={groupByDefault}
                    onChange={(e) => setGroupByDefault(e.target.value as any)}
                    className="w-full rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none"
                  >
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="assignee">Assignee</option>
                    <option value="none">No grouping</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Show subtasks inline</label>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Display subtasks under their parent in list views</p>
                  </div>
                  <Toggle checked={showSubtasks} onChange={() => setShowSubtasks(!showSubtasks)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Show completed issues</label>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Include Done items in default lists</p>
                  </div>
                  <Toggle checked={showCompletedIssues} onChange={() => setShowCompletedIssues(!showCompletedIssues)} />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-[#1C8C7D]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email when assigned to me</label>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Receive email when an issue is assigned to you</p>
                  </div>
                  <Toggle checked={emailOnAssign} onChange={() => setEmailOnAssign(!emailOnAssign)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email on @mention</label>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Receive email when someone @mentions you</p>
                  </div>
                  <Toggle checked={emailOnMention} onChange={() => setEmailOnMention(!emailOnMention)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email on status change</label>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Receive email when issues you watch change status</p>
                  </div>
                  <Toggle checked={emailOnStatusChange} onChange={() => setEmailOnStatusChange(!emailOnStatusChange)} />
                </div>
              </div>
            </div>

            {/* Workflow & Labels Info */}
            <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Workflow className="h-5 w-5 text-[#1C8C7D]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow & Labels</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-white/50">
                Workflow statuses and labels are configured per project. Visit a project&apos;s settings page to customize them.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#1C8C7D] hover:bg-[#156B60] text-white"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
