'use client';

import { useState } from 'react';
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

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/teams/overview' },
  { id: 'teams', label: 'Teams', icon: null, href: '/dashboard/teams' },
] as const;

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function TeamsSettingsPage() {
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
    alert('Settings saved successfully!');
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Team Settings</h1>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white">
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-64 border-r border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] overflow-y-auto">
            <div className="p-4 space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-[#0065FF]/10 text-[#0065FF] dark:bg-[#0065FF]/20' : 'text-gray-700 dark:text-[#9FADBC] hover:bg-gray-100 dark:hover:bg-[#282E33]'}`}>
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
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
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Configure team settings</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Maximum Team Size</label>
                      <input type="number" value={settings.maxTeamSize} onChange={(e) => setSettings({ ...settings, maxTeamSize: parseInt(e.target.value) })} className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20" />
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="allowSelfJoin" checked={settings.allowSelfJoin} onChange={(e) => setSettings({ ...settings, allowSelfJoin: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="allowSelfJoin" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Allow self-join</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Team members can join teams without invitation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="requireApproval" checked={settings.requireApproval} onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="requireApproval" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Require approval for new teams</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">New teams must be approved before activation</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Manage team notifications</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="emailNotifications" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Email notifications</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Receive email updates for team activity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="notifyOnInvite" checked={settings.notifyOnInvite} onChange={(e) => setSettings({ ...settings, notifyOnInvite: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnInvite" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Notify on team invite</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Get notified when invited to a team</p>
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
