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
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'teams', label: 'Teams', icon: null, href: '/dashboard/teams' },
];

const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'teamSettings.general', icon: Settings },
  { id: 'notifications', labelKey: 'teamSettings.notifications', icon: Bell },
  { id: 'members', labelKey: 'teamSettings.members', icon: Users },
  { id: 'security', labelKey: 'teamSettings.security', icon: Shield },
];

export default function TeamsSettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    maxTeamSize: 15,
    allowSelfJoin: false,
    requireApproval: true,
    emailNotifications: true,
    notifyOnInvite: true,
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t("teamSettings.title")}</h1>
            </div>
            <Button onClick={handleSave} className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Save className="h-4 w-4" />
              {t("teamSettings.saveChanges")}
            </Button>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white">
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
                  <Button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20' : 'text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23]'}`}>
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("teamSettings.generalSettings")}</h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">{t("teamSettings.generalSettingsDesc")}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{t("teamSettings.maxTeamSize")}</label>
                      <input type="number" value={settings.maxTeamSize} onChange={(e) => setSettings({ ...settings, maxTeamSize: parseInt(e.target.value) })} className="w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="allowSelfJoin" checked={settings.allowSelfJoin} onChange={(e) => setSettings({ ...settings, allowSelfJoin: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="allowSelfJoin" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("teamSettings.allowSelfJoin")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{t("teamSettings.allowSelfJoinDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="requireApproval" checked={settings.requireApproval} onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="requireApproval" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("teamSettings.requireApproval")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{t("teamSettings.requireApprovalDesc")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("teamSettings.notificationPreferences")}</h2>
                    <p className="text-sm text-gray-600 dark:text-white/70">{t("teamSettings.notificationPreferencesDesc")}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="emailNotifications" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("teamSettings.emailNotifications")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{t("teamSettings.emailNotificationsDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#181D23] rounded-lg">
                      <input type="checkbox" id="notifyOnInvite" checked={settings.notifyOnInvite} onChange={(e) => setSettings({ ...settings, notifyOnInvite: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnInvite" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">{t("teamSettings.notifyOnInvite")}</label>
                        <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{t("teamSettings.notifyOnInviteDesc")}</p>
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
