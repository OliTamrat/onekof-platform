'use client';

import * as React from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Search,
  FileText,
  User,
  ArrowLeft,
  Calendar,
  Folders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RecentPagesPage() {
  const { currentOrganization } = useWorkspace();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Temporary mock data - will be replaced with real data from API
  const recentPages = [
    {
      id: '1',
      title: 'Q1 Product Roadmap',
      space: 'Product Documentation',
      spaceColor: '#3B82F6',
      author: 'John Doe',
      lastUpdated: '2 hours ago',
      updatedAt: new Date('2026-03-01T20:00:00'),
      excerpt: 'Detailed roadmap for Q1 2026 including new features, improvements, and timeline...',
    },
    {
      id: '2',
      title: 'API Authentication Guide',
      space: 'Engineering Wiki',
      spaceColor: '#8B5CF6',
      author: 'Jane Smith',
      lastUpdated: '5 hours ago',
      updatedAt: new Date('2026-03-01T17:00:00'),
      excerpt: 'Complete guide to implementing OAuth 2.0 authentication in our API services...',
    },
    {
      id: '3',
      title: 'Employee Onboarding Checklist',
      space: 'Team Handbook',
      spaceColor: '#10B981',
      author: 'Mike Johnson',
      lastUpdated: '1 day ago',
      updatedAt: new Date('2026-02-28T22:00:00'),
      excerpt: 'Step-by-step checklist for new employee onboarding process including access setup...',
    },
    {
      id: '4',
      title: 'Brand Color Palette',
      space: 'Marketing & Brand',
      spaceColor: '#F59E0B',
      author: 'Sarah Williams',
      lastUpdated: '2 days ago',
      updatedAt: new Date('2026-02-27T22:00:00'),
      excerpt: 'Official brand colors, usage guidelines, and accessibility considerations...',
    },
    {
      id: '5',
      title: 'Database Schema Design',
      space: 'Engineering Wiki',
      spaceColor: '#8B5CF6',
      author: 'Tom Brown',
      lastUpdated: '3 days ago',
      updatedAt: new Date('2026-02-26T22:00:00'),
      excerpt: 'Comprehensive database schema design for the new multi-tenant architecture...',
    },
    {
      id: '6',
      title: 'Security Best Practices',
      space: 'Engineering Wiki',
      spaceColor: '#8B5CF6',
      author: 'Alice Cooper',
      lastUpdated: '5 days ago',
      updatedAt: new Date('2026-02-24T22:00:00'),
      excerpt: 'Security guidelines and best practices for development team including OWASP top 10...',
    },
    {
      id: '7',
      title: 'Q4 2025 Retrospective',
      space: 'Team Handbook',
      spaceColor: '#10B981',
      author: 'John Doe',
      lastUpdated: '1 week ago',
      updatedAt: new Date('2026-02-22T22:00:00'),
      excerpt: 'Team retrospective for Q4 2025 with learnings, achievements, and improvement areas...',
    },
    {
      id: '8',
      title: 'Product Launch Campaign',
      space: 'Marketing & Brand',
      spaceColor: '#F59E0B',
      author: 'Sarah Williams',
      lastUpdated: '1 week ago',
      updatedAt: new Date('2026-02-22T22:00:00'),
      excerpt: 'Marketing campaign strategy for upcoming product launch including channels and timeline...',
    },
  ];

  const filteredPages = recentPages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group pages by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groupedPages = {
    today: filteredPages.filter(p => p.updatedAt.toDateString() === today.toDateString()),
    yesterday: filteredPages.filter(p => p.updatedAt.toDateString() === yesterday.toDateString()),
    thisWeek: filteredPages.filter(p =>
      p.updatedAt > lastWeek &&
      p.updatedAt.toDateString() !== today.toDateString() &&
      p.updatedAt.toDateString() !== yesterday.toDateString()
    ),
    older: filteredPages.filter(p => p.updatedAt <= lastWeek),
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/docs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#16A085] shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Recent Pages
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Pages you've viewed or edited recently
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search recent pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 dark:bg-[#161B22] border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Today */}
        {groupedPages.today.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Today
            </h2>
            <div className="space-y-2">
              {groupedPages.today.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/docs/pages/${page.id}`}
                  className="block bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: page.spaceColor + '20' }}
                    >
                      <FileText className="h-5 w-5" style={{ color: page.spaceColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {page.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Folders className="h-3 w-3" />
                          {page.space}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {page.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {page.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {groupedPages.yesterday.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Yesterday
            </h2>
            <div className="space-y-2">
              {groupedPages.yesterday.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/docs/pages/${page.id}`}
                  className="block bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: page.spaceColor + '20' }}
                    >
                      <FileText className="h-5 w-5" style={{ color: page.spaceColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {page.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Folders className="h-3 w-3" />
                          {page.space}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {page.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {page.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* This Week */}
        {groupedPages.thisWeek.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              This Week
            </h2>
            <div className="space-y-2">
              {groupedPages.thisWeek.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/docs/pages/${page.id}`}
                  className="block bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: page.spaceColor + '20' }}
                    >
                      <FileText className="h-5 w-5" style={{ color: page.spaceColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {page.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Folders className="h-3 w-3" />
                          {page.space}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {page.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {page.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Older */}
        {groupedPages.older.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Older
            </h2>
            <div className="space-y-2">
              {groupedPages.older.map((page) => (
                <Link
                  key={page.id}
                  href={`/dashboard/docs/pages/${page.id}`}
                  className="block bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: page.spaceColor + '20' }}
                    >
                      <FileText className="h-5 w-5" style={{ color: page.spaceColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {page.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Folders className="h-3 w-3" />
                          {page.space}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {page.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {page.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No recent pages found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Start browsing spaces to see recent pages here'}
            </p>
            <Link href="/dashboard/docs">
              <Button className="bg-[#1C8C7D] hover:bg-[#156B60] text-white">
                <Folders className="h-4 w-4 mr-2" />
                Browse Spaces
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}

