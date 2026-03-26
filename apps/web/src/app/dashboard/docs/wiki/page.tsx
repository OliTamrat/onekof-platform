'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BookOpen, Search, FileText, Calendar, User } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const WIKI_PAGES = [
  { id: 1, title: 'Getting Started Guide', category: 'Guides', author: 'Admin', lastUpdated: '2024-03-15', views: 234 },
  { id: 2, title: 'API Documentation', category: 'Technical', author: 'Engineering Team', lastUpdated: '2024-03-10', views: 456 },
  { id: 3, title: 'Team Processes', category: 'Processes', author: 'HR Team', lastUpdated: '2024-03-08', views: 123 },
  { id: 4, title: 'Product Roadmap', category: 'Product', author: 'Product Team', lastUpdated: '2024-03-05', views: 345 },
  { id: 5, title: 'Security Guidelines', category: 'Security', author: 'Security Team', lastUpdated: '2024-03-01', views: 189 },
];

export default function DocsWikiPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const filteredPages = WIKI_PAGES.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <UnifiedPageHeader title="Wiki" icon={<BookOpen className="h-6 w-6" />} iconColor="#06B6D4" currentTab="wiki" baseHref="/dashboard/docs" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search wiki..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"><BookOpen className="h-4 w-4" />New Page</Button>
        </div>
        <div className="space-y-3">
          {filteredPages.map((page) => (
            <div key={page.id} onClick={() => { setSelectedPage(page); setIsSlideoutOpen(true); }} className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-[#06B6D4]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{page.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400">{page.category}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{page.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Updated {page.lastUpdated}</span>
                    <span>{page.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideoutPanel isOpen={isSlideoutOpen} onClose={() => setIsSlideoutOpen(false)} title={selectedPage?.title || 'Wiki Page'}>
        <SlideoutPanelContent>
          <SlideoutPanelSection title="Page Information">
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedPage?.category}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Author</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedPage?.author}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedPage?.lastUpdated}</p></div>
              <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Views</label><p className="text-sm text-gray-900 dark:text-white mt-1">{selectedPage?.views}</p></div>
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
