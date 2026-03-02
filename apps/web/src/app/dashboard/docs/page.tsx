'use client';

import * as React from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Search,
  Plus,
  Folders,
  FileText,
  Users,
  Clock,
  Star,
  MoreHorizontal,
  Grid3x3,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DocsPage() {
  const { currentOrganization } = useWorkspace();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Temporary mock data - will be replaced with real data from API
  const spaces = [
    {
      id: '1',
      name: 'Product Documentation',
      description: 'Product specs, roadmaps, and technical documentation',
      icon: '📚',
      color: '#3B82F6',
      pageCount: 24,
      memberCount: 8,
      lastUpdated: '2 hours ago',
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Engineering Wiki',
      description: 'Architecture decisions, coding standards, and technical guides',
      icon: '⚙️',
      color: '#8B5CF6',
      pageCount: 45,
      memberCount: 12,
      lastUpdated: '1 day ago',
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Team Handbook',
      description: 'Onboarding, processes, and company culture',
      icon: '📖',
      color: '#10B981',
      pageCount: 18,
      memberCount: 25,
      lastUpdated: '3 days ago',
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Marketing & Brand',
      description: 'Brand guidelines, marketing materials, and campaigns',
      icon: '🎨',
      color: '#F59E0B',
      pageCount: 12,
      memberCount: 6,
      lastUpdated: '1 week ago',
      isFavorite: false,
    },
  ];

  const recentPages = [
    { id: '1', title: 'Q1 Product Roadmap', space: 'Product Documentation', updated: '2 hours ago' },
    { id: '2', title: 'API Authentication Guide', space: 'Engineering Wiki', updated: '5 hours ago' },
    { id: '3', title: 'Employee Onboarding Checklist', space: 'Team Handbook', updated: '1 day ago' },
    { id: '4', title: 'Brand Color Palette', space: 'Marketing & Brand', updated: '2 days ago' },
    { id: '5', title: 'Database Schema Design', space: 'Engineering Wiki', updated: '3 days ago' },
  ];

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22]">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#16A085] shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Onekof Wiki
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentOrganization?.name} Knowledge Base
                </p>
              </div>
            </div>

            <Button className="bg-[#1C8C7D] hover:bg-[#156B60] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </div>

          {/* Search and View Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search spaces and pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-[#161B22] border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600',
                  viewMode === 'grid' && 'bg-[#1C8C7D] hover:bg-[#156B60] text-white shadow-sm'
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600',
                  viewMode === 'list' && 'bg-[#1C8C7D] hover:bg-[#156B60] text-white shadow-sm'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Recent Pages */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Recent Pages
            </h2>
            <Link
              href="/dashboard/docs/recent"
              className="text-sm text-[#1C8C7D] hover:text-[#156B60] font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {recentPages.map((page, index) => (
              <Link
                key={page.id}
                href={`/dashboard/docs/pages/${page.id}`}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                  index !== recentPages.length - 1 && 'border-b border-slate-200 dark:border-slate-700'
                )}
              >
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {page.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {page.space} • Updated {page.updated}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Spaces */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Folders className="h-5 w-5 text-slate-400" />
              All Spaces ({filteredSpaces.length})
            </h2>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSpaces.map((space) => (
                <Link
                  key={space.id}
                  href={`/dashboard/docs/spaces/${space.id}`}
                  className="group relative bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:shadow-lg hover:border-[#1C8C7D]/50 dark:hover:border-[#1C8C7D]/70 transition-all"
                >
                  {space.isFavorite && (
                    <Star className="absolute top-3 right-3 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}

                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl mb-3"
                    style={{ backgroundColor: space.color + '20' }}
                  >
                    {space.icon}
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-[#1C8C7D] transition-colors">
                    {space.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                    {space.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {space.pageCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {space.memberCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {space.lastUpdated}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {filteredSpaces.map((space, index) => (
                <Link
                  key={space.id}
                  href={`/dashboard/docs/spaces/${space.id}`}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors',
                    index !== filteredSpaces.length - 1 && 'border-b border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl shrink-0"
                    style={{ backgroundColor: space.color + '20' }}
                  >
                    {space.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {space.name}
                      </h3>
                      {space.isFavorite && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {space.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{space.pageCount} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{space.memberCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{space.lastUpdated}</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {filteredSpaces.length === 0 && (
            <div className="text-center py-12">
              <Folders className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No spaces found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Try adjusting your search or create a new space
              </p>
              <Button className="bg-[#1C8C7D] hover:bg-[#156B60] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
