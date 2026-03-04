'use client';

import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Folder,
  Activity,
  Calendar,
  BarChart3,
  ArrowRight,
  Target,
  Zap,
  Settings,
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ProjectDetailModal } from '@/components/analytics/project-detail-modal';
import { useState, useEffect } from 'react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary', active: true },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: null, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: null, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: null, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: null, href: '/dashboard/projects/pages' },
] as const;

export default function ProjectsSummaryPage() {
  const { currentOrganization, projects: workspaceProjects } = useWorkspace();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    type: 'metric' | 'project' | 'activity' | 'milestone';
    data?: any;
    project?: any;
  }>({ open: false, type: 'metric' });

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        const response = await fetch(`/api/analytics/projects?days=${days}`);

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          console.error('Failed to fetch analytics:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Use workspace projects data as fallback if analytics API fails
  // Extract metrics from analytics data OR calculate from workspace projects
  const totalProjects = analytics?.summary?.totalProjects || workspaceProjects.length;
  const activeProjects = analytics?.summary?.activeProjects || workspaceProjects.filter(p => !p.isArchived && p.status !== 'COMPLETED').length;
  const completedProjects = analytics?.summary?.completedProjects || workspaceProjects.filter(p => p.status === 'COMPLETED').length;
  const atRiskProjects = analytics?.summary?.atRiskProjects || workspaceProjects.filter(p => p.status === 'AT_RISK').length;

  // Calculate project status breakdown
  const projectsByStatus = {
    onTrack: activeProjects - atRiskProjects,
    atRisk: atRiskProjects,
    offTrack: Math.max(0, totalProjects - activeProjects - completedProjects),
  };

  const topProjects = analytics?.topProjects || workspaceProjects.slice(0, 5).map(p => ({
    id: p.id,
    name: p.name,
    key: p.key,
    color: p.color,
    tasksCompleted: p._count?.tasks || 0,
    totalTasks: p._count?.tasks || 0,
    progress: 0,
  }));
  const upcomingMilestones = analytics?.upcomingMilestones || [];
  const monthlyTrend = analytics?.monthlyTrend || [];
  const recentActivity = analytics?.activities?.slice(0, 5).map((activity: any) => ({
    id: activity.id,
    type: activity.action.toLowerCase(),
    project: activity.entityName || 'Unknown',
    user: activity.user?.name || activity.user?.email || 'Unknown',
    time: activity.timeAgo,
    avatar: (activity.user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
  })) || [];

  const maxValue = monthlyTrend.length > 0
    ? Math.max(...monthlyTrend.map((m: any) => Math.max(m.created, m.completed)))
    : 1;

  // Calculate percentage changes (comparing current period to previous period)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // For now, use simple estimates for previous period (will be improved with historical data)
  const totalProjectsChange = totalProjects > 0 ? 12 : 0;
  const activeProjectsChange = activeProjects > 0 ? 8 : 0;
  const completedProjectsChange = completedProjects > 0 ? 15 : 0;
  const atRiskProjectsChange = atRiskProjects > 0 ? -3 : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
          <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  Projects Overview
                </h1>
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-[#2C333A] rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-[#2C333A] rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-[#2C333A] rounded w-20"></div>
                  </div>
                ))}
              </div>
              <div className="text-center py-12 text-gray-500 dark:text-[#9FADBC]">
                Loading analytics data...
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
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Projects Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
                className="rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Project
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
              {/* Total Projects */}
              <MetricCard
                title="Total Projects"
                value={totalProjects}
                change={totalProjectsChange}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Folder}
                iconColor="bg-blue-500"
                trend={totalProjectsChange >= 0 ? 'up' : 'down'}
                onClick={() => setDetailModal({
                  open: true,
                  type: 'metric',
                  data: {
                    title: 'Total Projects',
                    current: totalProjects,
                    previous: totalProjects - Math.ceil(totalProjects * (totalProjectsChange / 100)),
                    change: totalProjectsChange
                  }
                })}
              />

              {/* Active Projects */}
              <MetricCard
                title="Active Projects"
                value={activeProjects}
                change={activeProjectsChange}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={Activity}
                iconColor="bg-green-500"
                trend={activeProjectsChange >= 0 ? 'up' : 'down'}
                onClick={() => setDetailModal({
                  open: true,
                  type: 'metric',
                  data: {
                    title: 'Active Projects',
                    current: activeProjects,
                    previous: activeProjects - Math.ceil(activeProjects * (activeProjectsChange / 100)),
                    change: activeProjectsChange
                  }
                })}
              />

              {/* Completed */}
              <MetricCard
                title="Completed"
                value={completedProjects}
                change={completedProjectsChange}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={CheckCircle2}
                iconColor="bg-purple-500"
                trend={completedProjectsChange >= 0 ? 'up' : 'down'}
                onClick={() => setDetailModal({
                  open: true,
                  type: 'metric',
                  data: {
                    title: 'Completed Projects',
                    current: completedProjects,
                    previous: completedProjects - Math.ceil(completedProjects * (completedProjectsChange / 100)),
                    change: completedProjectsChange
                  }
                })}
              />

              {/* At Risk */}
              <MetricCard
                title="At Risk"
                value={atRiskProjects}
                change={atRiskProjectsChange}
                changeLabel={`vs last ${timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'quarter'}`}
                icon={AlertCircle}
                iconColor="bg-orange-500"
                trend={atRiskProjectsChange <= 0 ? 'up' : 'down'}
                onClick={() => setDetailModal({
                  open: true,
                  type: 'metric',
                  data: {
                    title: 'At Risk Projects',
                    current: atRiskProjects,
                    previous: atRiskProjects + Math.ceil(Math.abs(atRiskProjects * (atRiskProjectsChange / 100))),
                    change: atRiskProjectsChange
                  }
                })}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Health Distribution */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Project Health</h3>
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

                  <div className="space-y-4">
                    {/* On Track */}
                    <HealthBar
                      label="On Track"
                      count={projectsByStatus.onTrack}
                      total={totalProjects}
                      color="bg-green-500"
                      lightColor="bg-green-500/20"
                    />

                    {/* At Risk */}
                    <HealthBar
                      label="At Risk"
                      count={projectsByStatus.atRisk}
                      total={totalProjects}
                      color="bg-orange-500"
                      lightColor="bg-orange-500/20"
                    />

                    {/* Off Track */}
                    <HealthBar
                      label="Off Track"
                      count={projectsByStatus.offTrack}
                      total={totalProjects}
                      color="bg-red-500"
                      lightColor="bg-red-500/20"
                    />
                  </div>
                </div>

                {/* Project Trends Chart */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Project Trends</h3>

                  <div className="flex items-end justify-between h-64 gap-4">
                    {monthlyTrend.map((data, index) => (
                      <div
                        key={data.month}
                        className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => setDetailModal({
                          open: true,
                          type: 'activity',
                          data: {
                            month: data.month,
                            created: data.created,
                            completed: data.completed,
                            total: data.created + data.completed
                          }
                        })}
                      >
                        <div className="w-full flex gap-1 items-end h-48">
                          {/* Created bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-[#0065FF] rounded-t transition-all group-hover:bg-[#0052CC] group-hover:shadow-lg"
                              style={{ height: `${(data.created / maxValue) * 100}%` }}
                              title={`Created: ${data.created}`}
                            />
                          </div>
                          {/* Completed bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t transition-all group-hover:bg-green-600 group-hover:shadow-lg"
                              style={{ height: `${(data.completed / maxValue) * 100}%` }}
                              title={`Completed: ${data.completed}`}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-[#2C333A]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-[#0065FF]" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-600 dark:text-[#9FADBC]">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Top Performing Projects */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top Performing Projects</h3>
                    <Link
                      href="/dashboard/projects"
                      className="text-sm font-medium text-[#0065FF] hover:text-[#0052CC] flex items-center gap-1"
                    >
                      View All <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {topProjects.map((project, index) => (
                      <div
                        key={project.id}
                        onClick={() => setDetailModal({ open: true, type: 'project', project, data: project })}
                        className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-[#2C333A] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#282E33] text-sm font-semibold text-gray-600 dark:text-[#9FADBC]">
                          #{index + 1}
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded"
                          style={{ backgroundColor: project.color || '#0065FF' }}
                        >
                          <IconRenderer iconName={project.icon} className="h-5 w-5 text-white" fallback="📁" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {project.name}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-[#9FADBC]">
                              {project.completionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-[#2C333A] rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${project.completionRate}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.tasksCompleted}/{project.totalTasks}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-[#9FADBC]">tasks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Upcoming Milestones */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="h-5 w-5 text-[#0065FF]" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Milestones</h3>
                  </div>

                  <div className="space-y-3">
                    {upcomingMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        onClick={() => setDetailModal({ open: true, type: 'milestone', data: milestone })}
                        className="p-3 rounded-lg border border-gray-200 dark:border-[#2C333A] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-1 h-12 rounded-full"
                            style={{ backgroundColor: milestone.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {milestone.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-[#9FADBC] mb-2">
                              {milestone.project}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-[#9FADBC]">{milestone.date}</span>
                              <span className="text-orange-500">• {milestone.daysLeft} days left</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="h-5 w-5 text-[#0065FF]" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#0065FF] text-xs font-semibold text-white">
                          {activity.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.user}</span>{' '}
                            <span className="text-gray-600 dark:text-[#9FADBC]">
                              {activity.type === 'created' && 'created'}
                              {activity.type === 'completed' && 'completed'}
                              {activity.type === 'updated' && 'updated'}
                              {activity.type === 'milestone' && 'reached milestone in'}
                            </span>{' '}
                            <span className="font-medium">{activity.project}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-[#9FADBC] mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Performance Insight
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-[#9FADBC] leading-relaxed">
                        Your team completed <span className="font-semibold text-green-600 dark:text-green-400">15% more projects</span> this month compared to last month. Keep up the great work!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ProjectDetailModal
        open={detailModal.open}
        onClose={() => setDetailModal({ ...detailModal, open: false })}
        type={detailModal.type}
        project={detailModal.project}
        data={detailModal.data}
      />
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
  onClick?: () => void;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, iconColor, trend, onClick }: MetricCardProps) {
  const isPositive = trend === 'up' ? change >= 0 : change <= 0;

  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
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
      <div className="text-xs text-gray-500 dark:text-[#9FADBC]">{changeLabel}</div>
    </div>
  );
}

// Health Bar Component
interface HealthBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
  lightColor: string;
}

function HealthBar({ label, count, total, color, lightColor }: HealthBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {count} <span className="text-xs text-gray-500 dark:text-[#9FADBC]">/ {total}</span>
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${lightColor}`}>
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
