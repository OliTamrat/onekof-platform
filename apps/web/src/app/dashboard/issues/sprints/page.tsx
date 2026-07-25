'use client';

/**
 * Sprints View (Phase 3 of the Sprint & Settings architecture)
 *
 * The Sprint tab's home: pick a project, see its active sprint (goal,
 * dates, days remaining, progress against the commitment snapshot, its
 * issues), complete it with a rollover decision, and read the historical
 * report — committed vs completed per sprint plus velocity — computed
 * from the write-once snapshots, never rebuilt from task history.
 */

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, ListTodo, CheckCircle2, Flag, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';
import { useOrganizationSettings } from '@/contexts/organization-settings-context';
import { useWorkspace } from '@/contexts/workspace-context';
import { useTerminology } from '@/hooks/use-terminology';
import {
  Sprint,
  useProjectSettings,
  useSprints,
  useEnableSprints,
} from '@/components/sprints/use-sprints';
import { CompleteSprintDialog } from '@/components/sprints/sprint-modal';
import {
  aggregateSprintInsights,
  sprintDurationDays,
} from '@/components/sprints/insights';

interface Issue {
  id: string;
  key: string;
  title: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: string | null;
  sprintId?: string | null;
  sprintOrder?: number | null;
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color?: string };
}

const STATUS_CHIP: Record<string, string> = {
  DONE: 'bg-primary-500/15 text-primary-600 dark:text-[#2BB5A2]',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  IN_REVIEW: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  BLOCKED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  TODO: 'bg-gray-200 text-gray-600 dark:bg-white/[0.08] dark:text-white/70',
  BACKLOG: 'bg-gray-200 text-gray-500 dark:bg-white/[0.08] dark:text-white/50',
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  BACKLOG: 'status.backlog',
  TODO: 'status.todo',
  IN_PROGRESS: 'status.inProgress',
  IN_REVIEW: 'status.inReview',
  DONE: 'status.done',
  BLOCKED: 'status.blocked',
};

/**
 * Expanded insight panel for one completed sprint (Tier 1 of the reporting
 * architecture): completion bullet bar against the commitment snapshot,
 * duration, goal, and the per-assignee contribution table. Data = the
 * sprint's surviving issues (rollover removed unfinished work at completion).
 */
function CompletedSprintInsight({
  sprint,
  estimationUnit,
  formatEstimate,
  onIssueClick,
}: {
  sprint: Sprint;
  estimationUnit: 'HOURS' | 'POINTS';
  formatEstimate: (n: number | null) => string;
  onIssueClick?: (issueId: string) => void;
}) {
  const { t } = useLanguage();
  const { sprintNoun } = useTerminology();
  const { settings: orgSettings } = useOrganizationSettings();
  const budgetCurrency = orgSettings.customization?.budgetCurrency || 'ETB';

  const { data } = useQuery({
    queryKey: ['issues', 'sprint-insight', sprint.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('sprintId', sprint.id);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sprint issues');
      return res.json();
    },
  });

  // Scope churn (Tier 2a): adds/removes after start, from the activity trail
  const { data: churnData } = useQuery({
    queryKey: ['sprint-churn', sprint.id],
    queryFn: async () => {
      const res = await fetch(`/api/sprints/${sprint.id}/churn`);
      if (!res.ok) throw new Error('Failed to fetch churn');
      return res.json() as Promise<{
        added: number;
        removed: number;
        issues: { id: string; key: string; title: string; direction: string }[];
      }>;
    },
  });

  const insights = useMemo(
    () => aggregateSprintInsights((data?.issues || []) as any[], estimationUnit),
    [data, estimationUnit]
  );

  const duration = sprintDurationDays(sprint.startDate, sprint.endDate);
  const committed = sprint.committedCount ?? 0;
  const done = sprint.completedCount ?? 0;
  const pct = committed > 0 ? Math.min(100, (done / committed) * 100) : 0;

  return (
    <div className="space-y-4 border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-[#181D23]/40 px-4 py-4">
      {/* Export the branded ministry report (Tier 2c) */}
      <div className="flex justify-end">
        <a
          href={`/api/sprints/${sprint.id}/report.pdf`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-primary-500 hover:text-primary-600 dark:border-white/[0.08] dark:text-white/60 dark:hover:text-[#2BB5A2]"
        >
          <Download className="h-3.5 w-3.5" />
          {t('sprints.exportPdf')}
        </a>
      </div>

      {/* Goal + duration */}
      {(sprint.goal || duration != null) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-white/70">
          {sprint.goal && (
            <span className="flex items-start gap-2">
              <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              {sprint.goal}
            </span>
          )}
          {duration != null && (
            <span className="ml-auto shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/[0.08] dark:text-white/60">
              {t('sprints.insightsDuration', { count: duration, noun: sprintNoun })}
            </span>
          )}
        </div>
      )}

      {/* Completion bullet: committed = track, completed = fill, numbers labeled */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-700 dark:text-white/85">
            {t('sprints.completionOf', { done, committed })}
          </span>
          <span className="text-gray-500 dark:text-white/50">
            {formatEstimate(sprint.completedEstimate)} / {formatEstimate(sprint.committedEstimate)}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full border border-gray-300 dark:border-white/[0.15]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Budget snapshots (Tier 2b): written once at completion, org currency */}
      {(sprint.budgetPlanned != null || sprint.budgetInvested != null) && (
        <p className="text-xs text-gray-600 dark:text-white/70">
          {t('sprints.budgetLine', {
            currency: budgetCurrency,
            planned: sprint.budgetPlanned != null ? sprint.budgetPlanned.toLocaleString() : '—',
            invested: sprint.budgetInvested != null ? sprint.budgetInvested.toLocaleString() : '—',
          })}
        </p>
      )}

      {/* Scope churn (Tier 2a): explicit even at zero — auditors read zeros */}
      {churnData && (
        <div className="text-xs">
          {churnData.added + churnData.removed === 0 ? (
            <p className="text-gray-400 dark:text-white/30">
              {t('sprints.noScopeChanges')}
            </p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-gray-600 dark:text-white/70">
                <span className="font-medium text-gray-700 dark:text-white/85">
                  {t('sprints.scopeChanges')}:
                </span>{' '}
                {t('sprints.scopeSummary', {
                  added: churnData.added,
                  removed: churnData.removed,
                })}
              </p>
              {churnData.issues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {churnData.issues.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => onIssueClick?.(i.id)}
                      className="rounded-full border border-gray-200 px-2 py-0.5 font-mono text-[10px] text-gray-600 hover:border-primary-500 hover:text-primary-600 dark:border-white/[0.08] dark:text-white/60 dark:hover:text-[#2BB5A2]"
                      title={i.title}
                    >
                      {i.direction === 'in' ? '+' : i.direction === 'out' ? '−' : '±'} {i.key}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contribution table */}
      {insights.contributions.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">
            {t('sprints.contributions')}
          </h4>
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-white/[0.08] dark:bg-[#181D23]">
                  <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('sprints.contributor')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('sprints.issuesDone')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('sprints.timeSpentLabel')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('sprints.estimatedLabel')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {insights.contributions.map((c) => (
                  <tr key={c.id ?? 'unassigned'}>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="h-5 w-5 rounded-full" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[9px] font-semibold text-white">
                            {(c.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {c.name || t('sprints.unassigned')}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">
                      {c.done}/{c.issues}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-white/70">
                      {t('sprints.estimateHours', { count: c.timeSpent })}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-600 dark:text-white/70">
                      {formatEstimate(c.estimated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SprintsPage() {
  const { t } = useLanguage();
  const { sprintNoun, sprintNounPlural } = useTerminology();
  const toast = useToast();
  const { projects } = useWorkspace();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [completeDialogSprint, setCompleteDialogSprint] = useState<Sprint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());
  const [insightIssueId, setInsightIssueId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [scopedProjectId, setScopedProjectId] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('projectId')
      : null
  );

  const changeProjectScope = (projectId: string | null) => {
    setScopedProjectId(projectId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (projectId) url.searchParams.set('projectId', projectId);
      else url.searchParams.delete('projectId');
      window.history.replaceState(null, '', url.toString());
    }
  };

  const { data: settingsData } = useProjectSettings(scopedProjectId);
  const sprintsEnabled = !!scopedProjectId && !!settingsData?.effective?.sprintsEnabled;
  const sprintsDisabledForProject = !!scopedProjectId && !!settingsData && !settingsData.effective?.sprintsEnabled;
  const estimationUnit = settingsData?.effective?.estimationUnit ?? 'HOURS';
  const { data: sprintsData, isLoading: sprintsLoading } = useSprints(scopedProjectId, sprintsEnabled);
  const enableSprintsMutation = useEnableSprints(scopedProjectId);

  const sprints = sprintsData?.sprints || [];
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE') || null;
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED');
  const completedSprints = useMemo(
    () =>
      sprints
        .filter((s) => s.status === 'COMPLETED')
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')),
    [sprints]
  );

  // Issues of the active sprint (any status)
  const { data: sprintIssuesData } = useQuery({
    queryKey: ['issues', 'sprint-view', activeSprint?.id],
    enabled: !!activeSprint,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('sprintId', activeSprint!.id);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sprint issues');
      return res.json();
    },
  });

  const sprintIssues: Issue[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ((sprintIssuesData?.issues || []) as Issue[])
      .filter(
        (i) =>
          !query ||
          i.title.toLowerCase().includes(query) ||
          i.key.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const aOrder = a.sprintOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.sprintOrder ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      });
  }, [sprintIssuesData, searchQuery]);

  const doneCount = sprintIssues.filter((i) => i.status === 'DONE').length;

  const handleEnableSprints = async () => {
    try {
      await enableSprintsMutation.mutateAsync();
      toast.success(t('sprints.enabledToast', { noun: sprintNoun }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sprints.actionFailed'));
    }
  };

  const daysInfo = (sprint: Sprint) => {
    if (!sprint.endDate) return null;
    const days = Math.ceil(
      (new Date(sprint.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    return days >= 0
      ? t('sprints.daysLeft', { count: days })
      : t('sprints.endedDaysAgo', { count: Math.abs(days) });
  };

  const formatDateRange = (sprint: Sprint) => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!sprint.startDate && !sprint.endDate) return null;
    return `${sprint.startDate ? fmt(sprint.startDate) : '—'} → ${sprint.endDate ? fmt(sprint.endDate) : '—'}`;
  };

  const formatEstimate = (n: number | null) =>
    n == null
      ? '—'
      : estimationUnit === 'POINTS'
        ? t('sprints.estimatePoints', { count: n })
        : t('sprints.estimateHours', { count: n });

  // Velocity: average completed count over the last 3 completed sprints
  const velocity = useMemo(() => {
    const recent = completedSprints.slice(0, 3);
    if (recent.length === 0) return null;
    const sum = recent.reduce((acc, s) => acc + (s.completedCount ?? 0), 0);
    return Math.round((sum / recent.length) * 10) / 10;
  }, [completedSprints]);

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('departmentTabs.sprints')}
        icon={<Zap className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="sprints"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 md:px-6 py-3">
          <select
            value={scopedProjectId ?? ''}
            onChange={(e) => changeProjectScope(e.target.value || null)}
            className="h-9 w-full sm:w-[220px] min-w-0 shrink rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#181D23] px-3 text-sm leading-none text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
            title={t('sprints.selectProject', { nounPlural: sprintNounPlural })}
          >
            <option value="">{t('sprints.selectProject', { nounPlural: sprintNounPlural })}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Enable affordance for scoped projects with sprints off */}
        {sprintsDisabledForProject && (
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-white/[0.08] bg-primary-500/5 px-3 md:px-6 py-2.5">
            <Zap className="h-4 w-4 shrink-0 text-primary-500" />
            <span className="text-sm text-gray-700 dark:text-white/70">
              {t('sprints.enableHint', { noun: sprintNoun })}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnableSprints}
              disabled={enableSprintsMutation.isPending}
              className="h-7"
            >
              {t('sprints.enable', { noun: sprintNoun })}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {!scopedProjectId ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={Zap}
                title={t('sprints.selectProject', { nounPlural: sprintNounPlural })}
                description={t('sprints.planHint', { nounPlural: sprintNounPlural })}
              />
            </div>
          ) : sprintsEnabled && sprintsLoading ? (
            <div className="space-y-3 max-w-4xl">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="max-w-4xl space-y-6">
              {/* Active sprint panel */}
              {sprintsEnabled && (
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
                  <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/[0.08] px-4 py-3">
                    <Zap className="h-4 w-4 text-primary-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {activeSprint
                        ? activeSprint.name
                        : t('sprints.noActiveSprint', { noun: sprintNoun })}
                    </span>
                    {activeSprint && (
                      <>
                        <span className="hidden sm:inline text-xs text-gray-500 dark:text-white/50">
                          {formatDateRange(activeSprint)}
                        </span>
                        {daysInfo(activeSprint) && (
                          <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:text-[#2BB5A2]">
                            {daysInfo(activeSprint)}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCompleteDialogSprint(activeSprint)}
                          className="ml-auto h-7"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-primary-500" />
                          {t('sprints.complete', { noun: sprintNoun })}
                        </Button>
                      </>
                    )}
                  </div>

                  {activeSprint ? (
                    <div className="p-4">
                      {activeSprint.goal && (
                        <p className="mb-3 flex items-start gap-2 text-sm text-gray-600 dark:text-white/70">
                          <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                          {activeSprint.goal}
                        </p>
                      )}

                      {/* Progress vs commitment snapshot */}
                      <div className="mb-4">
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-white/50">
                          <span>
                            {t('sprints.progressLabel', {
                              done: doneCount,
                              committed: activeSprint.committedCount ?? sprintIssues.length,
                            })}
                          </span>
                          <span>{formatEstimate(activeSprint.committedEstimate)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all"
                            style={{
                              width: `${
                                activeSprint.committedCount
                                  ? Math.min(100, (doneCount / activeSprint.committedCount) * 100)
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Sprint issues */}
                      <div className="space-y-2">
                        {sprintIssues.map((issue) => (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => setSelectedIssue(issue)}
                            className="flex w-full items-center gap-3 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#181D23] p-2.5 text-left transition-colors hover:border-primary-500"
                          >
                            <span className="text-xs font-mono text-gray-500 dark:text-white/70 shrink-0">
                              {issue.key}
                            </span>
                            <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">
                              {issue.title}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CHIP[issue.status]}`}
                            >
                              {t(STATUS_LABEL_KEYS[issue.status]) || issue.status}
                            </span>
                          </button>
                        ))}
                        {sprintIssues.length === 0 && (
                          /* This page has no drag targets — planning happens
                             on the Backlog tab, so point there */
                          <p className="py-3 text-center text-xs text-gray-400 dark:text-white/30">
                            {t('sprints.planHint', { nounPlural: sprintNounPlural })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm text-gray-500 dark:text-white/50">
                        {t('sprints.planHint', { nounPlural: sprintNounPlural })}
                      </p>
                      {plannedSprints.length > 0 && (
                        <p className="mt-2 text-xs text-gray-400 dark:text-white/30">
                          {plannedSprints.map((s) => s.name).join(' · ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Report: completed sprints from write-once snapshots */}
              {sprintsEnabled && completedSprints.length > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
                  <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/[0.08] px-4 py-3">
                    <ListTodo className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('sprints.reportTitle', { nounPlural: sprintNounPlural })}
                    </span>
                    {velocity != null && (
                      <span className="ml-auto text-xs text-gray-500 dark:text-white/50">
                        {t('sprints.velocityLabel', { count: velocity, noun: sprintNoun })}
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {completedSprints.map((s) => {
                      const expanded = expandedSprints.has(s.id);
                      return (
                        <div key={s.id}>
                          <button
                            type="button"
                            onClick={() => toggleExpanded(s.id)}
                            className="flex w-full flex-wrap items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">{s.name}</span>
                            <span className="hidden sm:inline text-xs text-gray-400 dark:text-white/30">
                              {formatDateRange(s)}
                            </span>
                            <span className="ml-auto flex items-center gap-3 text-xs">
                              <span className="text-gray-500 dark:text-white/50">
                                {t('sprints.committedShort')}: {s.committedCount ?? '—'} ({formatEstimate(s.committedEstimate)})
                              </span>
                              <span className="font-medium text-primary-600 dark:text-[#2BB5A2]">
                                {t('sprints.completedShort')}: {s.completedCount ?? '—'} ({formatEstimate(s.completedEstimate)})
                              </span>
                            </span>
                          </button>
                          {expanded && (
                            <CompletedSprintInsight
                              sprint={s}
                              estimationUnit={estimationUnit}
                              formatEstimate={formatEstimate}
                              onIssueClick={setInsightIssueId}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailSlideout
          issue={selectedIssue as any}
          onClose={() => setSelectedIssue(null)}
        />
      )}
      {insightIssueId && (
        <IssueDetailSlideout
          issueId={insightIssueId}
          onClose={() => setInsightIssueId(null)}
        />
      )}
      {completeDialogSprint && scopedProjectId && (
        <CompleteSprintDialog
          projectId={scopedProjectId}
          sprint={completeDialogSprint}
          otherSprints={plannedSprints}
          onClose={() => setCompleteDialogSprint(null)}
        />
      )}
    </AppLayout>
  );
}
