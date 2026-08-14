'use client';

import { useSession } from 'next-auth/react';
import { ChooseOrgTypeBanner } from '@/components/organization/choose-org-type-banner';
import { useRouter } from 'next/navigation';
import { useEffect, useState , type ReactNode } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { useLanguage } from '@/contexts/language-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { CreateProjectModal } from '@/components/create-project-modal';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { ProjectStatusOverview } from '@/components/dashboard/project-status-overview';
import { TaskStatusOverview } from '@/components/dashboard/task-status-overview';
import { ProductivityInsight } from '@/components/dashboard/productivity-insight';
import { CARD_SUBTITLE, CARD_SURFACE, CARD_TITLE } from '@/components/ui/card-surface';
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
  User,
  ChevronDown,
  Filter,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { projects, isLoadingProjects } = useWorkspace();
  const { t, fontClass } = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Project filter — read from URL, default to "all"
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('projectId');
    }
    return null;
  });
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  const setProjectFilter = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    const url = new URL(window.location.href);
    if (projectId) {
      url.searchParams.set('projectId', projectId);
    } else {
      url.searchParams.delete('projectId');
    }
    router.replace(url.pathname + url.search, { scroll: false });
    setIsProjectDropdownOpen(false);
  };

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

  // Redirect to org selection if on main domain without subdomain
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'onekof.com' || hostname === 'www.onekof.com';
    if (isMainDomain && status === 'authenticated') {
      router.push('/select-organization');
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

  // Fetch dashboard statistics
  const statsUrl = selectedProjectId ? `/api/dashboard/stats?projectId=${selectedProjectId}` : '/api/dashboard/stats';
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', selectedProjectId],
    queryFn: async () => {
      const res = await fetch(statsUrl);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Stats API ${res.status}: ${text}`);
      }
      return res.json();
    },
    enabled: !!session,
    retry: 1,
  });

  // Fetch recent issues (filtered by project when selected)
  const issuesUrl = selectedProjectId ? `/api/issues?projectId=${selectedProjectId}` : '/api/issues';
  const { data: issuesData, error: issuesError } = useQuery({
    queryKey: ['issues', selectedProjectId],
    queryFn: async () => {
      const res = await fetch(issuesUrl);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Issues API ${res.status}: ${text}`);
      }
      return res.json();
    },
    enabled: !!session,
    retry: 1,
  });

  // Show loading while checking session
  if (status === 'loading' && !loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0E11]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-white/30 dark:text-white/70">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If loading timed out
  if (status === 'loading' && loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0E11]">
        <div className="text-center max-w-md p-6">
          <div className="mb-4 text-yellow-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{t('dashboard.sessionLoadingIssue')}</h2>
          <p className="text-sm text-slate-600 dark:text-white/70 mb-4">
            {t('dashboard.sessionLoadingDesc')}
          </p>
          <Button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-[#1C8C7D] text-white rounded-md hover:bg-[#156B60]"
          >
            {t('dashboard.goToSignIn')}
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

  // Calculate statistics from real data — all-time totals
  // Tile figures come from the server-side aggregates, not from the fetched
  // issues array. The unpaginated list endpoint caps at 500 rows, so counting
  // the array froze every figure at exactly 500 once an organization grew
  // past it — reading, from the outside, as "task creation stopped working".
  const sb: Record<string, number> = stats?.statusBreakdown ?? {};
  const tasksCompleted = sb.DONE ?? 0;
  const tasksInProgress = sb.IN_PROGRESS ?? 0;
  const tasksTodo = (sb.TODO ?? 0) + (sb.BACKLOG ?? 0);
  const tasksOverdue = stats?.stats?.dueSoon ?? 0;

  // Type counts — server aggregate, same cap reasoning as the tiles above.
  const tb: Record<string, number> = stats?.typeBreakdown ?? {};
  const typeCounts = {
    TASK: tb.TASK ?? 0,
    STORY: tb.STORY ?? 0,
    BUG: tb.BUG ?? 0,
    EPIC: tb.EPIC ?? 0,
  };

  const totalIssues = stats?.totalTasks ?? issues.length;

  // Get favorite projects
  const favoriteProjects = projects.filter(p => p.isFavorite).slice(0, 3);

  // Recent activity (last 5 updated issues)
  const recentActivity = issues
    .sort((a: Record<string, any>, b: Record<string, any>) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Handlers for drill-down
  const handleShowCompletedTasks = () => {
    const completed = issues.filter((i: any) => i.status === 'DONE');
    setFilteredTasks(completed);
    setFilterTitle(`${t('dashboard.completed')} • ${completed.length}`);
    setIsFilterModalOpen(true);
  };

  const handleShowUpdatedTasks = () => {
    const inProgress = issues.filter(
      (i: any) => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW'
    );
    setFilteredTasks(inProgress);
    setFilterTitle(`${t('status.inProgress')} • ${inProgress.length}`);
    setIsFilterModalOpen(true);
  };

  const handleShowCreatedTasks = () => {
    const todo = issues.filter(
      (i: any) => i.status === 'TODO' || i.status === 'BACKLOG'
    );
    setFilteredTasks(todo);
    setFilterTitle(`${t('status.todo')} • ${todo.length}`);
    setIsFilterModalOpen(true);
  };

  const handleShowDueSoonTasks = () => {
    const overdue = issues.filter(
      (i: any) => i.dueDate &&
      new Date(i.dueDate) < new Date() &&
      i.status !== 'DONE'
    );
    setFilteredTasks(overdue);
    setFilterTitle(`${t('dashboard.dueSoon')} • ${overdue.length}`);
    setIsFilterModalOpen(true);
  };

  const apiError = statsError || issuesError;

  return (
    <AppLayout>
      <div className="p-3 md:p-6">
        {/* Legacy orgs with no type chose no industry edition (D9) */}
        <div className="mb-4 empty:mb-0">
          <ChooseOrgTypeBanner />
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {t('dashboard.failedToLoad')}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {apiError.message}. {t('dashboard.tryRefreshing')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Project Filter */}
        {projects.length > 1 && (
          <div className="mb-4 flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#1C8C7D] transition-colors"
              >
                <Filter className="h-3.5 w-3.5 text-white/70" />
                {selectedProject ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded shrink-0"
                      style={{ backgroundColor: selectedProject.color || '#3B82F6' }}
                    />
                    {selectedProject.name}
                  </span>
                ) : (
                  <span>{t('nav.allProjects')}</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-white/70" />
              </button>

              {isProjectDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProjectDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1 z-40 w-72 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] shadow-xl overflow-hidden">
                    <button
                      onClick={() => setProjectFilter(null)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#181D23] transition-colors ${
                        !selectedProjectId ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Folder className="h-4 w-4 text-white/70" />
                      {t('nav.allProjects')}
                    </button>
                    <div className="border-t border-slate-100" />
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setProjectFilter(project.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#181D23] transition-colors ${
                          selectedProjectId === project.id ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        >
                          {project.key?.slice(0, 2)}
                        </span>
                        <span className="truncate">{project.name}</span>
                        <span className="ml-auto text-xs text-white/70">{project.key}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {selectedProject && (
              <button
                onClick={() => setProjectFilter(null)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-[#1C8C7D] transition-colors"
              >
                <X className="h-3 w-3" />
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Stats Cards - Beautiful 2x2 grid on mobile */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={tasksCompleted.toString()}
            label={t('dashboard.completed')}
            sublabel={t('dashboard.totalItems')}
            color="text-green-500 dark:text-green-400"
            onClick={handleShowCompletedTasks}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value={tasksInProgress.toString()}
            label={t('status.inProgress')}
            sublabel={t('dashboard.totalItems')}
            color="text-blue-500 dark:text-blue-400"
            onClick={handleShowUpdatedTasks}
          />
          <StatCard
            icon={<Plus className="h-5 w-5" />}
            value={tasksTodo.toString()}
            label={t('status.todo')}
            sublabel={t('dashboard.totalItems')}
            color="text-primary-500 dark:text-primary-400"
            onClick={handleShowCreatedTasks}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value={tasksOverdue.toString()}
            label={t('dashboard.dueSoon')}
            sublabel={t('dashboard.totalItems')}
            color="text-orange-500 dark:text-orange-400"
            onClick={handleShowDueSoonTasks}
          />
        </div>

        {/*
          The two status overviews run the full page width. Each is a donut
          card plus a companion panel side by side; inside a two-thirds column
          they were a third of the page each, which squeezed the legend until
          every status label truncated to its first letter.
        */}
        <div className="space-y-6">
          <TaskStatusOverview projectId={selectedProjectId} />
          <ProjectStatusOverview />
          {/* Effort, below the two status pictures: what the work cost comes
              after what state the work is in. */}
          <ProductivityInsight projectId={selectedProjectId} />
        </div>

        {/*
          Supporting cards share one row, so their top edges line up and every
          gutter is the same 24px as the rows above. With no starred projects
          the activity card takes the free column instead of leaving a hole.
        */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activity - AI-Powered Timeline */}
          <div
            className={
              CARD_SURFACE + ' p-6 ' +
              (favoriteProjects.length > 0 ? '' : 'lg:col-span-2')
            }
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={CARD_TITLE}>{t('dashboard.recentActivity')}</h2>
              <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#1C8C7D]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('dashboard.aiPowered')}</span>
              </div>
            </div>
            <p className={CARD_SUBTITLE + ' mb-4'}>
              {t('dashboard.recentActivityDescription')}
            </p>
            <div className="max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              <ActivityTimeline limit={10} showFilters={true} projectId={selectedProjectId || undefined} />
            </div>
          </div>

          {/* Types of Work */}
          <div className={CARD_SURFACE + ' p-6'}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={CARD_TITLE}>{t('dashboard.typesOfWork')}</h2>
              <a href="/dashboard/issues" className="shrink-0 text-sm text-[#1C8C7D] hover:underline">
                {t('dashboard.viewAllItems')}
              </a>
            </div>
            <p className={CARD_SUBTITLE + ' mb-4'}>{t('dashboard.typesOfWorkDescription')}</p>
            <div className="space-y-2">
              {totalIssues > 0 ? (
                <>
                  <TypeBar label="Task" percentage={(typeCounts.TASK / totalIssues) * 100} color="bg-blue-500" />
                  <TypeBar label="Story" percentage={(typeCounts.STORY / totalIssues) * 100} color="bg-green-500" />
                  <TypeBar label="Bug" percentage={(typeCounts.BUG / totalIssues) * 100} color="bg-red-500" />
                  <TypeBar label="Epic" percentage={(typeCounts.EPIC / totalIssues) * 100} color="bg-purple-500" />
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-white/70">{t('common.noData')}</p>
              )}
            </div>
          </div>

          {/* Favorite Projects */}
          {favoriteProjects.length > 0 && (
            <div className={CARD_SURFACE + ' p-6'}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className={CARD_TITLE}>{t('nav.starred')}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/projects')}
                >
                  {t('common.viewAll')}
                </Button>
              </div>
              <div className="space-y-2">
                {favoriteProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/dashboard/projects/${project.key}`)}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-[#181D23] cursor-pointer"
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
                      <p className="text-xs text-slate-500 dark:text-white/70">
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

      {/* Status Drill-Down Slideout */}
      <SlideoutPanel
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title={filterTitle}
        size="lg"
      >
        <SlideoutPanelContent>
          {/* AI-Powered Analytics Bar */}
          {filteredTasks.length > 0 && (() => {
            const withAssignee = filteredTasks.filter((i: any) => i.assignee).length;
            const unassigned = filteredTasks.length - withAssignee;
            const overdue = filteredTasks.filter((i: any) => i.dueDate && new Date(i.dueDate) < new Date()).length;
            const highPriority = filteredTasks.filter((i: any) => i.priority === 'HIGHEST' || i.priority === 'HIGH').length;
            const now = new Date().getTime();
            const ages = filteredTasks.map((i: any) => {
              const updated = new Date(i.updatedAt).getTime();
              return (now - updated) / (1000 * 60 * 60 * 24);
            });
            const avgAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length) : 0;

            return (
              <div className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200/60 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">AI Insights</span>
                  </div>
                  {overdue > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-slate-600 dark:text-white/70">
                        <span className="font-semibold text-red-600 dark:text-red-400">{overdue}</span> overdue
                      </span>
                    </div>
                  )}
                  {unassigned > 0 && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-slate-600 dark:text-white/70">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{unassigned}</span> unassigned
                      </span>
                    </div>
                  )}
                  {highPriority > 0 && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="text-slate-600 dark:text-white/70">
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{highPriority}</span> high priority
                      </span>
                    </div>
                  )}
                  {avgAge > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-slate-600 dark:text-white/70">
                        avg <span className="font-semibold text-blue-600 dark:text-blue-400">{avgAge}d</span> old
                      </span>
                    </div>
                  )}
                  {withAssignee > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-slate-600 dark:text-white/70">
                        <span className="font-semibold text-green-600 dark:text-green-400">{withAssignee}</span> assigned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Task List */}
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
                  className="p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/50 hover:shadow-md hover:border-[#1C8C7D]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-white/30 dark:text-white/70">
                          {task.key}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-white/30 dark:text-white/70">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{task.assignee?.name || t('common.unassigned')}</span>
                        </div>
                        {task.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Updated {new Date(task.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
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
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/[0.08]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-600 dark:text-white/70">{t('dashboard.noTasks')}</p>
            </div>
          )}
        </SlideoutPanelContent>
      </SlideoutPanel>
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
  icon: ReactNode;
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
      className="group relative rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] p-3 md:p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left w-full overflow-hidden border border-slate-200/50 hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D]"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C8C7D]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* 3D depth effect - bottom shadow layer */}
      <div className="absolute -bottom-1 -right-1 w-full h-full bg-gradient-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl -z-10 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300"></div>

      <div className="relative z-10">
        <div className="mb-2 md:mb-4 flex items-center justify-between">
          <div className={`${color} p-2 md:p-2.5 rounded-lg bg-slate-100 dark:bg-[#181D23]/50 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="text-[10px] md:text-xs text-[#1C8C7D] dark:text-[#1C8C7D] font-semibold hidden sm:flex items-center gap-1 group-hover:gap-2 transition-all">
            <span>{t('dashboard.details')}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </div>
        <div className="text-2xl md:text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{value}</div>
        <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{label}</div>
        <div className="text-[10px] md:text-xs text-white/30 dark:text-white/70 hidden sm:block mt-1">{sublabel}</div>
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
        <div className="w-32 h-2 bg-slate-100 dark:bg-[#181D23] rounded-full overflow-hidden">
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
      className="text-sm cursor-pointer p-2 -m-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#181D23]/50 transition-colors duration-150"
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
        <span className="text-xs text-white/30 dark:text-white/70">{time}</span>
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
