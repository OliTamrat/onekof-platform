'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Users, FileText, User } from 'lucide-react';

const SHARED_DOCS = [
  { id: 1, title: 'Project Proposal', sharedWith: 5, sharedBy: 'Sarah Johnson', sharedDate: '2024-03-15' },
  { id: 2, title: 'Marketing Strategy', sharedWith: 8, sharedBy: 'Mike Wilson', sharedDate: '2024-03-10' },
  { id: 3, title: 'Budget Analysis', sharedWith: 3, sharedBy: 'David Lee', sharedDate: '2024-03-08' },
];

export default function DocumentsSharedPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader title="Shared Documents" icon={<Users className="h-6 w-6" />} iconColor="#3B82F6" currentTab="shared" baseHref="/dashboard/documents" />
      <div className="p-6">
        <div className="space-y-3">
          {SHARED_DOCS.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#3B82F6]" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{doc.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />Shared with {doc.sharedWith} people</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />By {doc.sharedBy}</span>
                    <span>{doc.sharedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
