'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { useWorkspace } from '@/contexts/workspace-context';
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
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useState } from 'react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/docs/summary', active: true },
  { id: 'spaces', label: 'Spaces', icon: null, href: '/dashboard/docs' },
  { id: 'recent', label: 'Recent', icon: null, href: '/dashboard/docs/recent' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/docs/settings' },
] as const;

export default function DocsSummaryPage() {
  const { currentOrganization } = useWorkspace();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data for comprehensive documentation analytics
  const totalSpaces = 12;
  const totalPages = 248;
  const totalContributors = 34;
  const totalViews = 15642;

  const popularPages = [
    { id: 1, title: 'Getting Started Guide', space: 'Product Docs', views: 1245, likes: 42, comments: 18, trend: 15 },
    { id: 2, title: 'API Documentation', space: 'Engineering Wiki', views: 982, likes: 35, comments: 24, trend: 8 },
    { id: 3, title: 'Design System', space: 'Design Resources', views: 876, likes: 56, comments: 12, trend: 22 },
    { id: 4, title: 'Onboarding Checklist', space: 'Team Handbook', views: 654, likes: 28, comments: 9, trend: -3 },
    { id: 5, title: 'Security Best Practices', space: 'Engineering Wiki', views: 542, likes: 31, comments: 15, trend: 12 },
  ];

  const topContributors = [
    { id: 1, name: 'Sarah Johnson', avatar: 'SJ', edits: 145, pagesCreated: 28, trend: 'up', change: 12 },
    { id: 2, name: 'Mike Chen', avatar: 'MC', edits: 132, pagesCreated: 22, trend: 'up', change: 8 },
    { id: 3, name: 'Alex Kumar', avatar: 'AK', edits: 118, pagesCreated: 19, trend: 'up', change: 15 },
    { id: 4, name: 'Emma Davis', avatar: 'ED', edits: 105, pagesCreated: 16, trend: 'down', change: 3 },
    { id: 5, name: 'John Smith', avatar: 'JS', edits: 92, pagesCreated: 14, trend: 'up', change: 5 },
  ];

  const contentActivity = [
    { day: 'Mon', created: 12, edited: 28, viewed: 450 },
    { day: 'Tue', created: 15, edited: 32, viewed: 520 },
    { day: 'Wed', created: 10, edited: 38, viewed: 480 },
    { day: 'Thu', created: 18, edited: 35, viewed: 610 },
    { day: 'Fri', created: 14, edited: 30, viewed: 550 },
    { day: 'Sat', created: 3, edited: 8, viewed: 180 },
    { day: 'Sun', created: 2, edited: 5, viewed: 120 },
  ];

  const maxActivity = Math.max(...contentActivity.map(d => Math.max(d.created, d.edited, d.viewed / 10)));

  const spaceStats = [
    { id: 1, name: 'Product Documentation', icon: 'BookOpen', color: '#3B82F6', pages: 42, contributors: 8, views: 3200 },
    { id: 2, name: 'Engineering Wiki', icon: 'Code', color: '#8B5CF6', pages: 68, contributors: 12, views: 4500 },
    { id: 3, name: 'Design Resources', icon: 'Palette', color: '#10B981', pages: 35, contributors: 5, views: 2100 },
    { id: 4, name: 'Marketing & Brand', icon: 'TrendingUp', color: '#F59E0B', pages: 28, contributors: 6, views: 1800 },
    { id: 5, name: 'Team Handbook', icon: 'Users', color: '#6B7280', pages: 45, contributors: 15, views: 2500 },
  ];

  const monthlyTrend = [
    { month: 'Oct', pages: 180, edits: 420 },
    { month: 'Nov', pages: 195, edits: 480 },
    { month: 'Dec', pages: 210, edits: 520 },
    { month: 'Jan', pages: 228, edits: 580 },
    { month: 'Feb', pages: 242, edits: 620 },
    { month: 'Mar', pages: 248, edits: 650 },
  ];

  const maxTrend = Math.max(...monthlyTrend.map(m => Math.max(m.pages, m.edits / 3)));

  const recentActivity = [
    { id: 1, user: 'Sarah Johnson', action: 'created', page: 'Q1 2026 Product Roadmap', time: '2 hours ago', type: 'created' },
    { id: 2, user: 'Mike Chen', action: 'updated', page: 'API Authentication Guide', time: '4 hours ago', type: 'edited' },
    { id: 3, user: 'Alex Kumar', action: 'commented on', page: 'Database Schema Design', time: '6 hours ago', type: 'comment' },
    { id: 4, user: 'Emma Davis', action: 'created', page: 'Brand Guidelines 2026', time: '1 day ago', type: 'created' },
    { id: 5, user: 'John Smith', action: 'updated', page: 'Security Audit Checklist', time: '2 days ago', type: 'edited' },
  ];

  const healthMetrics = [
    { label: 'Up to Date', count: 198, total: 248, percentage: 80, status: 'good' },
    { label: 'Needs Review', count: 35, total: 248, percentage: 14, status: 'warning' },
    { label: 'Outdated', count: 15, total: 248, percentage: 6, status: 'critical' },
  ];

  const searchQueries = [
    { query: 'API authentication', count: 245, trend: 12 },
    { query: 'getting started', count: 189, trend: 8 },
    { query: 'deployment guide', count: 156, trend: -5 },
    { query: 'design system', count: 142, trend: 18 },
    { query: 'security policy', count: 128, trend: 3 },
  ];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <BookOpen className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Documentation Analytics
              </h1>
            </div>

            <Link
              href="/dashboard/docs"
              className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Page
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Pages"
                value={totalPages}
                change={+12}
                changeLabel="vs last month"
                icon={FileText}
                iconColor="bg-blue-500"
                trend="up"
              />

              <MetricCard
                title="Active Spaces"
                value={totalSpaces}
                change={+8}
                changeLabel="vs last month"
                icon={Folder}
                iconColor="bg-purple-500"
                trend="up"
              />

              <MetricCard
                title="Contributors"
                value={totalContributors}
                change={+15}
                changeLabel="vs last month"
                icon={Users}
                iconColor="bg-green-500"
                trend="up"
              />

              <MetricCard
                title="Total Views"
                value={totalViews}
                change={+22}
                changeLabel="vs last month"
                icon={Eye}
                iconColor="bg-orange-500"
                trend="up"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Content Activity */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Content Activity</h3>
                    <div className="flex gap-2">
                      {(['week', 'month', 'quarter'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            timeRange === range
                              ? 'bg-[#0065FF] text-white'
                              : 'bg-gray-100 dark:bg-[#282E33] text-gray-600 dark:text-[#9FADBC] hover:bg-gray-200 dark:hover:bg-[#2C333A]'
                          }`}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-64 gap-3">
                    {contentActivity.map((data) => (
                      <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1 items-end h-48">
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                              style={{ height: `${(data.created / maxActivity) * 100}%` }}
                              title={`Created: ${data.created}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                              style={{ height: `${(data.edited / maxActivity) * 100}%` }}
                              title={`Edited: ${data.edited}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${(data.viewed / 10 / maxActivity) * 100}%` }}
                              title={`Viewed: ${data.viewed}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-[#2C333A]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Edited</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Viewed (÷10)</span>
                    </div>
                  </div>
                </div>

                {/* Popular Pages */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Most Popular Pages</h3>
                    <Link
                      href="/dashboard/docs"
                      className="text-sm font-medium text-[#0065FF] hover:text-[#0052CC]"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {popularPages.map((page, index) => (
                      <div
                        key={page.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-[#2C333A] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                            {page.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-[#9FADBC]">{page.space}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-[#9FADBC]">
                            <Eye className="h-3 w-3" />
                            {page.views}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-[#9FADBC]">
                            <ThumbsUp className="h-3 w-3" />
                            {page.likes}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-[#9FADBC]">
                            <MessageSquare className="h-3 w-3" />
                            {page.comments}
                          </div>
                          <div className={`flex items-center gap-1 font-medium ${
                            page.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {page.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(page.trend)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Space Statistics */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Space Overview</h3>

                  <div className="space-y-4">
                    {spaceStats.map((space) => (
                      <div
                        key={space.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-[#2C333A] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-lg"
                          style={{ backgroundColor: space.color + '20' }}
                        >
                          <IconRenderer iconName={space.icon} className="h-6 w-6" style={{ color: space.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                            {space.name}
                          </h4>
                          <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-[#9FADBC]">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {space.pages} pages
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {space.contributors} contributors
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {space.views.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Trend */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Documentation Growth</h3>

                  <div className="flex items-end justify-between h-64 gap-4">
                    {monthlyTrend.map((data) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1 items-end h-48">
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-[#0065FF] rounded-t transition-all hover:bg-[#0052CC]"
                              style={{ height: `${(data.pages / maxTrend) * 100}%` }}
                              title={`Pages: ${data.pages}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${((data.edits / 3) / maxTrend) * 100}%` }}
                              title={`Edits: ${data.edits}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-[#2C333A]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#0065FF]" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Total Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Edits (÷3)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Documentation Health */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="h-5 w-5 text-[#0065FF]" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Content Health</h3>
                  </div>

                  <div className="space-y-4">
                    {healthMetrics.map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.label}</span>
                          <span className="text-sm text-gray-600 dark:text-[#9FADBC]">
                            {metric.count} pages
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2C333A] rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                metric.status === 'good' ? 'bg-green-500' :
                                metric.status === 'warning' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${metric.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                            {metric.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Contributors */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Contributors</h3>
                  </div>

                  <div className="space-y-4">
                    {topContributors.map((contributor, index) => (
                      <div key={contributor.id} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 dark:bg-[#2C333A] text-gray-600 dark:text-[#9FADBC]'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0065FF] text-sm font-semibold text-white">
                          {contributor.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {contributor.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#9FADBC]">
                            {contributor.edits} edits • {contributor.pagesCreated} pages
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${
                          contributor.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {contributor.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {contributor.change}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Search Queries */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Search className="h-5 w-5 text-[#0065FF]" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Searches</h3>
                  </div>

                  <div className="space-y-3">
                    {searchQueries.map((query, index) => (
                      <div key={query.query} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-[#282E33] text-xs font-semibold text-gray-600 dark:text-[#9FADBC]">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            "{query.query}"
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#9FADBC]">
                            {query.count} searches
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          query.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {query.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(query.trend)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Updates</h3>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-[#282E33]">
                          {activity.type === 'created' && <FileText className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'edited' && <Edit className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.user}</span>{' '}
                            <span className="text-gray-600 dark:text-[#9FADBC]">{activity.action}</span>{' '}
                            <span className="font-medium">{activity.page}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#9FADBC] mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documentation Insight */}
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/20">
                      <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Documentation Quality
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-[#9FADBC] leading-relaxed">
                        Your documentation is <span className="font-semibold text-purple-600 dark:text-purple-400">80% up-to-date</span>! Great job maintaining quality content. Consider reviewing the 15 outdated pages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: any;
  iconColor: string;
  trend: 'up' | 'down';
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, iconColor, trend }: MetricCardProps) {
  const isPositive = trend === 'up' ? change >= 0 : change <= 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</div>
      <div className="text-xs text-gray-500 dark:text-[#9FADBC]">{changeLabel}</div>
    </div>
  );
}
