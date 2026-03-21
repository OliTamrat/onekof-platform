'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { FileText, Sparkles } from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: 'Project Proposal Template', description: 'Standard template for project proposals', uses: 45 },
  { id: 2, name: 'Business Report Template', description: 'Quarterly business report template', uses: 32 },
  { id: 3, name: 'Meeting Notes Template', description: 'Template for team meeting notes', uses: 89 },
  { id: 4, name: 'Strategy Document Template', description: 'Strategic planning document template', uses: 23 },
];

export default function DocumentsTemplatesPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader title="Document Templates" icon={<FileText className="h-6 w-6" />} iconColor="#3B82F6" currentTab="templates" baseHref="/dashboard/documents" showTabs customTabs={DOCUMENTS_TABS} />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Sparkles className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">{template.description}</p>
                  <div className="text-xs text-gray-600 dark:text-slate-400">Used {template.uses} times</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
