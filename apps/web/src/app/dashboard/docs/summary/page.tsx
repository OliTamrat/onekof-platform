'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Eye,
  Edit,
  Search,
  AlertTriangle,
  Star,
  Zap,
  BarChart3,
  Settings,
  Clock,
  Award,
  ThumbsUp,
  MessageSquare,
  Folder,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  viewCount: number;
  category: { id: string; name: string; color: string; icon: string } | null;
}

interface WikiCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { articles: number };
}

interface ArticlesResponse {
  articles: WikiArticle[];
  total: number;
}

const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/docs/summary', active: true },
  { id: 'spaces', label: 'Spaces', icon: null, href: '/dashboard/docs' },
  { id: 'recent', label: 'Recent', icon: null, href: '/dashboard/docs/recent' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/docs/settings' },
];

// Static illustrative activity — no analytics API exists yet
const CONTENT_ACTIVITY = [
  { day: 'Mon', created: 0, edited: 0, viewed: 0 },
  { day: 'Tue', created: 0, edited: 0, viewed: 0 },
  { day: 'Wed', created: 0, edited: 0, viewed: 0 },
  { day: 'Thu', created: 0, edited: 0, viewed: 0 },
  { day: 'Fri', created: 0, edited: 0, viewed: 0 },
  { day: 'Sat', created: 0, edited: 0, viewed: 0 },
  { day: 'Sun', created: 0, edited: 0, viewed: 0 },
];

export default function DocsSummaryPage() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const totalPages = articles.length;
  const totalSpaces = categories.length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);

  const popularPages = [...articles]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const contentActivity = CONTENT_ACTIVITY;
  const maxActivity = Math.max(
    ...contentActivity.map((d) => Math.max(d.created || 1, d.edited || 1, (d.viewed || 10) / 10)),
  );

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('docs.analyticsTitle')}
              </h1>
            </div>
            <Link
              href="/dashboard/docs"
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('docs.newPage')}
            </Link>
          </div>

          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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

          {!loading && !error && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title={t('docs.totalPages')}
                  value={totalPages}
                  icon={FileText}
                  iconColor="bg-blue-500"
                />
                <MetricCard
                  title={t('docs.activeSpaces')}
                  value={totalSpaces}
                  icon={Folder}
                  iconColor="bg-purple-500"
                />
                <MetricCard
                  title={t('docs.totalViews')}
                  value={totalViews}
                  icon={Eye}
                  iconColor="bg-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Content Activity */}
                  <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {t('docs.contentActivity')}
                      </h3>
                      <div className="flex gap-2">
                        {(['week', 'month', 'quarter'] as const).map((range) => (
                          <Button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              timeRange === range
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-[#181D23] text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-end justify-between h-64 gap-3">
                      {contentActivity.map((data) => (
                        <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex gap-1 items-end h-48">
                            <div className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 min-h-[2px]"
                                style={{
                                  height: `${Math.max(2, (data.created / maxActivity) * 100)}%`,
                                }}
                                title={`Created: ${data.created}`}
                              />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600 min-h-[2px]"
                                style={{
                                  height: `${Math.max(2, (data.edited / maxActivity) * 100)}%`,
                                }}
                                title={`Edited: ${data.edited}`}
                              />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600 min-h-[2px]"
                                style={{
                                  height: `${Math.max(2, ((data.viewed / 10) / maxActivity) * 100)}%`,
                                }}
                                title={`Viewed: ${data.viewed}`}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-white/70">
                            {data.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <span className="text-xs text-gray-600 dark:text-white/70">{t('docs.created')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500" />
                        <span className="text-xs text-gray-600 dark:text-white/70">{t('docs.edited')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span className="text-xs text-gray-600 dark:text-white/70">{t('docs.viewed10')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Popular Pages */}
                  <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {t('docs.mostPopularPages')}
                      </h3>
                      <Link
                        href="/dashboard/docs"
                        className="text-sm font-medium text-primary-500 hover:text-primary-600"
                      >
                        {t('common.viewAll')}
                      </Link>
                    </div>

                    {popularPages.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-white/70 text-center py-6">
                        {t('docs.noPagesYet')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {popularPages.map((page, index) => (
                          <Link
                            key={page.id}
                            href={`/dashboard/docs/pages/${page.id}`}
                            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#181D23] transition-colors"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white shrink-0">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                                {page.title}
                              </h4>
                              {page.category && (
                                <p className="text-xs text-gray-500 dark:text-white/70">{page.category.name}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-white/70 shrink-0">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {page.viewCount ?? 0}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Space Overview */}
                  {categories.length > 0 && (
                    <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                        {t('docs.spaceOverview')}
                      </h3>
                      <div className="space-y-4">
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#181D23] transition-colors"
                          >
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-lg"
                              style={{ backgroundColor: cat.color + '20' }}
                            >
                              <IconRenderer iconName={cat.icon} className="h-6 w-6" style={{ color: cat.color }} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                                {cat.name}
                              </h4>
                              <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-white/70">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {cat._count.articles} {t('common.pages')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Recent Updates */}
                  <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {t('docs.recentUpdates')}
                      </h3>
                    </div>

                    {recentArticles.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-white/70 text-center py-4">
                        {t('docs.noPagesYet')}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {recentArticles.map((article) => (
                          <Link
                            key={article.id}
                            href={`/dashboard/docs/pages/${article.id}`}
                            className="flex items-start gap-3 hover:opacity-80 transition-opacity"
                          >
                            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-[#181D23]">
                              <FileText className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {article.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-white/70 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(article.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Documentation Insight */}
                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/20">
                        <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          {t('docs.docQuality')}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed">
                          {totalPages > 0
                            ? t('docs.docQualityDesc').replace('{count}', String(totalPages))
                            : t('docs.docQualityEmpty')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
}

function MetricCard({ title, value, icon: Icon, iconColor }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
    </div>
  );
}
