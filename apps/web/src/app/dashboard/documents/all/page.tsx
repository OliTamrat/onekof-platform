'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { Sparkles, Search, FileText, Calendar, User } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const DOCUMENTS = [
  { id: 1, title: 'Q1 Business Report', type: 'Report', createdBy: 'John Smith', createdAt: '2024-03-15', size: '2.4 MB', tags: ['Business', 'Q1'] },
  { id: 2, title: 'Project Proposal - Mobile App', type: 'Proposal', createdBy: 'Sarah Johnson', createdAt: '2024-03-10', size: '1.8 MB', tags: ['Project', 'Mobile'] },
  { id: 3, title: 'Marketing Strategy 2024', type: 'Strategy', createdBy: 'Mike Wilson', createdAt: '2024-03-08', size: '3.2 MB', tags: ['Marketing', 'Strategy'] },
  { id: 4, title: 'Team Meeting Notes', type: 'Notes', createdBy: 'Emily Brown', createdAt: '2024-03-05', size: '0.5 MB', tags: ['Meeting', 'Team'] },
  { id: 5, title: 'Budget Analysis Report', type: 'Report', createdBy: 'David Lee', createdAt: '2024-03-01', size: '1.9 MB', tags: ['Budget', 'Finance'] },
  { id: 6, title: 'Product Roadmap', type: 'Roadmap', createdBy: 'Lisa Anderson', createdAt: '2024-02-28', size: '2.1 MB', tags: ['Product', 'Planning'] },
];

export default function DocumentsAllPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredDocs = DOCUMENTS.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <UnifiedPageHeader title="All Documents" icon={<Sparkles className="h-6 w-6" />} iconColor="#3B82F6" currentTab="all" baseHref="/dashboard/documents" showTabs customTabs={DOCUMENTS_TABS} />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"><Sparkles className="h-4 w-4" />New Document</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} onClick={() => { setSelectedDoc(doc); setIsSlideoutOpen(true); }} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="h-5 w-5 text-[#3B82F6]" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">{doc.title}</h3>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">{doc.type}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-slate-400">
                <div className="flex items-center gap-1"><User className="h-3 w-3" />{doc.createdBy}</div>
                <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{doc.createdAt}</div>
                <div>{doc.size}</div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">{doc.tags.map((tag, i) => (<span key={i} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{tag}</span>))}</div>
            </div>
          ))}
        </div>
      </div>
      <SlideoutPanel isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} title={selectedDoc?.title || 'Document Details'}>
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Document Information">
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDoc?.type}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDoc?.createdBy}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created Date</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDoc?.createdAt}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDoc?.size}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label><div className="flex flex-wrap gap-1 mt-2">{selectedDoc?.tags.map((tag: string, i: number) => (<span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{tag}</span>))}</div></div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
