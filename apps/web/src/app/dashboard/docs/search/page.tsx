'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Search, FileText } from 'lucide-react';

export default function DocsSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppLayout>
      <UnifiedPageHeader title="Search Docs" icon={<Search className="h-6 w-6" />} iconColor="#06B6D4" currentTab="search" baseHref="/dashboard/docs" />
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search documentation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 dark:border-[#2C333A] rounded-lg bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0065FF] focus:border-transparent" />
            </div>
          </div>
          {searchQuery && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-[#9FADBC]">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try different keywords or browse all pages</p>
            </div>
          )}
          {!searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-[#9FADBC]">Start typing to search documentation</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
