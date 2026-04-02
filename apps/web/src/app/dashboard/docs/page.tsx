'use client';

import * as React from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useLanguage } from '@/contexts/language-context';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';

export default function DocsPage() {
  const { t } = useLanguage();
  const { currentOrganization } = useWorkspace();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Temporary mock data - will be replaced with real API data
  const spaces = [
    {
      id: '1',
      name: 'Product Documentation',
      description: 'Product specs, roadmaps, and technical documentation',
      icon: 'BookOpen',
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
      icon: 'Settings',
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
      icon: 'Book',
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
      icon: 'Palette',
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

  const favoriteSpaces = filteredSpaces.filter(s => s.isFavorite);
  const otherSpaces = filteredSpaces.filter(s => !s.isFavorite);

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <UnifiedPageHeader
          title={t('nav.docs')}
          icon={<BookOpen className="h-6 w-6" />}
          iconColor="#1C8C7D"
          currentTab="docs"
          baseHref="/dashboard"
          customTabs={KNOWLEDGE_TABS}
          showTabs
          showSearch={false}
          showFilters={false}
          showGroupBy={false}
          showViewSettings={false}
          showInsights={false}
        />

        {/* Search and view mode bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between gap-3 px-3 md:px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
                <Plus className="h-4 w-4" />
                {t('common.create')}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {/* Recent Pages Section */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                {t('nav.recentPages').toUpperCase()}
              </h2>
              <Link
                href="/dashboard/docs/recent"
                className="text-sm font-medium text-primary-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {t('common.viewAll')} →
              </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
              {recentPages.map((page, index) => (
                <Link
                  key={page.id}
                  href={`/dashboard/docs/pages/${page.id}`}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#282E33]',
                    index !== recentPages.length - 1 && 'border-b border-gray-200 dark:border-slate-700'
                  )}
                >
                  <FileText className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {page.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {page.space} • Updated {page.updated}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Starred Spaces */}
          {favoriteSpaces.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {t('nav.starred').toUpperCase()}
              </h2>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {favoriteSpaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                  {favoriteSpaces.map((space, index) => (
                    <SpaceListItem
                      key={space.id}
                      space={space}
                      showBorder={index !== favoriteSpaces.length - 1}
                      pagesLabel={t('common.pages')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All / Your Spaces */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
              {favoriteSpaces.length > 0
                ? t('nav.allSpaces').toUpperCase()
                : `${t('nav.allSpaces').toUpperCase()} (${filteredSpaces.length})`}
            </h2>

            {otherSpaces.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {otherSpaces.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                  {otherSpaces.map((space, index) => (
                    <SpaceListItem
                      key={space.id}
                      space={space}
                      showBorder={index !== otherSpaces.length - 1}
                      pagesLabel={t('common.pages')}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
                <Folders className="h-12 w-12 text-gray-300 dark:text-slate-700" />
                <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                  {searchQuery ? t('emptyStates.noSpacesSearch') : t('emptyStates.noSpaces')}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  {searchQuery
                    ? t('emptyStates.noSpacesSearchDesc')
                    : t('emptyStates.noSpacesDesc')}
                </p>
                {!searchQuery && (
                  <Button className="mt-4 flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
                    <Plus className="h-4 w-4" />
                    {t('emptyStates.createSpace')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Space Card Component - Grid View
interface SpaceCardProps {
  space: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    pageCount: number;
    memberCount: number;
    lastUpdated: string;
    isFavorite: boolean;
  };
}

function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      href={`/dashboard/docs/spaces/${space.id}`}
      className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-primary-500"
    >
      {space.isFavorite && (
        <Star className="absolute right-3 top-3 h-4 w-4 fill-yellow-400 text-yellow-400" />
      )}

      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: space.color + '20', color: space.color }}
      >
        <IconRenderer iconName={space.icon} className="h-6 w-6" />
      </div>

      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
        {space.name}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
        {space.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
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
  );
}

// Space List Item Component - List View
interface SpaceListItemProps {
  space: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    pageCount: number;
    memberCount: number;
    lastUpdated: string;
    isFavorite: boolean;
  };
  showBorder: boolean;
  pagesLabel: string;
}

function SpaceListItem({ space, showBorder, pagesLabel }: SpaceListItemProps) {
  return (
    <Link
      href={`/dashboard/docs/spaces/${space.id}`}
      className={cn(
        'flex items-center gap-4 px-4 md:px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-[#282E33]',
        showBorder && 'border-b border-gray-200 dark:border-slate-700'
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: space.color + '20', color: space.color }}
      >
        <IconRenderer iconName={space.icon} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {space.name}
          </h3>
          {space.isFavorite && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          {space.description}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{space.pageCount} {pagesLabel}</span>
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

      <Button variant="ghost" size="icon" className="shrink-0 hover:bg-gray-100 dark:hover:bg-slate-700">
        <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
      </Button>
    </Link>
  );
}
