'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Clock,
  Users,
  ArrowRight,
  Rocket,
  BookMarked,
  Lightbulb,
  Shield,
  Wrench,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { KNOWLEDGE_TABS } from '@/config/department-tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';

interface WikiCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  pageCount: number;
  articles: { title: string; updatedAt: string }[];
}

// Category configs with translation keys
const CATEGORY_CONFIGS = [
  { id: 'getting-started', nameKey: 'wiki.gettingStarted', icon: Rocket, color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/30', pageCount: 5, articles: [
    { titleKey: 'wiki.welcomeToOnekof', updatedAt: '2d' },
    { titleKey: 'wiki.settingUpWorkspace', updatedAt: '1w' },
    { titleKey: 'wiki.creatingFirstProject', updatedAt: '1w' },
  ]},
  { id: 'project-management', nameKey: 'wiki.projectManagement', icon: BookMarked, color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/30', pageCount: 8, articles: [
    { titleKey: 'wiki.taskWorkflows', updatedAt: '3d' },
    { titleKey: 'wiki.boardVsList', updatedAt: '5d' },
    { titleKey: 'wiki.priorityGuide', updatedAt: '1w' },
  ]},
  { id: 'team-collaboration', nameKey: 'wiki.teamCollaboration', icon: Users, color: 'text-[#1C8C7D]', iconBg: 'bg-[#1C8C7D]/10', pageCount: 6, articles: [
    { titleKey: 'wiki.invitingMembers', updatedAt: '1d' },
    { titleKey: 'wiki.commentsMentions', updatedAt: '4d' },
    { titleKey: 'wiki.teamRoles', updatedAt: '1w' },
  ]},
  { id: 'tips-tricks', nameKey: 'wiki.tipsBestPractices', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30', pageCount: 4, articles: [
    { titleKey: 'wiki.keyboardShortcuts', updatedAt: '2d' },
    { titleKey: 'wiki.dashboardCustomization', updatedAt: '3d' },
  ]},
  { id: 'security', nameKey: 'wiki.securityCompliance', icon: Shield, color: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-100 dark:bg-red-900/30', pageCount: 3, articles: [
    { titleKey: 'wiki.twoFactorAuth', updatedAt: '1w' },
    { titleKey: 'wiki.dataPrivacy', updatedAt: '2w' },
  ]},
  { id: 'admin', nameKey: 'wiki.administration', icon: Wrench, color: 'text-slate-600 dark:text-slate-400', iconBg: 'bg-slate-100 dark:bg-slate-800', pageCount: 4, articles: [
    { titleKey: 'wiki.orgSettings', updatedAt: '3d' },
    { titleKey: 'wiki.billingSubscription', updatedAt: '1w' },
  ]},
];

export default function WikiPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [apiArticles, setApiArticles] = useState<any[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch real articles from API
  useEffect(() => {
    fetch('/api/wiki/articles?status=all&limit=100')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.articles?.length > 0) {
          setApiArticles(data.articles);
        }
        setApiLoaded(true);
      })
      .catch(() => setApiLoaded(true));
  }, []);

  const handleCreateArticle = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/wiki/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t('wiki.untitledArticle'), content: '', status: 'draft' }),
      });
      if (res.ok) {
        const article = await res.json();
        router.push(`/dashboard/docs/pages/${article.id}`);
        return;
      }
    } catch { /* fallback below */ }
    setCreating(false);
  };

  // Resolve translations — use mock data as fallback
  const categories: WikiCategory[] = CATEGORY_CONFIGS.map(c => ({
    id: c.id,
    name: t(c.nameKey),
    icon: c.icon,
    color: c.color,
    iconBg: c.iconBg,
    pageCount: c.pageCount,
    articles: c.articles.map(a => ({ title: t(a.titleKey), updatedAt: a.updatedAt })),
  }));

  const totalArticles = categories.reduce((sum, c) => sum + c.pageCount, 0);
  const filteredCategories = search
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.articles.some(a => a.title.toLowerCase().includes(search.toLowerCase()))
      )
    : categories;

  const activeCategory = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;

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

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Search + Action Bar */}
        <div className="border-b border-gray-200 dark:border-slate-700/50 bg-white dark:bg-[#22272B] px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('wiki.searchArticles')}
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D] transition-colors"
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
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1.5 text-sm font-medium text-[#1C8C7D] hover:text-[#167A6E] mb-4 transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                {t('wiki.backToCategories')}
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={cn('rounded-xl h-11 w-11 flex items-center justify-center', activeCategory.iconBg)}>
                  <activeCategory.icon className={cn('h-5 w-5', activeCategory.color)} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{activeCategory.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{activeCategory.pageCount} articles</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Show real API articles for this category if available */}
                {apiArticles.filter(a => a.category?.slug === activeCategory.id || a.category?.name === activeCategory.name).map((article, idx, arr) => (
                  <div
                    key={article.id}
                    onClick={() => router.push(`/dashboard/docs/pages/${article.id}`)}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors',
                      (idx !== arr.length - 1 || activeCategory.articles.length > 0) && 'border-b border-gray-100 dark:border-slate-700/50'
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
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                  </div>
                ))}
                {/* Mock articles (placeholder until real data exists) */}
                {activeCategory.articles.map((article, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors',
                      idx !== activeCategory.articles.length - 1 && 'border-b border-gray-100 dark:border-slate-700/50'
                    )}
                  >
                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors flex-1 truncate">
                      {article.title}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.updatedAt}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Categories overview */
            <div className="space-y-4">
              {/* Real articles from API */}
              {apiArticles.length > 0 && (
                <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      {t('wiki.yourArticles')}
                    </h3>
                  </div>
                  {apiArticles.slice(0, 5).map((article, idx) => (
                    <div
                      key={article.id}
                      onClick={() => router.push(`/dashboard/docs/pages/${article.id}`)}
                      className={cn(
                        'group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors',
                        idx !== Math.min(apiArticles.length, 5) - 1 && 'border-b border-gray-100 dark:border-slate-700/50'
                      )}
                    >
                      <FileText className="h-4 w-4 text-[#1C8C7D] shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors flex-1 truncate">
                        {article.title}
                      </span>
                      {article.category && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-medium shrink-0"
                          style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      )}
                      <span className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0',
                        article.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      )}>
                        {article.status === 'published' ? t('wiki.published') : t('wiki.draft')}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Stats row — consistent with other pages */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('wiki.totalArticles')}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{totalArticles}</div>
                </div>
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('wiki.categories')}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{categories.length}</div>
                </div>
                <div className="hidden md:block bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">{t('wiki.updatedRecently')}</div>
                  <div className="text-xl font-bold text-[#1C8C7D] mt-0.5">{t('common.active')}</div>
                </div>
              </div>

              {/* Category list — clean table-like layout matching Issues/Projects pattern */}
              <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                {filteredCategories.map((category, idx) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'group flex items-center gap-4 px-4 md:px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors',
                        idx !== filteredCategories.length - 1 && 'border-b border-gray-100 dark:border-slate-700/50'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn('rounded-lg h-10 w-10 flex items-center justify-center shrink-0', category.iconBg)}>
                        <Icon className={cn('h-5 w-5', category.color)} />
                      </div>

                      {/* Name + preview articles */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#1C8C7D] transition-colors">
                            {category.name}
                          </h3>
                          <span className="text-xs text-gray-400 dark:text-slate-500">{category.pageCount} articles</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {category.articles.slice(0, 2).map((article, aIdx) => (
                            <span key={aIdx} className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[180px]">
                              {article.title}
                            </span>
                          ))}
                          {category.articles.length > 2 && (
                            <span className="text-xs text-[#1C8C7D]">+{category.articles.length - 2} more</span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-gray-300 dark:text-slate-600 group-hover:text-[#1C8C7D] transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-16">
                  <Search className="mx-auto h-8 w-8 text-gray-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t('emptyStates.noArticles')} &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
