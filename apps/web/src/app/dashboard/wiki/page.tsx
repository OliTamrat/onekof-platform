'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
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
  category: { id: string; name: string; color: string; slug: string } | null;
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

function toRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export default function WikiPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, artRes] = await Promise.all([
          fetch('/api/wiki/categories'),
          fetch('/api/wiki/articles?status=all&limit=200'),
        ]);
        if (!catRes.ok || !artRes.ok) throw new Error('Failed to fetch');
        const catData: WikiCategory[] = await catRes.json();
        const artData: ArticlesResponse = await artRes.json();
        setCategories(catData);
        setArticles(artData.articles);
      } catch {
        setError(t('docs.failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t]);

  const handleCreateArticle = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/wiki/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: t('wiki.untitledArticle'),
          content: '',
          status: 'draft',
          ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
        }),
      });
      if (res.ok) {
        const article = await res.json();
        router.push(`/dashboard/docs/pages/${article.id}`);
        return;
      }
    } catch { /* fallback */ }
    setCreating(false);
  };

  const totalArticles = articles.length;
  const activeCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;
  const categoryArticles = selectedCategoryId
    ? articles.filter(a => a.category?.id === selectedCategoryId)
    : [];

  const filteredCategories = search
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        articles.some(a => a.category?.id === c.id && a.title.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  if (loading) {
    return (
      <AppLayout>
        <UnifiedPageHeader
          title={t('wiki.title')}
          icon={<BookOpen className="h-6 w-6" />}
          iconColor="#06B6D4"
          currentTab="wiki"
          baseHref="/dashboard"
          customTabs={KNOWLEDGE_TABS}
          showTabs
        />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <UnifiedPageHeader
          title={t('wiki.title')}
          icon={<BookOpen className="h-6 w-6" />}
          iconColor="#06B6D4"
          currentTab="wiki"
          baseHref="/dashboard"
          customTabs={KNOWLEDGE_TABS}
          showTabs
        />
        <div className="flex items-center gap-2 p-6 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('wiki.title')}
        icon={<BookOpen className="h-6 w-6" />}
        iconColor="#06B6D4"
        currentTab="wiki"
        baseHref="/dashboard"
        customTabs={KNOWLEDGE_TABS}
        showTabs
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Search + Action Bar */}
        <div className="border-b border-gray-200 dark:border-white/[0.08]/50 bg-white dark:bg-[#12161B] px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('wiki.searchArticles')}
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedCategoryId(null); }}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D] transition-colors"
              />
            </div>
            <Button
              size="sm"
              onClick={handleCreateArticle}
              disabled={creating}
              className="gap-1.5 bg-[#1C8C7D] hover:bg-[#167A6E] text-white rounded-lg h-9"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{t('wiki.newArticle')}</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {activeCategory ? (
            /* Category detail view */
            <div>
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="flex items-center gap-1.5 text-sm font-medium text-[#1C8C7D] hover:text-[#167A6E] mb-4 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                {t('wiki.backToCategories')}
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl h-11 w-11 flex items-center justify-center" style={{ backgroundColor: activeCategory.color + '15' }}>
                  <IconRenderer iconName={activeCategory.icon} className="h-5 w-5" style={{ color: activeCategory.color }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{activeCategory.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-white/70">{categoryArticles.length} articles</p>
                </div>
              </div>

              {categoryArticles.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-white/70 mb-4">{t('emptyStates.noArticles')}</p>
                  <Button
                    onClick={handleCreateArticle}
                    disabled={creating}
                    className="gap-1.5 bg-[#1C8C7D] hover:bg-[#167A6E] text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('wiki.newArticle')}
                  </Button>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] overflow-hidden">
                  {categoryArticles.map((article, idx) => (
                    <Link
                      key={article.id}
                      href={`/dashboard/docs/pages/${article.id}`}
                      className={cn(
                        'group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#181D23] transition-colors',
                        idx !== categoryArticles.length - 1 && 'border-b border-gray-100 dark:border-white/[0.08]/50'
                      )}
                    >
                      <FileText className="h-4 w-4 text-[#1C8C7D] shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors flex-1 truncate">
                        {article.title}
                      </span>
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0',
                        article.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      )}>
                        {article.status === 'published' ? t('wiki.published') : t('wiki.draft')}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-white/30 shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {toRelativeTime(article.updatedAt)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Categories overview */
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-white/70">{t('wiki.totalArticles')}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{totalArticles}</div>
                </div>
                <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-white/70">{t('wiki.categories')}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{categories.length}</div>
                </div>
                <div className="hidden md:block bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-white/70">{t('wiki.updatedRecently')}</div>
                  <div className="text-xl font-bold text-[#1C8C7D] mt-0.5">{t('common.active')}</div>
                </div>
              </div>

              {/* Category list */}
              {filteredCategories.length > 0 ? (
                <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] overflow-hidden">
                  {filteredCategories.map((category, idx) => {
                    const catArticles = articles.filter(a => a.category?.id === category.id);
                    return (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={cn(
                          'group flex items-center gap-4 px-4 md:px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#181D23] cursor-pointer transition-colors',
                          idx !== filteredCategories.length - 1 && 'border-b border-gray-100 dark:border-white/[0.08]/50'
                        )}
                      >
                        <div className="rounded-lg h-10 w-10 flex items-center justify-center shrink-0" style={{ backgroundColor: category.color + '15' }}>
                          <IconRenderer iconName={category.icon} className="h-5 w-5" style={{ color: category.color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors">
                              {category.name}
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-white/30">{catArticles.length} articles</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            {catArticles.slice(0, 2).map((article) => (
                              <span key={article.id} className="text-xs text-gray-500 dark:text-white/70 truncate max-w-[180px]">
                                {article.title}
                              </span>
                            ))}
                            {catArticles.length > 2 && (
                              <span className="text-xs text-[#1C8C7D]">+{catArticles.length - 2} more</span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="h-4 w-4 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="mx-auto h-8 w-8 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-white/70">
                    {search ? `${t('emptyStates.noArticles')} "${search}"` : t('emptyStates.noArticles')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
