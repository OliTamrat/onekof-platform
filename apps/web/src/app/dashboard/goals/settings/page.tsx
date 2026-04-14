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
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'goals', label: 'Goals', icon: null, href: '/dashboard/goals' },
];

const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'goalSettings.general', icon: Settings },
  { id: 'notifications', labelKey: 'goalSettings.notifications', icon: Bell },
  { id: 'okrs', labelKey: 'goalSettings.okrSettings', icon: Target },
  { id: 'security', labelKey: 'goalSettings.security', icon: Shield },
];

export default function GoalsSettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    defaultCycle: 'QUARTERLY',
    autoRollover: false,
    requireOwner: true,
    emailNotifications: true,
    notifyOnProgress: true,
    weeklyReminders: true,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    toast.success('Settings saved');
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t("goalSettings.title")}</h1>
            </div>
            <Button onClick={handleSave} className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Save className="h-4 w-4" />
              {t("goalSettings.saveChanges")}
            </Button>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white">
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-64 border-r border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] overflow-y-auto">
            <div className="p-4 space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <Button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20' : 'text-gray-700 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-[#181D23]'}`}>
                    <Icon className="h-4 w-4" />
                    {t(section.labelKey)}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("goalSettings.generalSettings")}</h2>
                    <p className="text-sm text-gray-600 dark:text-white/50">{t("goalSettings.generalSettingsDesc")}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("goalSettings.defaultGoalCycle")}</label>
                      <select value={settings.defaultCycle} onChange={(e) => setSettings({ ...settings, defaultCycle: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                        <option value="MONTHLY">{t("goalSettings.monthly")}</option>
                        <option value="QUARTERLY">{t("goalSettings.quarterly")}</option>
                        <option value="YEARLY">{t("goalSettings.yearly")}</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="autoRollover" checked={settings.autoRollover} onChange={(e) => setSettings({ ...settings, autoRollover: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="autoRollover" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("goalSettings.autoRollover")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/50 mt-1">{t("goalSettings.autoRolloverDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="requireOwner" checked={settings.requireOwner} onChange={(e) => setSettings({ ...settings, requireOwner: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="requireOwner" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("goalSettings.requireGoalOwner")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/50 mt-1">{t("goalSettings.requireGoalOwnerDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("goalSettings.notificationPreferences")}</h2>
                    <p className="text-sm text-gray-600 dark:text-white/50">{t("goalSettings.notificationPreferencesDesc")}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="emailNotifications" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("goalSettings.emailNotifications")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/50 mt-1">{t("goalSettings.emailNotificationsDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="notifyOnProgress" checked={settings.notifyOnProgress} onChange={(e) => setSettings({ ...settings, notifyOnProgress: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnProgress" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("goalSettings.notifyOnProgress")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/50 mt-1">{t("goalSettings.notifyOnProgressDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="weeklyReminders" checked={settings.weeklyReminders} onChange={(e) => setSettings({ ...settings, weeklyReminders: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="weeklyReminders" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("goalSettings.weeklyGoalReminders")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/50 mt-1">{t("goalSettings.weeklyGoalRemindersDesc")}</p>
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
