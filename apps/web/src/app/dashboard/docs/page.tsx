'use client';

import * as React from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useLanguage } from '@/contexts/language-context';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';

interface WikiCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  _count: { articles: number };
}

interface WikiArticle {
  id: string;
  title: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

interface SpaceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  pageCount: number;
  lastUpdated: string;
  isFavorite: boolean;
}

function toRelativeTime(dateStr: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  return `${weeks} weeks ago`;
}

export default function DocsPage() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [spaces, setSpaces] = React.useState<SpaceItem[]>([]);
  const [recentPages, setRecentPages] = React.useState<WikiArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, artRes] = await Promise.all([
          fetch('/api/wiki/categories'),
          fetch('/api/wiki/articles?status=all&limit=5'),
        ]);
        if (!catRes.ok || !artRes.ok) throw new Error('Failed to fetch');
        const catData: WikiCategory[] = await catRes.json();
        const artData: ArticlesResponse = await artRes.json();

        const mappedSpaces: SpaceItem[] = catData.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description ?? '',
          icon: cat.icon,
          color: cat.color,
          pageCount: cat._count.articles,
          lastUpdated: '',
          isFavorite: false,
        }));

        setSpaces(mappedSpaces);
        setRecentPages(artData.articles);
      } catch {
        setError(t('docs.failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t]);

  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const favoriteSpaces = filteredSpaces.filter((s) => s.isFavorite);
  const otherSpaces = filteredSpaces.filter((s) => !s.isFavorite);

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

        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between gap-3 px-3 md:px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-[#1C8C7D] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#1C8C7D] text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1C8C7D] text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-slate-700'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Link href="/dashboard/docs/pages/new">
                <Button className="flex items-center gap-2 rounded-md bg-[#1C8C7D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#156B60] transition-colors">
                  <Plus className="h-4 w-4" />
                  {t('common.create')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {loading && (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-slate-400">
              {t('common.loading')}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 py-6">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {recentPages.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      {t('nav.recentPages').toUpperCase()}
                    </h2>
                    <Link
                      href="/dashboard/docs/recent"
                      className="text-sm font-medium text-[#1C8C7D] hover:text-gray-900 dark:hover:text-white transition-colors"
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
                          index !== recentPages.length - 1 && 'border-b border-gray-200 dark:border-slate-700',
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0 text-gray-400 dark:text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {page.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            {page.category?.name && `${page.category.name} • `}
                            {t('common.updated')} {toRelativeTime(page.updatedAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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
                      <Link href="/dashboard/docs/pages/new">
                        <Button className="mt-4 flex items-center gap-2 rounded-md bg-[#1C8C7D] px-4 py-2 text-sm font-medium text-white hover:bg-[#156B60] transition-colors">
                          <Plus className="h-4 w-4" />
                          {t('emptyStates.createSpace')}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface SpaceCardProps {
  space: SpaceItem;
}

function SpaceCard({ space }: SpaceCardProps) {
  return (
    <Link
      href={`/dashboard/docs/spaces/${space.id}`}
      className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-[#1C8C7D]"
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

      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors">
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
      </div>
    </Link>
  );
}

interface SpaceListItemProps {
  space: SpaceItem;
  showBorder: boolean;
  pagesLabel: string;
}

function SpaceListItem({ space, showBorder, pagesLabel }: SpaceListItemProps) {
  return (
    <Link
      href={`/dashboard/docs/spaces/${space.id}`}
      className={cn(
        'flex items-center gap-4 px-4 md:px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-[#282E33]',
        showBorder && 'border-b border-gray-200 dark:border-slate-700',
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
        <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
          {space.description}
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-slate-400 md:hidden">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{space.pageCount} {pagesLabel}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{space.pageCount} {pagesLabel}</span>
        </div>
      </div>

      <Button variant="ghost" size="icon" className="shrink-0 hover:bg-gray-100 dark:hover:bg-slate-700">
        <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-slate-400" />
      </Button>
    </Link>
  );
}
