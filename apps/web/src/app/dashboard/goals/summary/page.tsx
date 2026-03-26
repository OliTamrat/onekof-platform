'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  Zap,
  BarChart3,
  Settings,
  Calendar,
  Flag,
  ArrowRight,
  Award,
  Users,
  Star
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary', active: true },
  { id: 'goals', label: 'Goals', icon: null, href: '/dashboard/goals' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/goals/settings' },
];

export default function GoalsSummaryPage() {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<'quarter' | 'year' | 'all'>('quarter');

  // Fetch goals analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['goals-analytics', timeRange],
    queryFn: async () => {
      const days = timeRange === 'quarter' ? 90 : timeRange === 'year' ? 365 : 730;
      const res = await fetch(`/api/analytics/goals?days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch goals analytics');
      return res.json();
    },
  });

  // Extract metrics from analytics
  const totalGoals = analytics?.summary?.totalGoals || 0;
  const activeGoals = analytics?.summary?.activeGoals || 0;
  const completedGoals = analytics?.summary?.completedGoals || 0;
  const atRiskGoals = analytics?.summary?.atRiskGoals || 0;
  const notStartedGoals = analytics?.summary?.notStartedGoals || 0;
  const avgProgress = analytics?.summary?.avgProgress || 0;

  // Goals by status breakdown
  const goalsByStatus = {
    onTrack: activeGoals - atRiskGoals,
    atRisk: atRiskGoals,
    behindSchedule: Math.max(0, totalGoals - activeGoals - completedGoals - notStartedGoals),
    achieved: completedGoals,
  };

  // Top performing goals from analytics
  const topPerformingGoals = analytics?.topGoals?.map((goal: any) => ({
    id: goal.id,
    title: goal.title,
    owner: goal.teamName,
    progress: goal.progress,
    trend: 12,
    health: goal.progress >= 80 ? 'excellent' : goal.progress >= 60 ? 'good' : 'fair',
  })) || [];

  // Upcoming deadlines from analytics
  const upcomingDeadlines = analytics?.upcomingDeadlines?.map((goal: any) => ({
    id: goal.id,
    title: goal.title,
    team: goal.teamName,
    dueDate: new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    daysLeft: goal.daysLeft,
    progress: goal.progress,
    priority: goal.priority === 'CRITICAL' || goal.priority === 'HIGH' ? 'high' : 'medium',
  })) || [];

  // Monthly trend data
  const quarterlyProgress = analytics?.monthlyTrend?.map((month: any) => ({
    quarter: month.month,
    planned: month.created + month.completed,
    achieved: month.completed,
    inProgress: month.created - month.completed,
  })) || [];

  const maxQuarterly = quarterlyProgress.length > 0
    ? Math.max(...quarterlyProgress.map((q: any) => q.planned))
    : 1;

  // Mock data for visualizations (will be enhanced with more analytics endpoints)
  const keyResults = [
    { id: 1, title: 'Increase Monthly Active Users', goal: 'Product Growth', target: 10000, current: 8500, unit: 'users', color: '#3B82F6', dueDate: 'Mar 31' },
    { id: 2, title: 'Reduce Customer Churn Rate', goal: 'Customer Success', target: 5, current: 6.2, unit: '%', color: '#8B5CF6', dueDate: 'Mar 31' },
    { id: 3, title: 'Launch 3 Major Features', goal: 'Product Development', target: 3, current: 2, unit: 'features', color: '#10B981', dueDate: 'Mar 31' },
    { id: 4, title: 'Achieve 95% Uptime', goal: 'Infrastructure', target: 95, current: 97.5, unit: '%', color: '#F59E0B', dueDate: 'Mar 31' },
  ];

  const teamCompletion = [
    { team: 'Engineering', completed: 24, total: 28, rate: 86 },
    { team: 'Product', completed: 18, total: 22, rate: 82 },
    { team: 'Marketing', completed: 15, total: 19, rate: 79 },
    { team: 'Sales', completed: 12, total: 16, rate: 75 },
    { team: 'Support', completed: 10, total: 14, rate: 71 },
  ];

  const recentAchievements = [
    { id: 1, title: 'Reached 100K Users Milestone', team: 'Product Team', completedDate: '2 days ago', icon: Trophy },
    { id: 2, title: 'Launched Mobile App v2.0', team: 'Engineering', completedDate: '5 days ago', icon: Zap },
    { id: 3, title: 'Exceeded Q4 Revenue Target', team: 'Sales Team', completedDate: '1 week ago', icon: Award },
    { id: 4, title: 'Achieved 98% Customer Satisfaction', team: 'Support Team', completedDate: '2 weeks ago', icon: Star },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
          <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                  <Target className="h-6 w-6" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals & OKR Summary</h1>
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
                Loading goals analytics...
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
                <Target className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Goals & OKR Summary</h1>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'quarter' | 'year' | 'all')}
                className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <Link
                href="/dashboard/goals"
                className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />{t("goals.newGoal")}</Link>
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
                title="Total Goals"
                value={totalGoals || 25}
                change={+20}
                changeLabel="vs last quarter"
                icon={Target}
                iconColor="bg-blue-500"
                trend="up"
              />

              <MetricCard
                title="On Track"
                value={goalsByStatus.onTrack}
                change={+15}
                changeLabel="vs last quarter"
                icon={TrendingUp}
                iconColor="bg-green-500"
                trend="up"
              />

              <MetricCard
                title="Achieved"
                value={goalsByStatus.achieved}
                change={+25}
                changeLabel="vs last quarter"
                icon={CheckCircle2}
                iconColor="bg-purple-500"
                trend="up"
              />

              <MetricCard
                title="At Risk"
                value={goalsByStatus.atRisk}
                change={-10}
                changeLabel="vs last quarter"
                icon={AlertTriangle}
                iconColor="bg-orange-500"
                trend="down"
              />
            </div>

            {/* Overall Progress */}
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Overall OKR Progress</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">72%</div>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-1000"
                  style={{ width: '72%' }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{goalsByStatus.onTrack}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">On Track</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/10">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{goalsByStatus.atRisk}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">At Risk</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{goalsByStatus.behindSchedule}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Behind Schedule</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{goalsByStatus.achieved}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Achieved</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key Results Progress */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Key Results Progress</h3>

                  <div className="space-y-5">
                    {keyResults.map((kr) => {
                      const progress = kr.current >= kr.target ? 100 : (kr.current / kr.target) * 100;
                      const isAchieved = kr.current >= kr.target;
                      const isReversed = kr.title.includes('Reduce') || kr.title.includes('Churn');

                      return (
                        <div key={kr.id} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                {kr.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-slate-400">
                                {kr.goal}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                  {kr.current.toLocaleString()} {kr.unit}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                  of {kr.target.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(progress, 100)}%`,
                                  backgroundColor: kr.color,
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                              {Math.round(progress)}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                              <Calendar className="h-3 w-3" />
                              Due {kr.dueDate}
                            </div>
                            {isAchieved && (
                              <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Target Achieved
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quarterly Progress Trends */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Quarterly Progress</h3>
                    <div className="flex gap-2">
                      {(['quarter', 'year', 'all'] as const).map((range) => (
                        <Button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            timeRange === range
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-[#282E33] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {range === 'quarter' ? 'Quarter' : range === 'year' ? 'Year' : 'All Time'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between h-64 gap-4">
                    {quarterlyProgress.map((data: { quarter: string; planned: number; achieved: number; inProgress: number }) => (
                      <div key={data.quarter} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex gap-1 items-end h-48">
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                              style={{ height: `${(data.planned / maxQuarterly) * 100}%` }}
                              title={`Planned: ${data.planned}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                              style={{ height: `${(data.achieved / maxQuarterly) * 100}%` }}
                              title={`Achieved: ${data.achieved}`}
                            />
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-orange-500 rounded-t transition-all hover:bg-orange-600"
                              style={{ height: `${(data.inProgress / maxQuarterly) * 100}%` }}
                              title={`In Progress: ${data.inProgress}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                          {data.quarter.replace(' ', '\n')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">Achieved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500" />
                      <span className="text-xs text-gray-600 dark:text-slate-400">{t("status.inProgress")}</span>
                    </div>
                  </div>
                </div>

                {/* Team Goal Completion */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Team Performance</h3>
                    <Link
                      href="/dashboard/teams"
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      View Teams <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {teamCompletion.map((team, index) => (
                      <div key={team.team} className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{team.team}</span>
                            <span className="text-sm text-gray-600 dark:text-slate-400">
                              {team.completed}/{team.total} goals
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                                style={{ width: `${team.rate}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                              {team.rate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Upcoming Deadlines */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Flag className="h-5 w-5 text-primary-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                  </div>

                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline: { id: string; title: string; team: string; dueDate: string; daysLeft: number; progress: number; priority: string }) => (
                      <div
                        key={deadline.id}
                        className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                            {deadline.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            deadline.priority === 'high'
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                              : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                          }`}>
                            {deadline.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {deadline.team}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{deadline.dueDate}</span>
                          <span className="text-orange-500">• {deadline.daysLeft} days left</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full">
                            <div
                              className="h-1.5 rounded-full bg-primary-500"
                              style={{ width: `${deadline.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            {deadline.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Goals */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Goals</h3>
                  </div>

                  <div className="space-y-3">
                    {topPerformingGoals.map((goal: { id: string; title: string; owner: string; progress: number; trend: number; health: string }, index: number) => (
                      <div key={goal.id} className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {goal.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                            {goal.owner}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full">
                              <div
                                className={`h-1.5 rounded-full ${
                                  goal.health === 'excellent' ? 'bg-green-500' :
                                  goal.health === 'good' ? 'bg-blue-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {goal.progress}%
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs mt-1 ${
                            goal.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {goal.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {Math.abs(goal.trend)}% this week
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Wins</h3>
                  </div>

                  <div className="space-y-4">
                    {recentAchievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={achievement.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              {achievement.team}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {achievement.completedDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Insight Box */}
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Goal Achievement Trend
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                        You're on track to exceed this quarter's target! <span className="font-semibold text-blue-600 dark:text-blue-400">72% of goals</span> are making excellent progress.
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
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{title}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{changeLabel}</div>
    </div>
  );
}
