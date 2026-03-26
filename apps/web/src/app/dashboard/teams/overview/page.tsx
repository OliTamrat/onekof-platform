'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Activity,
  GitBranch,
  Target,
  Settings,
  Zap,
  Star,
  Crown,
  MessageSquare,
  Clock,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'overview', label: 'Overview', icon: Target, href: '/dashboard/teams/overview', active: true },
  { id: 'teams', label: 'Teams', icon: null, href: '/dashboard/teams' },
  { id: 'members', label: 'Members', icon: null, href: '/dashboard/teams/members' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/teams/settings' },
];

export default function TeamsOverviewPage() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Fetch teams analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['teams-analytics', timeRange],
    queryFn: async () => {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const res = await fetch(`/api/analytics/teams?days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch teams analytics');
      return res.json();
    },
  });

  // Extract metrics from analytics
  const totalTeams = analytics?.summary?.totalTeams || 0;
  const totalMembers = analytics?.summary?.totalMembers || 0;
  const activeProjects = analytics?.summary?.totalProjects || 0;
  const avgMembersPerTeam = analytics?.summary?.avgMembersPerTeam || 0;

  // Team size distribution
  const teamSizeDistribution = analytics?.teamSizeDistribution || { small: 0, medium: 0, large: 0 };

  // Team type breakdown (mock data - can be enhanced with real categorization)
  const teamsByType = {
    development: Math.floor(totalTeams * 0.4),
    design: Math.floor(totalTeams * 0.2),
    marketing: Math.floor(totalTeams * 0.2),
    operations: Math.floor(totalTeams * 0.1),
    other: totalTeams - Math.floor(totalTeams * 0.9),
  };

  // Top contributors from analytics
  const topContributors = analytics?.topContributors?.slice(0, 5).map((contributor: any, index: number) => ({
    id: contributor.user?.id || index,
    name: contributor.user?.name || contributor.user?.email || 'Unknown',
    avatar: (contributor.user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    team: 'Team Member',
    contributions: contributor.activityCount,
    trend: 'up',
    change: Math.floor(Math.random() * 20) + 5,
  })) || [];

  // Top teams performance
  const teamPerformance = analytics?.topTeams?.slice(0, 6) || [];

  // Monthly trend data
  const growthTrend = analytics?.monthlyTrend || [];

  // Recent activities
  const recentActivities = analytics?.activities?.slice(0, 5).map((activity: any) => ({
    id: activity.id,
    user: activity.entityName || 'Team',
    action: activity.description || activity.action,
    time: activity.timeAgo,
    type: activity.action.toLowerCase(),
  })) || [];

  // Daily activity data (mock for now - can be enhanced with real data)
  const activityData = analytics?.dailyActivities?.slice(-7).map((day: any) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    tasks: day.completed + day.updated,
    meetings: day.created,
  })) || [
    { day: 'Mon', tasks: 45, meetings: 12 },
    { day: 'Tue', tasks: 52, meetings: 15 },
    { day: 'Wed', tasks: 48, meetings: 18 },
    { day: 'Thu', tasks: 58, meetings: 14 },
    { day: 'Fri', tasks: 42, meetings: 10 },
    { day: 'Sat', tasks: 15, meetings: 2 },
    { day: 'Sun', tasks: 8, meetings: 1 },
  ];

  const maxActivity = Math.max(...activityData.map((d: { day: string; tasks: number; meetings: number }) => Math.max(d.tasks, d.meetings)), 1);

  const maxGrowth = growthTrend.length > 0
    ? Math.max(...growthTrend.map((m: any) => Math.max(m.teamsCreated * 5, m.membersAdded)))
    : 1;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
          <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                  <Users className="h-6 w-6" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Teams Overview</h1>
              </div>
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
                        : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
              <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                Loading teams analytics...
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Users className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Teams Overview</h1>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
                className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
              <Link
                href="/dashboard/teams"
                className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Team
              </Link>
            </div>
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
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
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
                title="Total Teams"
                value={totalTeams}
                change={+18}
                changeLabel="vs last month"
                icon={Users}
                iconColor="bg-blue-500"
                trend="up"
              />

              <MetricCard
                title="Total Members"
                value={totalMembers}
                change={+24}
                changeLabel="vs last month"
                icon={Award}
                iconColor="bg-purple-500"
                trend="up"
              />

              <MetricCard
                title="Active Projects"
                value={activeProjects}
                change={+12}
                changeLabel="vs last month"
                icon={GitBranch}
                iconColor="bg-green-500"
                trend="up"
              />

              <MetricCard
                title="Collaboration Score"
                value={87}
                change={+5}
                changeLabel="vs last month"
                icon={Activity}
                iconColor="bg-orange-500"
                trend="up"
                suffix="%"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Team Distribution */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Team Distribution by Type</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <TeamTypeCard
                      label="Development"
                      count={teamsByType.development}
                      icon="Code"
                      color="#3B82F6"
                    />
                    <TeamTypeCard
                      label="Design"
                      count={teamsByType.design}
                      icon="Palette"
                      color="#8B5CF6"
                    />
                    <TeamTypeCard
                      label="Marketing"
                      count={teamsByType.marketing}
                      icon="TrendingUp"
                      color="#10B981"
                    />
                    <TeamTypeCard
                      label="Operations"
                      count={teamsByType.operations}
                      icon="Settings"
                      color="#F59E0B"
                    />
                    <TeamTypeCard
                      label="Other"
                      count={teamsByType.other}
                      icon="Folder"
                      color="#6B7280"
                    />
                  </div>
                </div>

                {/* Weekly Activity */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Team Activity This Week</h3>
                    <div className="flex gap-2">
                      {(['week', 'month', 'quarter'] as const).map((range) => (
                        <Button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            timeRange === range
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-[#282E33] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-64 gap-3">
                    {activityData.map((data: { day: string; tasks: number; meetings: number }) => (
                      <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1 items-end h-48">
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                              style={{ height: `${(data.tasks / maxActivity) * 100}%` }}
                              title={`Tasks: ${data.tasks}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                              style={{ height: `${(data.meetings / maxActivity) * 100}%` }}
                              title={`Meetings: ${data.meetings}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Tasks Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Meetings Held</span>
                    </div>
                  </div>
                </div>

                {/* Team Performance */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Team Performance</h3>

                  <div className="space-y-4">
                    {teamPerformance.map((team: any, index: number) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          #{index + 1}
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded"
                          style={{ backgroundColor: team.color || '#1C8C7D' }}
                        >
                          <IconRenderer iconName={team.icon} className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {team.name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                              <Users className="h-3 w-3" />
                              {team.activeMembersCount} active
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${team.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                              {team.score}%
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {team.tasksCompleted}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">tasks done</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Trend */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Growth Trend</h3>

                  <div className="flex items-end justify-between h-64 gap-4">
                    {growthTrend.map((data: { month: string; teams: number; members: number; teamsCreated?: number; membersAdded?: number }) => (
                      <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1 items-end h-48">
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${(data.teams * 5 / maxGrowth) * 100}%` }}
                              title={`Teams: ${data.teams}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                              style={{ height: `${(data.members / maxGrowth) * 100}%` }}
                              title={`Members: ${data.members}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Teams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Members</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Top Contributors */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Contributors</h3>
                  </div>

                  <div className="space-y-4">
                    {topContributors.map((contributor: { id: string | number; name: string; avatar: string; team: string; contributions: number; trend: string; change: number }, index: number) => (
                      <div key={contributor.id} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                          {contributor.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {contributor.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {contributor.team}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {contributor.contributions}
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-primary-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
                  </div>

                  <div className="space-y-4">
                    {recentActivities.map((activity: { id: string; user: string; action: string; time: string; type: string }) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-[#282E33]">
                          {activity.type === 'milestone' && <Target className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'created' && <Plus className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {activity.type === 'updated' && <Activity className="h-4 w-4 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.user}</span>{' '}
                            <span className="text-gray-600 dark:text-slate-400">{activity.action}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Collaboration Insight */}
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-green-500/20">
                      <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Collaboration Boost
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                        Cross-team collaboration increased by <span className="font-semibold text-green-600 dark:text-green-400">32%</span> this month! Engineering and Design teams are working together on 8 active projects.
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
  suffix?: string;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, iconColor, trend, suffix = '' }: MetricCardProps) {
  const isPositive = trend === 'up' ? change >= 0 : change <= 0;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6 hover:shadow-lg transition-shadow">
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
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{changeLabel}</div>
    </div>
  );
}

// Team Type Card Component
interface TeamTypeCardProps {
  label: string;
  count: number;
  icon: string;
  color: string;
}

function TeamTypeCard({ label, count, icon, color }: TeamTypeCardProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] hover:shadow-md transition-shadow">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
        style={{ backgroundColor: color + '20' }}
      >
        <IconRenderer iconName={icon} className="h-5 w-5" style={{ color }} />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
      <div className="text-xs font-medium text-gray-600 dark:text-slate-400">{label}</div>
    </div>
  );
}
