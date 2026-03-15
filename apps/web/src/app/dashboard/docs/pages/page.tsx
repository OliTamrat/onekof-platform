'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { FileText, Search } from 'lucide-react';

const PAGES = [
  { id: 1, title: 'Engineering Standards', folder: 'Technical', lastModified: '2024-03-15' },
  { id: 2, title: 'Design Guidelines', folder: 'Design', lastModified: '2024-03-10' },
  { id: 3, title: 'HR Policies', folder: 'HR', lastModified: '2024-03-08' },
  { id: 4, title: 'Sales Playbook', folder: 'Sales', lastModified: '2024-03-05' },
];

export default function DocsPagesPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader title="All Pages" icon={<FileText className="h-6 w-6" />} iconColor="#06B6D4" currentTab="pages" baseHref="/dashboard/docs" />
      <div className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search pages..." className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-[#2C333A] rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF]" />
          </div>
        </div>
        <div className="space-y-3">
          {PAGES.map((page) => (
            <div key={page.id} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#06B6D4]" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{page.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-[#9FADBC] mt-1">{page.folder}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-[#9FADBC]">{page.lastModified}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
