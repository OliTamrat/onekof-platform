'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { BarChart3, Code, FileText, Clock, Book, Settings, Save, Bell, Shield, Tag } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'types', label: 'Issue Types', icon: Tag },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function IssuesSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    defaultType: 'TASK',
    defaultPriority: 'MEDIUM',
    autoAssign: false,
    emailNotifications: true,
    notifyOnMention: true,
    notifyOnStatusChange: true,
    allowAnonymous: false,
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
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Issue Settings</h1>
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
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Configure default issue settings</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Default Issue Type</label>
                      <select value={settings.defaultType} onChange={(e) => setSettings({ ...settings, defaultType: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20">
                        <option value="TASK">Task</option>
                        <option value="BUG">Bug</option>
                        <option value="STORY">Story</option>
                        <option value="EPIC">Epic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Default Priority</label>
                      <select value={settings.defaultPriority} onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20">
                        <option value="HIGHEST">Highest</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                        <option value="LOWEST">Lowest</option>
                      </select>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="autoAssign" checked={settings.autoAssign} onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="autoAssign" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Auto-assign issues</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Automatically assign new issues to project lead</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Manage issue notifications</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="emailNotifications" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Email notifications</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Receive email updates for issue activity</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="notifyOnMention" checked={settings.notifyOnMention} onChange={(e) => setSettings({ ...settings, notifyOnMention: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnMention" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Notify when mentioned</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Get notified when mentioned in an issue</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input type="checkbox" id="notifyOnStatusChange" checked={settings.notifyOnStatusChange} onChange={(e) => setSettings({ ...settings, notifyOnStatusChange: e.target.checked })} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0065FF] focus:ring-[#0065FF]" />
                      <div className="flex-1">
                        <label htmlFor="notifyOnStatusChange" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Notify on status change</label>
                        <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">Get notified when issue status changes</p>
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
