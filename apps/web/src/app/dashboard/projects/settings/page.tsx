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
  Users,
  Workflow
} from 'lucide-react';

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
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'members', label: 'Members & Permissions', icon: Users },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function ProjectsSettingsPage() {
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
    alert('Settings saved successfully!');
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Project Settings
              </h1>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
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
          <div className="w-64 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-y-auto">
            <div className="p-4 space-y-1">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/20'
                        : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </button>
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
                      General Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Configure default project settings and behavior
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Default Project Status
                      </label>
                      <select
                        value={settings.defaultStatus}
                        onChange={(e) => setSettings({ ...settings, defaultStatus: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="PLANNING">Planning</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On Hold</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="autoArchive"
                        checked={settings.autoArchive}
                        onChange={(e) => setSettings({ ...settings, autoArchive: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="autoArchive" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Auto-archive completed projects
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Automatically archive projects 30 days after completion
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={settings.requireApproval}
                        onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="requireApproval" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Require approval for project creation
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          New projects must be approved by an admin before becoming active
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
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Manage how and when you receive project notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Email notifications
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Receive email updates for project activity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnMention"
                        checked={settings.notifyOnMention}
                        onChange={(e) => setSettings({ ...settings, notifyOnMention: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="notifyOnMention" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Notify when mentioned
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Get notified when someone mentions you in a comment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="notifyOnAssignment"
                        checked={settings.notifyOnAssignment}
                        onChange={(e) => setSettings({ ...settings, notifyOnAssignment: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="notifyOnAssignment" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Notify on assignment
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Get notified when assigned to a project or task
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="weeklyDigest"
                        checked={settings.weeklyDigest}
                        onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="weeklyDigest" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Weekly project digest
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Receive a weekly summary of project activity
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
                      Members & Permissions
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Manage access control and permissions
                    </p>
                  </div>

                  <div className="p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Member management and role-based access control settings coming soon...
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'workflows' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Workflows
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Customize project workflows and statuses
                    </p>
                  </div>

                  <div className="p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Workflow customization coming soon...
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Security
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Security and privacy settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-[#282E33] rounded-lg">
                      <input
                        type="checkbox"
                        id="allowGuestAccess"
                        checked={settings.allowGuestAccess}
                        onChange={(e) => setSettings({ ...settings, allowGuestAccess: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="allowGuestAccess" className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                          Allow guest access
                        </label>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          Enable external users to view projects with read-only access
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
