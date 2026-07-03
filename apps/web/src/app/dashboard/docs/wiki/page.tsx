'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BookOpen, Search, FileText, Calendar, AlertCircle } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import Link from 'next/link';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';

interface WikiCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { articles: number };
}

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  viewCount: number;
  excerpt: string | null;
  category: { id: string; name: string; color: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

export default function DocsWikiPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [articles, setArticles] = React.useState<WikiArticle[]>([]);
  const [categories, setCategories] = React.useState<WikiCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<WikiArticle | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [artRes, catRes] = await Promise.all([
          fetch('/api/wiki/articles?status=all&limit=100'),
          fetch('/api/wiki/categories'),
        ]);
        if (!artRes.ok || !catRes.ok) throw new Error('Failed to fetch');
        const artData: ArticlesResponse = await artRes.json();
        const catData: WikiCategory[] = await catRes.json();
        setArticles(artData.articles);
        setCategories(catData);
      } catch {
        setError(t('docs.failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function openSlideout(article: WikiArticle) {
    setSelectedArticle(article);
    setIsSlideoutOpen(true);
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('nav.wiki')}
        icon={<BookOpen className="h-6 w-6" />}
        iconColor="#06B6D4"
        currentTab="wiki"
        baseHref="/dashboard"
        customTabs={KNOWLEDGE_TABS}
        showTabs
      />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('wiki.searchWiki')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Link href="/dashboard/docs/pages/new">
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
              <BookOpen className="h-4 w-4" />
              {t('wiki.newPage')}
            </Button>
          </Link>
        </div>

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

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-white/70">{t('common.noResults')}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((article) => (
              <div
                key={article.id}
                onClick={() => openSlideout(article)}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#06B6D4] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      {article.category && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400 shrink-0">
                          {article.category.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-white/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t('common.lastUpdated')} {new Date(article.updatedAt).toLocaleDateString()}
                      </span>
                      {(article.viewCount ?? 0) > 0 && (
                        <span>
                          {article.viewCount} {t('wiki.views')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedArticle?.title ?? t('nav.wikiPage')}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('wiki.pageInformation')}>
            <div className="space-y-4">
              {selectedArticle?.category && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('common.category')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedArticle.category.name}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common.lastUpdated')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedArticle ? new Date(selectedArticle.updatedAt).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('wiki.views')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedArticle?.viewCount ?? 0}
                </p>
              </div>
              {selectedArticle && (
                <Link
                  href={`/dashboard/docs/pages/${selectedArticle.id}`}
                  className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-[#1C8C7D] hover:underline"
                >
                  {t('common.viewDetails')}
                </Link>
              )}
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}
