'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Clock, FileText, User } from 'lucide-react';

const RECENT_DOCS = [
  { id: 1, title: 'Q1 Business Report', type: 'Report', lastAccessed: '5 min ago', user: 'You' },
  { id: 2, title: 'Project Proposal', type: 'Proposal', lastAccessed: '1 hour ago', user: 'Sarah Johnson' },
  { id: 3, title: 'Marketing Strategy', type: 'Strategy', lastAccessed: '2 hours ago', user: 'You' },
  { id: 4, title: 'Team Meeting Notes', type: 'Notes', lastAccessed: '1 day ago', user: 'Mike Wilson' },
];

export default function DocumentsRecentPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader title="Recent Documents" icon={<Clock className="h-6 w-6" />} iconColor="#3B82F6" currentTab="recent" baseHref="/dashboard/documents" />
      <div className="p-6">
        <div className="space-y-3">
          {RECENT_DOCS.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#3B82F6]" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 mt-1">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.user}</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400">{doc.lastAccessed}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
