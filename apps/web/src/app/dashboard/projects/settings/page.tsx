'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Book,
  Clock,
  Code,
  FileText,
  Save,
  Settings,
  Shield,
  Users,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages' },
];

const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'projectSettings.general', icon: Settings },
  { id: 'notifications', labelKey: 'projectSettings.notifications', icon: Bell },
  { id: 'members', labelKey: 'projectSettings.membersPermissions', icon: Users },
  { id: 'workflows', labelKey: 'projectSettings.workflows', icon: Workflow },
  { id: 'security', labelKey: 'projectSettings.security', icon: Shield },
];

export default function ProjectsSettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    defaultStatus: 'ACTIVE',
    autoArchive: false,
    requireApproval: true,
    allowGuestAccess: false,
    emailNotifications: true,
    slackNotifications: false,
    notifyOnMention: true,
    notifyOnAssignment: true,
    weeklyDigest: true,
  });

  const handleSave = () => {
    // Here you would save to your API
    console.log('Saving settings:', settings);
    toast.success('Settings saved');
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("projectSettings.title")}
              </h1>
            </div>

            <Button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Save className="h-4 w-4" />
              {t("projectSettings.saveChanges")}
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] overflow-y-auto">
            <div className="p-4 space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20'
                        : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(section.labelKey)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t("projectSettings.generalSettings")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.generalSettingsDesc")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {t("projectSettings.defaultProjectStatus")}
                      </label>
                      <select
                        value={settings.defaultStatus}
                        onChange={(e) => setSettings({ ...settings, defaultStatus: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="PLANNING">{t("projectSettings.planning")}</option>
                        <option value="ACTIVE">{t("projectSettings.active")}</option>
                        <option value="ON_HOLD">{t("projectSettings.onHold")}</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="autoArchive"
                        checked={settings.autoArchive}
                        onChange={(e) => setSettings({ ...settings, autoArchive: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="autoArchive" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.autoArchive")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.autoArchiveDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={settings.requireApproval}
                        onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="requireApproval" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.requireApproval")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.requireApprovalDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t("projectSettings.notificationPreferences")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.notificationPreferencesDesc")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.emailNotifications")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.emailNotificationsDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnMention"
                        checked={settings.notifyOnMention}
                        onChange={(e) => setSettings({ ...settings, notifyOnMention: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="notifyOnMention" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.notifyWhenMentioned")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.notifyWhenMentionedDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnAssignment"
                        checked={settings.notifyOnAssignment}
                        onChange={(e) => setSettings({ ...settings, notifyOnAssignment: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="notifyOnAssignment" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.notifyOnAssignment")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.notifyOnAssignmentDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="weeklyDigest"
                        checked={settings.weeklyDigest}
                        onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="weeklyDigest" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.weeklyProjectDigest")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.weeklyProjectDigestDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'members' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t("projectSettings.membersPermissions")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.membersPermissionsDesc")}
                    </p>
                  </div>

                  <div className="p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.membersComingSoon")}
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'workflows' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t("projectSettings.workflows")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.workflowsDesc")}
                    </p>
                  </div>

                  <div className="p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.workflowsComingSoon")}
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {t("projectSettings.security")}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {t("projectSettings.securityDesc")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input
                        type="checkbox"
                        id="allowGuestAccess"
                        checked={settings.allowGuestAccess}
                        onChange={(e) => setSettings({ ...settings, allowGuestAccess: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="allowGuestAccess" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          {t("projectSettings.allowGuestAccess")}
                        </label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">
                          {t("projectSettings.allowGuestAccessDesc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
