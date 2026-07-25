'use client';

/**
 * Backlog View
 *
 * Backlog page showing tasks with status = BACKLOG, ordered by backlogOrder
 * (drag to reorder). Bulk-move selected tasks to TODO to schedule them.
 *
 * Sprint planning (Phase 2 of the Sprint & Settings architecture): when the
 * page is scoped to a project whose effective settings enable sprints, the
 * project's PLANNED/ACTIVE sprints render as droppable sections above the
 * backlog — drag issues between sprint and backlog to plan. Terminology
 * ("Sprint" vs "Work Cycle") follows the org's terminologyScheme.
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  ListTodo,
  Plus,
  ArrowRight,
  CheckSquare,
  Square,
  Calendar,
  User,
  Flag,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Play,
  Pencil,
  Trash2,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';
import { useWorkspace } from '@/contexts/workspace-context';
import { useTerminology } from '@/hooks/use-terminology';
import {
  Sprint,
  useProjectSettings,
  useSprints,
  useMoveIssueToSprint,
  useEnableSprints,
} from '@/components/sprints/use-sprints';
import {
  SprintModal,
  StartSprintDialog,
  DeleteSprintDialog,
} from '@/components/sprints/sprint-modal';

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST' | null;
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color?: string };
  dueDate?: string;
  backlogOrder?: number | null;
  sprintId?: string | null;
  sprintOrder?: number | null;
  estimate?: number | null;
  storyPoints?: number | null;
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
  LOWEST: 'text-gray-500 dark:text-gray-400',
};

const SPRINT_STATUS_CHIP: Record<Sprint['status'], string> = {
  ACTIVE: 'bg-primary-500/15 text-primary-600 dark:text-[#2BB5A2]',
  PLANNED: 'bg-gray-200 text-gray-600 dark:bg-white/[0.08] dark:text-white/70',
  COMPLETED: 'bg-gray-200 text-gray-500 dark:bg-white/[0.08] dark:text-white/50',
};

export default function BacklogPage() {
  const { t } = useLanguage();
  const { sprintNoun, sprintNounPlural } = useTerminology();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { projects } = useWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sprintModal, setSprintModal] = useState<{ sprint: Sprint | null } | null>(null);
  const [startDialogSprint, setStartDialogSprint] = useState<Sprint | null>(null);
  const [deleteDialogSprint, setDeleteDialogSprint] = useState<Sprint | null>(null);
  const [collapsedSprints, setCollapsedSprints] = useState<Set<string>>(new Set());

  // Project scope: initialized from the URL, changeable via the picker.
  // Kept in the URL so links/refreshes preserve the scope.
  const [scopedProjectId, setScopedProjectId] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('projectId')
      : null
  );

  const changeProjectScope = (projectId: string | null) => {
    setScopedProjectId(projectId);
    setSelectedIds(new Set());
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (projectId) url.searchParams.set('projectId', projectId);
      else url.searchParams.delete('projectId');
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Sprint planning is project-scoped: resolve effective settings (org
  // defaults ← project overrides) and only then load sprints.
  const { data: settingsData } = useProjectSettings(scopedProjectId);
  const sprintsEnabled = !!scopedProjectId && !!settingsData?.effective?.sprintsEnabled;
  const sprintsDisabledForProject = !!scopedProjectId && !!settingsData && !settingsData.effective?.sprintsEnabled;
  const estimationUnit = settingsData?.effective?.estimationUnit ?? 'HOURS';
  const { data: sprintsData } = useSprints(scopedProjectId, sprintsEnabled);
  const moveMutation = useMoveIssueToSprint();
  const enableSprintsMutation = useEnableSprints(scopedProjectId);

  const handleEnableSprints = async () => {
    try {
      await enableSprintsMutation.mutateAsync();
      toast.success(t('sprints.enabledToast', { noun: sprintNoun }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sprints.actionFailed'));
    }
  };

  const planningSprints: Sprint[] = useMemo(
    () => (sprintsData?.sprints || []).filter((s) => s.status !== 'COMPLETED'),
    [sprintsData]
  );

  // Fetch backlog tasks
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', 'backlog', scopedProjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', 'BACKLOG');
      if (scopedProjectId) params.append('projectId', scopedProjectId);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch backlog');
      return res.json();
    },
  });

  // Fetch issues already planned into sprints (any status)
  const { data: sprintedData } = useQuery({
    queryKey: ['issues', 'sprinted', scopedProjectId],
    enabled: sprintsEnabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('projectId', scopedProjectId as string);
      params.append('sprintId', 'any');
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch sprint issues');
      return res.json();
    },
  });

  const matchesSearch = (issue: Issue, query: string) =>
    !query ||
    issue.title.toLowerCase().includes(query) ||
    issue.key.toLowerCase().includes(query);

  // Backlog = BACKLOG status AND not planned into a sprint
  const backlogTasks: Issue[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const tasks = ((issuesData?.issues || []) as Issue[]).filter(
      (i) => !i.sprintId && matchesSearch(i, query)
    );
    return [...tasks].sort((a, b) => {
      const aOrder = a.backlogOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.backlogOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [issuesData, searchQuery]);

  const issuesBySprint: Map<string, Issue[]> = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const map = new Map<string, Issue[]>();
    for (const issue of (sprintedData?.issues || []) as Issue[]) {
      if (!issue.sprintId || !matchesSearch(issue, query)) continue;
      const list = map.get(issue.sprintId) || [];
      list.push(issue);
      map.set(issue.sprintId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const aOrder = a.sprintOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.sprintOrder ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return map;
  }, [sprintedData, searchQuery]);

  // Reorder mutation — writes new backlogOrder values
  const reorderMutation = useMutation({
    mutationFn: async ({ issueId, newOrder }: { issueId: string; newOrder: number }) => {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backlogOrder: newOrder }),
      });
      if (!res.ok) throw new Error('Failed to reorder');
      return res.json();
    },
    onMutate: async ({ issueId, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['issues', 'backlog'] });
      const prev = queryClient.getQueriesData({ queryKey: ['issues', 'backlog'] });
      queryClient.setQueriesData({ queryKey: ['issues', 'backlog'] }, (old: any) => {
        if (!old?.issues) return old;
        return {
          ...old,
          issues: old.issues.map((i: Issue) =>
            i.id === issueId ? { ...i, backlogOrder: newOrder } : i
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Failed to reorder backlog');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Bulk move to TODO mutation
  const moveToTodoMutation = useMutation({
    mutationFn: async (issueIds: string[]) => {
      const results = await Promise.all(
        issueIds.map((id) =>
          fetch(`/api/issues/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'TODO' }),
          })
        )
      );
      if (results.some((r) => !r.ok)) throw new Error('Some updates failed');
      return results;
    },
    onSuccess: (_res, issueIds) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success(`${issueIds.length} task${issueIds.length > 1 ? 's' : ''} moved to To Do`);
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error('Failed to move tasks');
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const toSprintId = destination.droppableId.startsWith('sprint:')
      ? destination.droppableId.slice('sprint:'.length)
      : null;
    const fromSprintId = source.droppableId.startsWith('sprint:')
      ? source.droppableId.slice('sprint:'.length)
      : null;

    // Same-list reorder inside the backlog: keep the ×1000 gap scheme
    if (!toSprintId && !fromSprintId) {
      const newOrder = destination.index * 1000;
      reorderMutation.mutate({ issueId: draggableId, newOrder });
      return;
    }

    // Anything involving a sprint: single PATCH sets membership + position
    moveMutation.mutate(
      {
        issueId: draggableId,
        sprintId: toSprintId,
        sprintOrder: toSprintId ? destination.index * 1000 : null,
      },
      {
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : t('sprints.actionFailed')),
      }
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === backlogTasks.length && backlogTasks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(backlogTasks.map((t) => t.id)));
    }
  };

  const handleBulkMoveToTodo = () => {
    if (selectedIds.size === 0) return;
    moveToTodoMutation.mutate(Array.from(selectedIds));
  };

  const toggleSprintCollapsed = (id: string) => {
    setCollapsedSprints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sprintEstimateSum = (issues: Issue[]) =>
    issues.reduce(
      (sum, i) => sum + ((estimationUnit === 'POINTS' ? i.storyPoints : i.estimate) ?? 0),
      0
    );

  const formatDateRange = (sprint: Sprint) => {
    if (!sprint.startDate && !sprint.endDate) return null;
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${sprint.startDate ? fmt(sprint.startDate) : '—'} → ${sprint.endDate ? fmt(sprint.endDate) : '—'}`;
  };

  const renderIssueRow = (issue: Issue, index: number, showCheckbox: boolean) => (
    <Draggable key={issue.id} draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group flex items-center gap-3 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-3 transition-all ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : 'hover:border-primary-500'
          }`}
        >
          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Checkbox — backlog section only (bulk move to TODO) */}
          {showCheckbox && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSelection(issue.id);
              }}
              className="shrink-0"
              title="Select"
            >
              {selectedIds.has(issue.id) ? (
                <CheckSquare className="h-4 w-4 text-primary-500" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}

          {/* Project badge */}
          <span
            className="h-5 shrink-0 rounded px-1.5 text-[10px] font-bold text-white flex items-center"
            style={{ backgroundColor: issue.project?.color || '#3B82F6' }}
          >
            {issue.project?.key?.slice(0, 3)}
          </span>

          {/* Key */}
          <span className="text-xs font-mono text-gray-500 dark:text-white/70 shrink-0">
            {issue.key}
          </span>

          {/* Title — clickable */}
          <button
            type="button"
            onClick={() => setSelectedIssue(issue)}
            className="flex-1 text-left text-sm text-gray-900 dark:text-white hover:text-primary-500 truncate"
          >
            {issue.title}
          </button>

          {/* Priority */}
          {issue.priority && (
            <span className="shrink-0 flex items-center gap-1">
              <Flag className={`h-3.5 w-3.5 ${PRIORITY_COLORS[issue.priority] || 'text-gray-400'}`} />
            </span>
          )}

          {/* Due date */}
          {issue.dueDate && (
            <span className="shrink-0 flex items-center gap-1 text-xs text-gray-500 dark:text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}

          {/* Assignee */}
          {issue.assignee ? (
            issue.assignee.avatar ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name}
                className="h-6 w-6 shrink-0 rounded-full"
              />
            ) : (
              <div className="h-6 w-6 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-semibold">
                {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )
          ) : (
            <div className="h-6 w-6 shrink-0 rounded-full border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  const renderSprintSection = (sprint: Sprint) => {
    const issues = issuesBySprint.get(sprint.id) || [];
    const collapsed = collapsedSprints.has(sprint.id);
    const estimateSum = sprintEstimateSum(issues);
    const statusLabel =
      sprint.status === 'ACTIVE'
        ? t('sprints.active')
        : sprint.status === 'PLANNED'
          ? t('sprints.planned')
          : t('sprints.completed');

    return (
      <div key={sprint.id} className="mb-6">
        {/* Section header */}
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSprintCollapsed(sprint.id)}
            className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
            title={sprint.name}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <Zap className="h-4 w-4 text-primary-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{sprint.name}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SPRINT_STATUS_CHIP[sprint.status]}`}>
            {statusLabel}
          </span>
          {formatDateRange(sprint) && (
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-white/50">
              {formatDateRange(sprint)}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-white/50">
            {t('sprints.itemCount', { count: issues.length })}
            {estimateSum > 0 && (
              <>
                {' · '}
                {estimationUnit === 'POINTS'
                  ? t('sprints.estimatePoints', { count: estimateSum })
                  : t('sprints.estimateHours', { count: estimateSum })}
              </>
            )}
          </span>

          <div className="ml-auto flex items-center gap-1">
            {sprint.status === 'PLANNED' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStartDialogSprint(sprint)}
                className="h-7 px-2 text-primary-600 dark:text-[#2BB5A2] hover:bg-primary-500/10"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                {t('sprints.startNow')}
              </Button>
            )}
            <button
              type="button"
              onClick={() => setSprintModal({ sprint })}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
              title={t('sprints.edit', { noun: sprintNoun })}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {sprint.status === 'PLANNED' && (
              <button
                type="button"
                onClick={() => setDeleteDialogSprint(sprint)}
                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                title={t('common.delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Droppable issue list */}
        {!collapsed && (
          <Droppable droppableId={`sprint:${sprint.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 rounded-lg border-2 border-dashed p-2 transition-colors ${
                  snapshot.isDraggingOver
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-gray-200 dark:border-white/[0.08]'
                }`}
              >
                {issues.length === 0 && !snapshot.isDraggingOver && (
                  <p className="px-2 py-3 text-center text-xs text-gray-400 dark:text-white/30">
                    {t('sprints.emptySection', { noun: sprintNoun })}
                  </p>
                )}
                {issues.map((issue, index) => renderIssueRow(issue, index, false))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('nav.backlog') || 'Backlog'}
        icon={<ListTodo className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="backlog"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
            >
              {selectedIds.size > 0 && selectedIds.size === backlogTasks.length ? (
                <CheckSquare className="h-4 w-4 text-primary-500" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : `${backlogTasks.length} in backlog`}
            </button>

            {selectedIds.size > 0 && (
              <Button
                size="sm"
                onClick={handleBulkMoveToTodo}
                disabled={moveToTodoMutation.isPending}
                className="h-8 bg-primary-500 hover:bg-primary-600 text-white"
              >
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                Move to To Do
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Project scope picker — sprints are planned per project */}
            <select
              value={scopedProjectId ?? ''}
              onChange={(e) => changeProjectScope(e.target.value || null)}
              className="h-8 max-w-[160px] rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#181D23] px-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
              title={t('sprints.selectProject', { nounPlural: sprintNounPlural })}
            >
              <option value="">{t('sprints.allProjects')}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {sprintsEnabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSprintModal({ sprint: null })}
                className="h-8"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5 text-primary-500" />
                {t('sprints.newSprint', { noun: sprintNoun })}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="h-8 bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t('common.create')}
            </Button>
          </div>
        </div>

        {/* Sprints off for this project → one-tap enable (server enforces ADMIN) */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {isLoading ? (
            <div className="space-y-3 max-w-4xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : backlogTasks.length === 0 && planningSprints.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={ListTodo}
                title="Your backlog is empty"
                description="Move unprioritized work here to plan future sprints. Anything in the backlog stays out of active boards until you move it to To Do."
                actionLabel={t('common.create')}
                onAction={() => setShowCreateModal(true)}
              />
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="max-w-4xl">
                {/* Sprint sections (project-scoped, sprints enabled) */}
                {sprintsEnabled && planningSprints.map(renderSprintSection)}

                {/* Backlog section header — only needed once sprints exist */}
                {sprintsEnabled && planningSprints.length > 0 && (
                  <div className="mb-2 flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('sprints.backlogSection')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-white/50">
                      {t('sprints.itemCount', { count: backlogTasks.length })}
                    </span>
                  </div>
                )}

                <Droppable droppableId="backlog-list">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {backlogTasks.map((issue, index) => renderIssueRow(issue, index, true))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Create Issue Modal — defaults to BACKLOG status */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          defaultProjectId={scopedProjectId || undefined}
          defaultStatus="BACKLOG"
        />
      )}

      {/* Issue Detail Slideout */}
      {selectedIssue && (
        <IssueDetailSlideout
          issue={selectedIssue as any}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {/* Sprint dialogs */}
      {sprintModal && scopedProjectId && (
        <SprintModal
          projectId={scopedProjectId}
          sprint={sprintModal.sprint}
          onClose={() => setSprintModal(null)}
        />
      )}
      {startDialogSprint && scopedProjectId && (
        <StartSprintDialog
          projectId={scopedProjectId}
          sprint={startDialogSprint}
          onClose={() => setStartDialogSprint(null)}
        />
      )}
      {deleteDialogSprint && scopedProjectId && (
        <DeleteSprintDialog
          projectId={scopedProjectId}
          sprint={deleteDialogSprint}
          onClose={() => setDeleteDialogSprint(null)}
        />
      )}
    </AppLayout>
  );
}
