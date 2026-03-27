'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { useLanguage } from '@/contexts/language-context';

export default function ReportsAndAnalyticsPage() {
  const { t } = useLanguage();
  const { status } = useSession();

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['analytics', 'projects'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/projects?days=30');
      if (!res.ok) throw new Error('Failed to fetch project analytics');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['analytics', 'goals'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/goals');
      if (!res.ok) throw new Error('Failed to fetch goal analytics');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['analytics', 'teams'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/teams');
      if (!res.ok) throw new Error('Failed to fetch team analytics');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const isLoading = projectsLoading || goalsLoading || teamsLoading;

  const stats = projectsData ? {
    totalProjects: projectsData.totalProjects || 0,
    activeProjects: projectsData.activeProjects || 0,
    completedProjects: projectsData.completedProjects || 0,
    atRiskProjects: projectsData.atRiskProjects || 0,
    taskStats: projectsData.taskStats || { total: 0, completed: 0, inProgress: 0, overdue: 0 },
    topProjects: projectsData.topProjects || [],
    monthlyTrend: projectsData.monthlyTrend || [],
    upcomingMilestones: projectsData.upcomingMilestones || [],
  } : null;

  const goalStats = goalsData ? {
    total: goalsData.totalGoals || goalsData.total || 0,
    completed: goalsData.completedGoals || goalsData.completed || 0,
    inProgress: goalsData.inProgressGoals || goalsData.inProgress || 0,
    avgProgress: goalsData.averageProgress || goalsData.avgProgress || 0,
  } : null;

  const teamStats = teamsData ? {
    totalTeams: teamsData.totalTeams || teamsData.teams?.length || 0,
    totalMembers: teamsData.totalMembers || 0,
    topContributors: teamsData.topContributors || [],
  } : null;

  const taskCompletionRate = stats?.taskStats?.total
    ? Math.round((stats.taskStats.completed / stats.taskStats.total) * 100)
    : 0;

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t("reports.title")}
        icon={<BarChart3 className="h-6 w-6" />}
        iconColor="#3B82F6"
        currentTab="summary"
        baseHref="/dashboard/reports"
        showSearch
        showFilters
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center bg-white dark:bg-[#1B1F23]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("reports.loadingAnalytics")}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1B1F23] min-h-screen">
          {/* Summary Stats */}
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <MetricCard
                icon={<FolderKanban className="h-5 w-5" />}
                label={t("reports.activeProjects")}
                value={stats?.activeProjects || 0}
                subtitle={`${stats?.totalProjects || 0} ${t("reports.totalLabel")}`}
                color="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <MetricCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label={t("reports.taskCompletion")}
                value={`${taskCompletionRate}%`}
                subtitle={`${stats?.taskStats?.completed || 0} of ${stats?.taskStats?.total || 0} ${t("reports.tasks")}`}
                color="text-green-600 dark:text-green-400"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <MetricCard
                icon={<Target className="h-5 w-5" />}
                label={t("reports.goalsProgress")}
                value={`${Math.round(goalStats?.avgProgress || 0)}%`}
                subtitle={`${goalStats?.completed || 0} of ${goalStats?.total || 0} completed`}
                color="text-purple-600 dark:text-purple-400"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
              />
              <MetricCard
                icon={<Users className="h-5 w-5" />}
                label={t("reports.teams")}
                value={teamStats?.totalTeams || 0}
                subtitle={`${teamStats?.totalMembers || 0} ${t("reports.members")}`}
                color="text-orange-600 dark:text-orange-400"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column — Project Performance */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Monthly Trend */}
              {stats?.monthlyTrend && stats.monthlyTrend.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.projectActivity")}</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.monthlyTrend.map((month: any) => {
                      const maxVal = Math.max(...stats.monthlyTrend.map((m: any) => Math.max(m.created, m.completed)), 1);
                      return (
                        <div key={month.month} className="flex items-center gap-3">
                          <span className="w-10 text-xs font-medium text-slate-500 dark:text-slate-400">{month.month}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                              <div
                                className="h-full bg-blue-500 rounded-l-full"
                                style={{ width: `${(month.created / maxVal) * 50}%` }}
                                title={`${month.created} created`}
                              />
                              <div
                                className="h-full bg-green-500 rounded-r-full"
                                style={{ width: `${(month.completed / maxVal) * 50}%` }}
                                title={`${month.completed} completed`}
                              />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-16 text-right">
                              {month.created}c / {month.completed}d
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> {t("reports.created")}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> {t("reports.completed")}</span>
                  </div>
                </div>
              )}

              {/* Top Projects */}
              {stats?.topProjects && stats.topProjects.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.topProjectsByCompletion")}</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.topProjects.map((project: any) => (
                      <div key={project.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{project.name}</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white ml-2">{project.completionRate}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${project.completionRate}%`,
                                backgroundColor: project.completionRate >= 80 ? '#00875A' : project.completionRate >= 50 ? '#1C8C7D' : '#3B82F6',
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {project.tasksCompleted}/{project.totalTasks} {t("reports.tasks")} · {project.memberCount} {t("reports.members")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* At Risk & Overdue */}
              {(stats?.atRiskProjects > 0 || (stats?.taskStats?.overdue || 0) > 0) && (
                <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-900/10 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.attentionRequired")}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {stats?.atRiskProjects > 0 && (
                      <div>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.atRiskProjects}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{t("reports.projectsAtRisk")}</p>
                      </div>
                    )}
                    {(stats?.taskStats?.overdue || 0) > 0 && (
                      <div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.taskStats?.overdue}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{t("reports.overdueTasks")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!stats?.totalProjects && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t("reports.noDataYet")}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("reports.noDataYetDesc")}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column — Milestones & Contributors */}
            <div className="space-y-4 md:space-y-6">
              {/* Upcoming Milestones */}
              {stats?.upcomingMilestones && stats.upcomingMilestones.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.upcomingMilestones")}</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.upcomingMilestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          milestone.daysLeft <= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          milestone.daysLeft <= 7 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {milestone.daysLeft}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{milestone.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{milestone.project} · {milestone.daysLeft}{t("reports.daysLeft")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Contributors */}
              {teamStats?.topContributors && teamStats.topContributors.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.topContributors")}</h3>
                  </div>
                  <div className="space-y-3">
                    {teamStats.topContributors.slice(0, 5).map((contributor: any, i: number) => (
                      <div key={contributor.id || i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-xs font-bold text-white">
                          {(contributor.name || contributor.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{contributor.name || contributor.email}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{contributor.activityCount || contributor.contributions || 0} {t("reports.contributions")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              {goalStats && goalStats.total > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("reports.goalsOverview")}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{t("reports.totalGoals")}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{goalStats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{t("reports.completed")}</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">{goalStats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{t("status.inProgress")}</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{goalStats.inProgress}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${goalStats.avgProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{Math.round(goalStats.avgProgress)}% {t("reports.averageProgress")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function MetricCard({ icon, label, value, subtitle, color, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-8 w-8 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
    </div>
  );
}
