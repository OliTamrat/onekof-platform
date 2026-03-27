'use client';

import { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Clock,
  Star,
  Users,
  FolderOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BookMarked,
  Lightbulb,
  Shield,
  Rocket,
  Wrench,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface WikiCategory {
  id: string;
  name: string;
  description: string;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  pageCount: number;
  articles: { title: string; excerpt: string; updatedAt: string }[];
}

interface WikiCategoryConfig {
  id: string;
  nameKey: string;
  descKey: string;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  pageCount: number;
  articles: { titleKey: string; excerptKey: string; updatedAt: string }[];
}

// Wiki categories use translation keys - resolved at render time via t()
const WIKI_CATEGORIES_CONFIG = [
  {
    id: 'getting-started',
    nameKey: 'wiki.gettingStarted',
    descKey: '',
    icon: Rocket,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    pageCount: 5,
    articles: [
      { titleKey: 'wiki.welcomeToOnekof', excerptKey: 'wiki.welcomeDesc', updatedAt: '2 days ago' },
      { titleKey: 'wiki.settingUpWorkspace', excerptKey: 'wiki.settingUpDesc', updatedAt: '1 week ago' },
      { titleKey: 'wiki.creatingFirstProject', excerptKey: 'wiki.creatingFirstDesc', updatedAt: '1 week ago' },
    ],
  },
  {
    id: 'project-management',
    nameKey: 'wiki.projectManagement',
    descKey: '',
    icon: BookMarked,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    pageCount: 8,
    articles: [
      { titleKey: 'wiki.taskWorkflows', excerptKey: 'wiki.taskWorkflowsDesc', updatedAt: '3 days ago' },
      { titleKey: 'wiki.boardVsList', excerptKey: 'wiki.boardVsListDesc', updatedAt: '5 days ago' },
      { titleKey: 'wiki.priorityGuide', excerptKey: 'wiki.priorityGuideDesc', updatedAt: '1 week ago' },
    ],
  },
  {
    id: 'team-collaboration',
    nameKey: 'wiki.teamCollaboration',
    descKey: '',
    icon: Users,
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    pageCount: 6,
    articles: [
      { titleKey: 'wiki.invitingMembers', excerptKey: 'wiki.invitingMembersDesc', updatedAt: '1 day ago' },
      { titleKey: 'wiki.commentsMentions', excerptKey: 'wiki.commentsMentionsDesc', updatedAt: '4 days ago' },
      { titleKey: 'wiki.teamRoles', excerptKey: 'wiki.teamRolesDesc', updatedAt: '1 week ago' },
    ],
  },
  {
    id: 'tips-tricks',
    nameKey: 'wiki.tipsBestPractices',
    descKey: '',
    icon: Lightbulb,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    pageCount: 4,
    articles: [
      { titleKey: 'wiki.keyboardShortcuts', excerptKey: 'wiki.keyboardShortcutsDesc', updatedAt: '2 days ago' },
      { titleKey: 'wiki.dashboardCustomization', excerptKey: 'wiki.dashboardCustomizationDesc', updatedAt: '3 days ago' },
      { titleKey: 'wiki.automationRules', excerptKey: 'wiki.automationRulesDesc', updatedAt: '5 days ago' },
    ],
  },
  {
    id: 'security',
    nameKey: 'wiki.securityCompliance',
    descKey: '',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    pageCount: 3,
    articles: [
      { titleKey: 'wiki.twoFactorAuth', excerptKey: 'wiki.twoFactorAuthDesc', updatedAt: '1 week ago' },
      { titleKey: 'wiki.dataPrivacy', excerptKey: 'wiki.dataPrivacyDesc', updatedAt: '2 weeks ago' },
    ],
  },
  {
    id: 'admin',
    nameKey: 'wiki.administration',
    descKey: '',
    icon: Wrench,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    pageCount: 4,
    articles: [
      { titleKey: 'wiki.orgSettings', excerptKey: 'wiki.orgSettingsDesc', updatedAt: '3 days ago' },
      { titleKey: 'wiki.billingSubscription', excerptKey: 'wiki.billingSubscriptionDesc', updatedAt: '1 week ago' },
    ],
  },
];

export default function WikiPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Resolve translation keys to actual strings
  const WIKI_CATEGORIES: WikiCategory[] = WIKI_CATEGORIES_CONFIG.map(c => ({
    id: c.id,
    name: t(c.nameKey),
    description: c.descKey ? t(c.descKey) : '',
    icon: c.icon,
    color: c.color,
    bg: c.bg,
    pageCount: c.pageCount,
    articles: c.articles.map(a => ({
      title: t(a.titleKey),
      excerpt: t(a.excerptKey),
      updatedAt: a.updatedAt,
    })),
  }));

  const totalPages = WIKI_CATEGORIES.reduce((sum, c) => sum + c.pageCount, 0);
  const filteredCategories = search
    ? WIKI_CATEGORIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.articles.some(a => a.title.toLowerCase().includes(search.toLowerCase()))
      )
    : WIKI_CATEGORIES;

  const activeCategory = selectedCategory
    ? WIKI_CATEGORIES.find(c => c.id === selectedCategory)
    : null;

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-white dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{t('wiki.title')}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalPages} {t('wiki.articlesAcross')} {WIKI_CATEGORIES.length} {t('wiki.categories')}
                </p>
              </div>
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t('wiki.newArticle')}
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('wiki.searchArticles')}
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeCategory ? (
            /* Category detail view */
            <div className="max-w-4xl mx-auto">
              <Button variant="link"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                {t('wiki.backToCategories')}
              </Button>

              <div className="flex items-center gap-3 mb-6">
                <div className={cn('rounded-xl p-3', activeCategory.bg)}>
                  <activeCategory.icon className={cn('h-6 w-6', activeCategory.color)} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{activeCategory.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeCategory.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {activeCategory.articles.map((article, idx) => (
                  <div
                    key={idx}
                    className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.excerpt}</p>
                        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {article.updatedAt}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Categories grid */
            <div className="max-w-5xl mx-auto">
              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3 flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{totalPages}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('wiki.totalArticles')}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3 flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{WIKI_CATEGORIES.length}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('wiki.categories')}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3 flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary-500" />
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{t('common.active')}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('wiki.updatedRecently')}</p>
                  </div>
                </div>
              </div>

              {/* Category grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCategories.map(category => (
                  <Button variant="outline"
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="group text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-5 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn('rounded-lg p-2.5 shrink-0', category.bg)}>
                        <category.icon className={cn('h-5 w-5', category.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{category.description}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{category.pageCount} articles</span>
                    </div>

                    {/* Preview articles */}
                    <div className="space-y-1.5 pl-[52px]">
                      {category.articles.slice(0, 2).map((article, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{article.title}</span>
                        </div>
                      ))}
                      {category.articles.length > 2 && (
                        <span className="text-[11px] text-primary-500 pl-5">+{category.articles.length - 2} more</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('emptyStates.noArticles')} "{search}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
