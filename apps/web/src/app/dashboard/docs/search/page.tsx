'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { Search, FileText, AlertCircle, Folders, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  updatedAt: string;
  category: { id: string; name: string; color: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

export default function DocsSearchPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [results, setResults] = React.useState<WikiArticle[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searched, setSearched] = React.useState(false);

  const debouncedQuery = useDebounce(searchQuery, 350);

  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    async function runSearch() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/wiki/articles?search=${encodeURIComponent(debouncedQuery)}&status=all&limit=50`,
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data: ArticlesResponse = await res.json();
        setResults(data.articles);
        setSearched(true);
      } catch {
        setError(t('docs.searchError'));
      } finally {
        setLoading(false);
      }
    }

    runSearch();
  }, [debouncedQuery, t]);

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('docs.searchDocs')}
        icon={<Search className="h-6 w-6" />}
        iconColor="#06B6D4"
        currentTab="search"
        baseHref="/dashboard"
        customTabs={KNOWLEDGE_TABS}
        showTabs
      />
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('docs.searchDocsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

          {!loading && !error && searched && results.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">
                {t('docs.noResultsFor')} &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('docs.tryDifferentKeywords')}
              </p>
            </div>
          )}

          {!loading && !error && !searched && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">{t('docs.startTyping')}</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                {results.length} {t('common.results')}
              </p>
              {results.map((article) => {
                const categoryColor = article.category?.color ?? '#1C8C7D';
                return (
                  <Link
                    key={article.id}
                    href={`/dashboard/docs/pages/${article.id}`}
                    className="block bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md hover:border-[#1C8C7D]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                        style={{ backgroundColor: categoryColor + '20' }}
                      >
                        <FileText className="h-5 w-5" style={{ color: categoryColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                          {article.category && (
                            <div className="flex items-center gap-1">
                              <Folders className="h-3 w-3" />
                              {article.category.name}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(article.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
