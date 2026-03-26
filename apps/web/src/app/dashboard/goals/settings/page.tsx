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
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'okrs', label: 'OKR Settings', icon: Target },
  { id: 'security', label: 'Security', icon: Shield },
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
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goal Settings</h1>
            </div>
            <Button onClick={handleSave} className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-64 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-y-auto">
            <div className="p-4 space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <Button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20' : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'}`}>
                    <Icon className="h-4 w-4" />
                    {section.label}
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">General Settings</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Configure goal and OKR settings</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Default Goal Cycle</label>
                      <select value={settings.defaultCycle} onChange={(e) => setSettings({ ...settings, defaultCycle: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="autoRollover" checked={settings.autoRollover} onChange={(e) => setSettings({ ...settings, autoRollover: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="autoRollover" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Auto-rollover incomplete goals</label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Automatically carry over incomplete goals to next cycle</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="requireOwner" checked={settings.requireOwner} onChange={(e) => setSettings({ ...settings, requireOwner: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="requireOwner" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Require goal owner</label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">All goals must have an assigned owner</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Manage goal notifications</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="emailNotifications" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Email notifications</label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Receive email updates for goal activity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="notifyOnProgress" checked={settings.notifyOnProgress} onChange={(e) => setSettings({ ...settings, notifyOnProgress: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnProgress" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Notify on progress updates</label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Get notified when goal progress is updated</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="weeklyReminders" checked={settings.weeklyReminders} onChange={(e) => setSettings({ ...settings, weeklyReminders: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      <div className="flex-1">
                        <label htmlFor="weeklyReminders" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Weekly goal reminders</label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Receive weekly reminders to update goal progress</p>
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
