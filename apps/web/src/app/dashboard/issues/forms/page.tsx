'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { Plus, FileText, Code, BarChart3, Clock, Book, CheckSquare } from 'lucide-react';

// Tab navigation items
const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms', active: true },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

export default function IssuesFormsPage() {
  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Project Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <FileText className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Forms
              </h1>
            </div>

            <button className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Plus className="h-4 w-4" />
              Create Form
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
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#282E33] rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400 dark:text-[#6B7684]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Custom forms for your team
            </h2>
            <p className="text-gray-600 dark:text-[#9FADBC] mb-6">
              Create custom forms to collect structured information from your team. Perfect for bug reports, feature requests, and feedback.
            </p>

            <div className="grid grid-cols-1 gap-4 mt-8 max-w-md mx-auto">
              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] text-left hover:border-[#0065FF] cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Bug Report Template</h3>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                      Standard form for reporting bugs with reproduction steps
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] text-left hover:border-[#0065FF] cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                    <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Feature Request</h3>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                      Gather feature ideas and requirements from stakeholders
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] text-left hover:border-[#0065FF] cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Custom Form</h3>
                    <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                      Build your own form with custom fields
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-8 flex items-center gap-2 mx-auto rounded-md bg-[#0065FF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0052CC]">
              <Plus className="h-4 w-4" />
              Create Form
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
