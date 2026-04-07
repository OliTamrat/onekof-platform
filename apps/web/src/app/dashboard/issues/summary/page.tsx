'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { CreateProjectModal } from '@/components/create-project-modal';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  MoreHorizontal,
  Sparkles,
  Folder,
  Briefcase,
  X,
  User
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function IssuesSummaryPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { projects, isLoadingProjects } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // INNOVATION: Lightning-fast drill-down modal state
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Drill-down modal state
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [filterTitle, setFilterTitle] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Add timeout for loading state
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    enabled: !!session,
  });

  const currentProject = projectsData?.projects?.[0];

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: !!session,
  });

  // Fetch recent issues
  const { data: issuesData } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
    enabled: !!session,
  });

  // Show loading while checking session
  if (status === 'loading' && !loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#1B1F23]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If loading timed out
  if (status === 'loading' && loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#1B1F23]">
        <div className="text-center max-w-md p-6">
          <div className="mb-4 text-yellow-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {t("dashboard.sessionLoadingIssue")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {t("dashboard.sessionLoadingDesc")}
          </p>
          <Button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-[#1C8C7D] text-white rounded-md hover:bg-[#156B60]"
          >
            {t("dashboard.goToSignIn")}
          </Button>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const issues = issuesData?.issues || [];

  // Calculate statistics from real data
  const tasksCompleted = issues.filter(
    (i: any) => i.status === 'DONE' &&
    new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const tasksUpdated = issues.filter(
    (i: any) => new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const tasksCreated = issues.filter(
    (i: any) => new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const tasksDueSoon = issues.filter(
    (i: any) => i.dueDate &&
    new Date(i.dueDate) > new Date() &&
    new Date(i.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Get status counts
  const statusCounts = {
    TODO: issues.filter((i: any) => i.status === 'TODO').length,
    IN_PROGRESS: issues.filter((i: any) => i.status === 'IN_PROGRESS').length,
    IN_REVIEW: issues.filter((i: any) => i.status === 'IN_REVIEW').length,
    DONE: issues.filter((i: any) => i.status === 'DONE').length,
  };

  // Priority counts
  const priorityCounts = {
    HIGHEST: issues.filter((i: any) => i.priority === 'HIGHEST').length,
    HIGH: issues.filter((i: any) => i.priority === 'HIGH').length,
    MEDIUM: issues.filter((i: any) => i.priority === 'MEDIUM').length,
    LOW: issues.filter((i: any) => i.priority === 'LOW').length,
    LOWEST: issues.filter((i: any) => i.priority === 'LOWEST').length,
  };

  // Type counts
  const typeCounts = {
    TASK: issues.filter((i: any) => i.type === 'TASK').length,
    STORY: issues.filter((i: any) => i.type === 'STORY').length,
    BUG: issues.filter((i: any) => i.type === 'BUG').length,
    EPIC: issues.filter((i: any) => i.type === 'EPIC').length,
  };

  const totalIssues = issues.length;
  const maxPriority = Math.max(...Object.values(priorityCounts), 1);

  // Get favorite projects
  const favoriteProjects = projects.filter(p => p.isFavorite).slice(0, 3);

  // Recent activity (last 5 updated issues)
  const recentActivity = issues
    .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Handlers for drill-down
  const handleShowCompletedTasks = () => {
    const completed = issues.filter(
      (i: any) => i.status === 'DONE' &&
      new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    setFilteredTasks(completed);
    setFilterTitle(t('issuesSummary.filterCompletedTitle'));
    setIsFilterModalOpen(true);
  };

  const handleShowUpdatedTasks = () => {
    const updated = issues.filter(
      (i: any) => new Date(i.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    setFilteredTasks(updated);
    setFilterTitle(t('issuesSummary.filterUpdatedTitle'));
    setIsFilterModalOpen(true);
  };

  const handleShowCreatedTasks = () => {
    const created = issues.filter(
      (i: any) => new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    setFilteredTasks(created);
    setFilterTitle(t('issuesSummary.filterCreatedTitle'));
    setIsFilterModalOpen(true);
  };

  const handleShowDueSoonTasks = () => {
    const dueSoon = issues.filter(
      (i: any) => i.dueDate &&
      new Date(i.dueDate) > new Date() &&
      new Date(i.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    setFilteredTasks(dueSoon);
    setFilterTitle(t('issuesSummary.filterDueSoonTitle'));
    setIsFilterModalOpen(true);
  };

  const handleShowStatusTasks = (status: string, statusLabel: string) => {
    const filtered = issues.filter((i: any) => i.status === status);

    // AI-Powered Analytics: Calculate metrics for this status
    const totalTasks = filtered.length;
    const withAssignee = filtered.filter((i: any) => i.assignee).length;
    const unassigned = totalTasks - withAssignee;

    // Priority breakdown
    const highPriority = filtered.filter((i: any) => i.priority === 'HIGHEST' || i.priority === 'HIGH').length;
    const mediumPriority = filtered.filter((i: any) => i.priority === 'MEDIUM').length;
    const lowPriority = filtered.filter((i: any) => i.priority === 'LOW' || i.priority === 'LOWEST').length;

    // Overdue tasks (tasks with due date in the past)
    const overdue = filtered.filter((i: any) => i.dueDate && new Date(i.dueDate) < new Date()).length;

    // Average age of tasks in this status
    const now = new Date().getTime();
    const ages = filtered.map((i: any) => {
      const updated = new Date(i.updatedAt).getTime();
      return (now - updated) / (1000 * 60 * 60 * 24); // days
    });
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length) : 0;

    // Build AI insights subtitle
    const insights = [];
    if (overdue > 0) insights.push(`${overdue} ${t('issuesSummary.overdue')}`);
    if (unassigned > 0) insights.push(`${unassigned} ${t('issuesSummary.unassigned')}`);
    if (highPriority > 0) insights.push(`${highPriority} ${t('issuesSummary.highPriority')}`);
    if (avgAge > 0) insights.push(t('issuesSummary.avgDaysOld').replace('{{days}}', String(avgAge)));

    const subtitle = insights.length > 0 ? insights.join(' • ') : `${totalTasks} ${t('issuesSummary.taskPlural')} in ${statusLabel.toLowerCase()} status`;

    setFilteredTasks(filtered);
    setFilterTitle(`${statusLabel} Tasks • ${totalTasks}`);
    setIsFilterModalOpen(true);
  };

  const handleShowAllStatusOverview = () => {
    // Show all tasks grouped by status
    setFilteredTasks(issues);
    setFilterTitle(t('issuesSummary.statusOverviewTotal').replace('{{count}}', String(totalIssues)));
    setIsFilterModalOpen(true);
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('issuesSummary.title')}
        icon={<TrendingUp className="h-6 w-6" />}
        iconColor="#10B981"
        currentTab="summary"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">

        <div className="flex-1 overflow-auto p-6">
          {/* Stats Cards - Beautiful 2x2 grid on mobile */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={tasksCompleted.toString()}
            label={t('dashboard.completed')}
            sublabel={t('dashboard.inLast7Days')}
            color="text-green-500 dark:text-green-400"
            onClick={handleShowCompletedTasks}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value={tasksUpdated.toString()}
            label={t('dashboard.updated')}
            sublabel={t('dashboard.inLast7Days')}
            color="text-blue-500 dark:text-blue-400"
            onClick={handleShowUpdatedTasks}
          />
          <StatCard
            icon={<Plus className="h-5 w-5" />}
            value={tasksCreated.toString()}
            label={t('dashboard.created')}
            sublabel={t('dashboard.inLast7Days')}
            color="text-primary-500 dark:text-primary-400"
            onClick={handleShowCreatedTasks}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value={tasksDueSoon.toString()}
            label={t('dashboard.dueSoon')}
            sublabel={t('dashboard.inNext7Days')}
            color="text-orange-500 dark:text-orange-400"
            onClick={handleShowDueSoonTasks}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Overview */}
          <div className="lg:col-span-2">
            <div
              role="button"
              tabIndex={0}
              onClick={handleShowAllStatusOverview}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShowAllStatusOverview(); }}
              className="group relative w-full text-left rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200/50 dark:border-slate-700/50 hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] overflow-hidden"
            >
              {/* 3D depth effect */}
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl -z-10 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#1C8C7D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t('dashboard.statusOverview')}
                </h2>
                <div className="text-xs text-[#1C8C7D] dark:text-[#1C8C7D] font-medium">
                  {t('dashboard.clickToViewDetails')}
                </div>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                {t('dashboard.statusDescription')}
              </p>

              {/* Donut Chart - Responsive Layout */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                <div className="relative h-40 w-40 md:h-48 md:w-48 shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="15"
                    />
                    {/* Segments based on real data */}
                    {totalIssues > 0 && (
                      <>
                        {/* TODO segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="15"
                          strokeDasharray={`${(statusCounts.TODO / totalIssues) * 220} 220`}
                          strokeDashoffset="0"
                        />
                        {/* IN_PROGRESS segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="15"
                          strokeDasharray={`${(statusCounts.IN_PROGRESS / totalIssues) * 220} 220`}
                          strokeDashoffset={-((statusCounts.TODO / totalIssues) * 220)}
                        />
                        {/* IN_REVIEW segment */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="15"
                          strokeDasharray={`${(statusCounts.IN_REVIEW / totalIssues) * 220} 220`}
                          strokeDashoffset={-(((statusCounts.TODO + statusCounts.IN_PROGRESS) / totalIssues) * 220)}
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{totalIssues}</div>
                    <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{t('dashboard.totalItems')}</div>
                  </div>
                </div>

                {/* Legend - Properly aligned */}
                <div className="flex-1 w-full space-y-2 md:space-y-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleShowStatusTasks('TODO', t('status.todo')); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleShowStatusTasks('TODO', t('status.todo')); } }}
                    className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-green-500 shrink-0"></div>
                      <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">{t('status.todo')}</span>
                    </div>
                    <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white ml-4">{statusCounts.TODO}</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleShowStatusTasks('IN_PROGRESS', t('status.inProgress')); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleShowStatusTasks('IN_PROGRESS', t('status.inProgress')); } }}
                    className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-blue-500 shrink-0"></div>
                      <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">{t("status.inProgress")}</span>
                    </div>
                    <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white ml-4">{statusCounts.IN_PROGRESS}</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleShowStatusTasks('IN_REVIEW', t('status.inReview')); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleShowStatusTasks('IN_REVIEW', t('status.inReview')); } }}
                    className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-yellow-500 shrink-0"></div>
                      <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">{t("status.inReview")}</span>
                    </div>
                    <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white ml-4">{statusCounts.IN_REVIEW}</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleShowStatusTasks('DONE', t('status.done')); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleShowStatusTasks('DONE', t('status.done')); } }}
                    className="flex items-center justify-between w-full hover:bg-slate-50 dark:hover:bg-slate-800 p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className="h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-emerald-500 shrink-0"></div>
                      <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-medium">{t('status.done')}</span>
                    </div>
                    <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white ml-4">{statusCounts.DONE}</span>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('dashboard.priorityBreakdown')}</h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {t('dashboard.priorityDescription')}
                </p>
                <div className="space-y-2">
                  <PriorityBar label={t('priority.highest')} value={priorityCounts.HIGHEST} max={maxPriority} color="bg-red-500" />
                  <PriorityBar label={t('priority.high')} value={priorityCounts.HIGH} max={maxPriority} color="bg-orange-500" />
                  <PriorityBar label={t('priority.medium')} value={priorityCounts.MEDIUM} max={maxPriority} color="bg-yellow-500" />
                  <PriorityBar label={t('priority.low')} value={priorityCounts.LOW} max={maxPriority} color="bg-green-500" />
                  <PriorityBar label={t('priority.lowest')} value={priorityCounts.LOWEST} max={maxPriority} color="bg-gray-400" />
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity - AI-Powered Timeline */}
            <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/30 to-slate-300/30 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl -z-10"></div>
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('dashboard.recentActivity')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-[#1C8C7D] font-medium">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{t('dashboard.aiPowered')}</span>
                    </div>
                  </div>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {t('dashboard.recentActivityDescription')}
                </p>
                <ActivityTimeline limit={20} showFilters={true} />
              </div>
            </div>

            {/* Types of Work */}
            <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/30 to-slate-300/30 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl -z-10"></div>
              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('dashboard.typesOfWork')}
                  </h2>
                  <a href="/dashboard/issues" className="text-sm text-[#1C8C7D] hover:underline">
                    {t('dashboard.viewAllItems')}
                  </a>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  {t('issuesSummary.typesOfWorkDesc')}
                </p>
                <div className="space-y-2">
                  {totalIssues > 0 ? (
                    <>
                      <TypeBar label={t('issuesSummary.typeTask')} percentage={(typeCounts.TASK / totalIssues) * 100} color="bg-blue-500" />
                      <TypeBar label={t('issuesSummary.typeStory')} percentage={(typeCounts.STORY / totalIssues) * 100} color="bg-green-500" />
                      <TypeBar label={t('issuesSummary.typeBug')} percentage={(typeCounts.BUG / totalIssues) * 100} color="bg-red-500" />
                      <TypeBar label={t('issuesSummary.typeEpic')} percentage={(typeCounts.EPIC / totalIssues) * 100} color="bg-purple-500" />
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">{t('issuesSummary.noWorkItems')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Projects */}
            {favoriteProjects.length > 0 && (
              <div className="relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/30 to-slate-300/30 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl -z-10"></div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {t('issuesSummary.favoriteProjects')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    {t('issuesSummary.viewAll')}
                  </Button>
                </div>
                <div className="space-y-2">
                  {favoriteProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.key}`)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded text-sm"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      >
                        <Folder className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {project.key}
                        </p>
                      </div>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* INNOVATION: Lightning-fast drill-down slide-out - Opens in < 50ms */}
      {selectedIssue && (
        <IssueDetailSlideout
          issue={selectedIssue}
          onClose={() => {
            setIsIssueModalOpen(false);
            setSelectedIssue(null);
          }}
        />
      )}

      {/* INNOVATION: Beautiful Drill-Down Modal with AI Analytics */}
      {isFilterModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsFilterModalOpen(false)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[85vh] bg-white dark:bg-[#1B1F23] rounded-lg shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gradient-to-r from-[#1C8C7D] to-[#16A085]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{filterTitle}</h2>
                  <p className="text-sm text-white/80 mt-1">
                    {filteredTasks.length}{' '}
                    {filteredTasks.length === 1 ? t('issuesSummary.taskSingular') : t('issuesSummary.taskPlural')}{' '}
                    {t('issuesSummary.tasksFound')}
                  </p>
                </div>
                <Button variant="ghost" size="icon"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="rounded-md p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* AI-Powered Analytics Bar */}
            {filteredTasks.length > 0 && (() => {
              // Calculate analytics in real-time
              const withAssignee = filteredTasks.filter((i: any) => i.assignee).length;
              const unassigned = filteredTasks.length - withAssignee;
              const overdue = filteredTasks.filter((i: any) => i.dueDate && new Date(i.dueDate) < new Date()).length;
              const highPriority = filteredTasks.filter((i: any) => i.priority === 'HIGHEST' || i.priority === 'HIGH').length;

              // Calculate average age
              const now = new Date().getTime();
              const ages = filteredTasks.map((i: any) => {
                const updated = new Date(i.updatedAt).getTime();
                return (now - updated) / (1000 * 60 * 60 * 24); // days
              });
              const avgAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length) : 0;

              return (
                <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 py-3">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{t('issuesSummary.aiInsights')}</span>
                    </div>
                    {overdue > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-red-600 dark:text-red-400">{overdue}</span>{' '}
                          {t('issuesSummary.overdue')}
                        </span>
                      </div>
                    )}
                    {unassigned > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">{unassigned}</span>{' '}
                          {t('issuesSummary.unassigned')}
                        </span>
                      </div>
                    )}
                    {highPriority > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">{highPriority}</span>{' '}
                          {t('issuesSummary.highPriority')}
                        </span>
                      </div>
                    )}
                    {avgAge > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {t('issuesSummary.avgDaysOld').replace('{{days}}', String(avgAge))}
                        </span>
                      </div>
                    )}
                    {withAssignee > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-green-600 dark:text-green-400">{withAssignee}</span>{' '}
                          {t('issuesSummary.assigned')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] p-6">
              {filteredTasks.length > 0 ? (
                <div className="space-y-3">
                  {filteredTasks.map((task: any) => (
                    <div
                      key={task.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedIssue(task);
                        setIsFilterModalOpen(false);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedIssue(task); setIsFilterModalOpen(false); } }}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#22272B] hover:shadow-md hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {task.project?.key}-{task.key}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              task.status === 'TODO' ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300' :
                              task.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                              task.status === 'IN_REVIEW' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                              task.status === 'DONE' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.priority && (
                              <span className={`text-xs font-medium ${
                                task.priority === 'HIGHEST' ? 'text-red-600' :
                                task.priority === 'HIGH' ? 'text-orange-600' :
                                task.priority === 'MEDIUM' ? 'text-yellow-600' :
                                task.priority === 'LOW' ? 'text-green-600' :
                                'text-gray-600'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignee?.name || t('common.unassigned')}</span>
                            </div>
                            {task.updatedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {t('issuesSummary.updatedPrefix')}{' '}
                                  {new Date(task.updatedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                            {task.reporter && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>{t('issuesSummary.createdByPrefix')} {task.reporter.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {task.assignee?.avatar ? (
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : task.assignee ? (
                          <div className="h-10 w-10 rounded-full bg-[#1C8C7D] text-white flex items-center justify-center text-sm font-medium">
                            {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('issuesSummary.noTasksFound')}</p>
                </div>
              )}
            </div>
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes scale-in {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }

            .animate-scale-in {
              animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}</style>
        </>
      )}
    </AppLayout>
  );
}

// Helper Components
function StatCard({
  icon,
  value,
  label,
  sublabel,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sublabel: string;
  color: string;
  onClick?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className="group relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-3 md:p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left w-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D]"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C8C7D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* 3D depth effect - bottom shadow layer */}
      <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl -z-10 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"></div>

      <div className="relative z-10">
        <div className="mb-2 md:mb-4 flex items-center justify-between">
          <div className={`${color} p-2 md:p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="text-[10px] md:text-xs text-[#1C8C7D] dark:text-[#1C8C7D] font-semibold hidden sm:flex items-center gap-1 group-hover:gap-2 transition-all">
            <span>{t('common.details')}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
        <div className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{value}</div>
        <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{label}</div>
        <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-1">{sublabel}</div>
      </div>
    </div>
  );
}

function PriorityBar({
  label,
  value,
  max,
  color = 'bg-slate-300 dark:bg-slate-600',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm text-slate-700 dark:text-slate-300">{label}</div>
      <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {percentage > 0 && (
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      <div className="w-8 text-right text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function TypeBar({
  label,
  percentage,
  color = 'bg-slate-300 dark:bg-slate-600',
}: {
  label: string;
  percentage: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          {percentage > 0 && (
            <div
              className={`h-full ${color}`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
        <span className="w-10 text-right font-medium text-slate-900 dark:text-white">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  item,
  status,
  time,
  onClick,
}: {
  user: string;
  action: string;
  item: string;
  status: string;
  time: string;
  onClick?: () => void;
}) {
  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    IN_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    DONE: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  };

  return (
    <div
      className="text-sm cursor-pointer p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
      onClick={onClick}
    >
      <p className="text-slate-700 dark:text-slate-300">
        <span className="font-medium text-slate-900 dark:text-white">{user}</span>{' '}
        {action}{' '}
        <span className="font-medium text-[#1C8C7D] hover:text-[#156B60] transition-colors">{item}</span>
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColors[status] || statusColors.TODO}`}>
          {status.replace('_', ' ')}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{time}</span>
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
