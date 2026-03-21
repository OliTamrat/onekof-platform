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
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IconRenderer } from '@/components/ui/icon-renderer';

const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/docs/summary' },
  { id: 'spaces', label: 'Spaces', icon: null, active: true, href: '/dashboard/docs' },
  { id: 'recent', label: 'Recent', icon: null, href: '/dashboard/docs/recent' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/docs/settings' },
];

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
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          {/* Header Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-3 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Docs</h1>
            </div>

            <Button
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-3 md:px-6 overflow-x-auto">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-3 md:px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search spaces and pages..."
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
                RECENT PAGES
              </h2>
              <Link
                href="/dashboard/docs/recent"
                className="text-sm font-medium text-primary-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View all →
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
                STARRED SPACES
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
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Spaces */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
              {favoriteSpaces.length > 0 ? 'ALL SPACES' : `YOUR SPACES (${filteredSpaces.length})`}
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
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700">
                <Folders className="h-12 w-12 text-gray-300 dark:text-slate-700" />
                <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                  {searchQuery ? 'No spaces found' : 'No spaces yet'}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                  {searchQuery
                    ? 'Try adjusting your search or create a new space'
                    : 'Create your first space to start building your knowledge base'}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4 flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Space
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
}

function SpaceListItem({ space, showBorder }: SpaceListItemProps) {
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

      <Button variant="ghost" size="icon" className="shrink-0 hover:bg-gray-100 dark:hover:bg-slate-700">
        <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
      </Button>
    </Link>
  );
}
