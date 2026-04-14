'use client';

/**
 * Backlog View
 *
 * Real backlog page showing tasks with status = BACKLOG, ordered by
 * backlogOrder (drag to reorder). Bulk-move selected tasks to TODO to
 * schedule them for work.
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
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
  LOWEST: 'text-gray-500 dark:text-gray-400',
};

export default function BacklogPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Read project scope from URL
  const scopedProjectId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('projectId')
    : null;

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

  // Sort tasks by backlogOrder (NULL goes last), then by createdAt descending
  const backlogTasks: Issue[] = useMemo(() => {
    const tasks = (issuesData?.issues || []) as Issue[];
    return [...tasks].sort((a, b) => {
      const aOrder = a.backlogOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.backlogOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [issuesData]);

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
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    // Compute new order: use the destination index * 1000 as the new order.
    // Multiplying by 1000 gives us room to insert without re-numbering everything.
    const reordered = Array.from(backlogTasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Assign new backlogOrder values
    const newOrder = result.destination.index * 1000;
    reorderMutation.mutate({ issueId: moved.id, newOrder });
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
        showFilters
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
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

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="h-8 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t('common.create')}
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {isLoading ? (
            <div className="space-y-3 max-w-4xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : backlogTasks.length === 0 ? (
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
              <Droppable droppableId="backlog-list">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 max-w-4xl"
                  >
                    {backlogTasks.map((issue, index) => (
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

                            {/* Checkbox */}
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

                            {/* Project badge */}
                            <span
                              className="h-5 shrink-0 rounded px-1.5 text-[10px] font-bold text-white flex items-center"
                              style={{ backgroundColor: issue.project?.color || '#3B82F6' }}
                            >
                              {issue.project?.key?.slice(0, 3)}
                            </span>

                            {/* Key */}
                            <span className="text-xs font-mono text-gray-500 dark:text-white/50 shrink-0">
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
                              <span className="shrink-0 flex items-center gap-1 text-xs text-gray-500 dark:text-white/50">
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
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
    </AppLayout>
  );
}
