'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Search,
  FileText,
  User,
  ArrowLeft,
  Folders,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  updatedAt: string;
  category: { id: string; name: string; color: string } | null;
  createdBy: string;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

function getRelativeLabel(date: Date, t: (k: string) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours || 1}h ago`;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return `1d ago`;
  return `${diffDays}d ago`;
}

function PageCard({ article }: { article: WikiArticle }) {
  const categoryColor = article.category?.color ?? '#1C8C7D';
  const relativeTime = getRelativeLabel(new Date(article.updatedAt), (k) => k);

  return (
    <Link
      href={`/dashboard/docs/pages/${article.id}`}
      className="block bg-white dark:bg-[#22272B] border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: categoryColor + '20' }}
        >
          <FileText className="h-5 w-5" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{article.title}</h3>
          {article.excerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {article.category && (
              <div className="flex items-center gap-1">
                <Folders className="h-3 w-3" />
                {article.category.name}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {relativeTime}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RecentPagesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [articles, setArticles] = React.useState<WikiArticle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/wiki/articles?status=all&limit=50');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: ArticlesResponse = await res.json();
        // Already ordered by updatedAt desc from the API
        setArticles(data.articles);
      } catch {
        setError(t('docs.failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [t]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const grouped = {
    today: filtered.filter((a) => new Date(a.updatedAt).toDateString() === todayStr),
    yesterday: filtered.filter((a) => new Date(a.updatedAt).toDateString() === yesterdayStr),
    thisWeek: filtered.filter((a) => {
      const d = new Date(a.updatedAt);
      return (
        d > lastWeek &&
        d.toDateString() !== todayStr &&
        d.toDateString() !== yesterdayStr
      );
    }),
    older: filtered.filter((a) => new Date(a.updatedAt) <= lastWeek),
  };

  function Section({ label, items }: { label: string; items: WikiArticle[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          {label}
        </h2>
        <div className="space-y-2">
          {items.map((a) => (
            <PageCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
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
                    {t('docs.recentPages')}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('docs.recentPagesDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t('docs.searchRecentPages')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-[#161B22] border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {loading && (
            <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
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
              <Section label={t('docs.today')} items={grouped.today} />
              <Section label={t('docs.yesterday')} items={grouped.yesterday} />
              <Section label={t('docs.thisWeek')} items={grouped.thisWeek} />
              <Section label={t('docs.older')} items={grouped.older} />

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {t('docs.noRecentPages')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {searchQuery ? t('docs.tryAdjusting') : t('docs.browseSpacesHint')}
                  </p>
                  <Link href="/dashboard/docs">
                    <Button className="bg-[#1C8C7D] hover:bg-[#156B60] text-white">
                      <Folders className="h-4 w-4 mr-2" />
                      {t('docs.browseSpaces')}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
