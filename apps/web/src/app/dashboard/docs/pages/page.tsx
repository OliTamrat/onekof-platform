'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { FileText, Search, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  category: { id: string; name: string; color: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

export default function DocsPagesPage() {
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
        const res = await fetch('/api/wiki/articles?status=all&limit=100');
        if (!res.ok) throw new Error('Failed to fetch');
        const data: ArticlesResponse = await res.json();
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
      (a.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('docs.allPages')}
        icon={<FileText className="h-6 w-6" />}
        iconColor="#06B6D4"
        currentTab="pages"
        baseHref="/dashboard"
        customTabs={KNOWLEDGE_TABS}
        showTabs
      />
      <div className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('docs.searchPages')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

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

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('common.noResults')}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/docs/pages/${article.id}`}
                className="block bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#06B6D4]" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      {article.category && (
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                          {article.category.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400">
                    {new Date(article.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
