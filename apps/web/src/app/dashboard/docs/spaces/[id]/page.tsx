'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  ArrowLeft,
  Clock,
  AlertCircle,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface WikiCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
}

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  updatedAt: string;
  viewCount: number;
  category: { id: string; name: string; color: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
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

export default function DocSpaceDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const spaceId = params.id as string;

  const [category, setCategory] = React.useState<WikiCategory | null>(null);
  const [articles, setArticles] = React.useState<WikiArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!spaceId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, artRes] = await Promise.all([
          fetch('/api/wiki/categories'),
          fetch(`/api/wiki/articles?status=all&limit=100&categoryId=${spaceId}`),
        ]);
        if (!catRes.ok || !artRes.ok) throw new Error('Failed to fetch');
        const catData: WikiCategory[] = await catRes.json();
        const artData: ArticlesResponse = await artRes.json();

        const found = catData.find((c) => c.id === spaceId) ?? null;
        setCategory(found);
        setArticles(artData.articles);
      } catch {
        setError(t('docs.failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [spaceId, t]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard/docs">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            {category && (
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  <IconRenderer iconName={category.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-sm text-gray-500 dark:text-white/70">{category.description}</p>
                  )}
                </div>
              </div>
            )}
            {!loading && !category && (
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('docs.space')}
              </h1>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-white/70">
              {!loading && `${articles.length} ${t('common.pages')}`}
            </p>
            <Link href={`/dashboard/docs/pages/new${category ? `?category=${category.id}` : ''}`}>
              <Button className="flex items-center gap-2 bg-[#1C8C7D] hover:bg-[#156B60] text-white text-sm px-4 py-1.5 rounded-md">
                <Plus className="h-4 w-4" />
                {t('docs.newPage')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading && (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-white/70">
              {t('common.loading')}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 py-6">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-white/[0.08]">
              <FolderOpen className="h-12 w-12 text-gray-300 dark:text-slate-700 mb-4" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('emptyStates.noPages')}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                {t('emptyStates.noPagesDesc')}
              </p>
              <Link href={`/dashboard/docs/pages/new${category ? `?category=${category.id}` : ''}`}>
                <Button className="mt-4 flex items-center gap-2 bg-[#1C8C7D] hover:bg-[#156B60] text-white text-sm px-4 py-2 rounded-md">
                  <Plus className="h-4 w-4" />
                  {t('docs.newPage')}
                </Button>
              </Link>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="space-y-2">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/docs/pages/${article.id}`}
                  className="flex items-start gap-4 bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 mt-0.5"
                    style={{
                      backgroundColor: (article.category?.color ?? '#1C8C7D') + '20',
                      color: article.category?.color ?? '#1C8C7D',
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-gray-500 dark:text-white/70 line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/70">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {toRelativeTime(article.updatedAt)}
                      </span>
                      {(article.viewCount ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.viewCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
