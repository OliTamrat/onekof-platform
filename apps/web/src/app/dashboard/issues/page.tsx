'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Calendar,
  CheckSquare,
  ListChecks,
  Plus
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { InsightsSlideout } from '@/components/insights/insights-slideout';
import { ISSUES_TABS } from '@/config/department-tabs';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import type { ProjectType } from '@/lib/project-navigation';
import { Button } from '@/components/ui/button';
import { SkeletonKanban } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { useWorkspace } from '@/contexts/workspace-context';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

// Types
interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color?: string;
  };
  parentId?: string;
  parent?: { id: string; key: string; title: string; type: string };
  commentCount: number;
  attachmentCount: number;
  subtaskCount?: number;
  labels?: string[];
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Status columns configuration
const STATUS_COLUMNS = [
  { id: 'BACKLOG', labelKey: 'status.backlog' },
  { id: 'TODO', labelKey: 'status.todo' },
  { id: 'IN_PROGRESS', labelKey: 'status.inProgress' },
  { id: 'IN_REVIEW', labelKey: 'status.inReview' },
  { id: 'DONE', labelKey: 'status.done' },
];

export default function IssuesPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('projectId');
    }
    return null;
  });
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('create') === 'issue';
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSubtasks, setHideSubtasks] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [creatingInColumn, setCreatingInColumn] = useState<string | null>(null);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const queryClient = useQueryClient();

  // Projects come from WorkspaceProvider context — already loaded app-wide,
  // no need for a separate query here. Teams/goals queries removed (dead code).
  const { projects: workspaceProjects } = useWorkspace();
  const projectsData = { projects: workspaceProjects };

  // Fetch issues with filters
  const handleFilterChange = (field: string, values: string[]) => {
    if (field === 'status') setFilterStatus(values);
    if (field === 'priority') setFilterPriority(values);
  };

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', selectedProject, selectedTeam, selectedGoal, hideSubtasks, filterStatus, filterPriority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProject) {
        params.append('projectId', selectedProject);
      }
      if (selectedTeam) {
        params.append('teamId', selectedTeam);
      }
      if (selectedGoal) {
        params.append('goalId', selectedGoal);
      }
      if (hideSubtasks) {
        params.append('topLevel', 'true');
      }
      if (filterStatus.length === 1) {
        params.append('status', filterStatus[0]);
      }
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  // Update issue status mutation — OPTIMISTIC for instant kanban drag
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: string }) => {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update issue');
      return res.json();
    },
    // Optimistic: update the cache immediately so the drag feels instant
    onMutate: async ({ issueId, status }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['issues'] });

      // Snapshot all ['issues', ...] query caches so we can roll back on error
      const previousQueries = queryClient.getQueriesData({ queryKey: ['issues'] });

      // Optimistically mutate every matching issues query cache
      queryClient.setQueriesData({ queryKey: ['issues'] }, (old: any) => {
        if (!old?.issues) return old;
        return {
          ...old,
          issues: old.issues.map((issue: Issue) =>
            issue.id === issueId ? { ...issue, status: status as Issue['status'] } : issue
          ),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Roll back every snapshot we took in onMutate
      context?.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error('Failed to update issue');
    },
    onSettled: () => {
      // Re-fetch once at the end to reconcile with server truth
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Auto-open task slideout from ?taskId= URL param (drill-down from activity)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    if (taskId && issuesData?.issues) {
      const issue = issuesData.issues.find((i: Issue) => i.id === taskId);
      if (issue) setSelectedIssue(issue);
    }
  }, [issuesData]);

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async ({ title, status, projectId }: { title: string; status: string; projectId: string }) => {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status, projectId }),
      });
      if (!res.ok) throw new Error('Failed to create issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setCreatingInColumn(null);
      setNewIssueTitle('');
    },
  });

  // Get current project
  const currentProject = projectsData?.projects?.[0];

  // Filter and organize issues by status
  const filteredIssues = issuesData?.issues?.filter((issue: Issue) => {
    if (filterPriority.length > 0 && !filterPriority.includes(issue.priority)) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.key.toLowerCase().includes(query) ||
      issue.title.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  }) || [];

  const issuesByStatus = filteredIssues.reduce((acc: Record<string, Issue[]>, issue: Issue) => {
    const status = issue.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(issue);
    return acc;
  }, {});

  // Keyboard shortcuts: C = create, Esc = close modal/slideout
  useKeyboardShortcuts([
    {
      key: 'c',
      handler: () => setShowCreateModal(true),
    },
    {
      key: 'Escape',
      disableInInput: false,
      handler: () => {
        if (selectedIssue) setSelectedIssue(null);
        else if (showCreateModal) setShowCreateModal(false);
        else if (insightsOpen) setInsightsOpen(false);
      },
    },
  ]);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update issue status
    const newStatus = destination.droppableId;
    updateIssueMutation.mutate({ issueId: draggableId, status: newStatus });
  };

  const handleCreateIssue = (status: string) => {
    if (!newIssueTitle.trim()) return;

    // Get project ID from selected project or first available project
    let projectId = selectedProject;

    if (!projectId && projectsData?.projects?.length > 0) {
      projectId = projectsData.projects[0].id;
    }

    if (!projectId) {
      toast.warning('No projects found', 'Please create a project first from the Projects page.');
      return;
    }

    createIssueMutation.mutate({
      title: newIssueTitle,
      status,
      projectId,
    });
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('nav.issues')}
        icon={<ListChecks className="h-6 w-6" />}
        iconColor="#8B5CF6"

        currentTab="list"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
        onInsightsToggle={() => setInsightsOpen((v) => !v)}
        insightsOpen={insightsOpen}
        onFilterChange={handleFilterChange}
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Subtask filter */}
        <div className="flex items-center gap-3 px-3 md:px-6 pt-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={hideSubtasks}
              onChange={(e) => setHideSubtasks(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500/30"
            />
            Hide subtasks
          </label>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 md:px-6 py-4">
          {isLoading ? (
            <SkeletonKanban columns={4} cardsPerColumn={3} />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex h-full gap-4">
                {STATUS_COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className="flex w-72 flex-shrink-0 flex-col"
                  >
                    {/* Column Header */}
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-white/70">
                        {t(column.labelKey)}
                      </h3>
                      <span className="rounded-sm bg-gray-200 dark:bg-white/[0.08] px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:text-white/70">
                        {issuesByStatus[column.id]?.length || 0}
                      </span>
                    </div>

                    {/* Column Content */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 space-y-2 overflow-y-auto"
                        >
                          {issuesByStatus[column.id]?.map((issue: Issue, index: number) => (
                            <Draggable key={issue.id} draggableId={issue.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedIssue(issue)}
                                  className={`cursor-pointer rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-3 transition-all hover:bg-gray-50 dark:hover:bg-[#181D23] ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                                  }`}
                                >
                                  <IssueCard issue={issue} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {/* Add Issue Button */}
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-[#181D23] hover:text-gray-900 dark:hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                            {t('common.create')}
                          </Button>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Issue Detail Slide-Out */}
      {selectedIssue && (
        <IssueDetailSlideout
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          defaultProjectId={selectedProject || undefined}
        />
      )}

      <InsightsSlideout
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        context={{ type: 'issues', issues: issuesData?.issues || [] }}
      />
    </div>
    </AppLayout>
  );
}

// Issue Card Component - Clean Jira-style design
function IssueCard({ issue }: { issue: Issue }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const typeConfig: Record<string, { label: string; color: string }> = {
    EPIC: { label: 'Epic', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    STORY: { label: 'Story', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    BUG: { label: 'Bug', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    TASK: { label: 'Task', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    SUBTASK: { label: 'Subtask', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  };
  const typeInfo = typeConfig[issue.type] || typeConfig.TASK;

  return (
    <div className="space-y-2.5">
      {/* Type badge + parent ref */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        {issue.parent && (
          <span className="text-[10px] text-gray-400 dark:text-white/40 truncate max-w-[120px]">
            {issue.parent.key}
          </span>
        )}
        {(issue.subtaskCount ?? 0) > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-white/40">
            +{issue.subtaskCount} sub
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-sm font-normal text-gray-900 dark:text-white leading-snug">
        {issue.title}
      </h4>

      {/* Due Date */}
      {issue.dueDate && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/70">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(issue.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {/* Issue Key */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-3.5 w-3.5 text-primary-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-white/70">
            {issue.key}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          {issue.assignee ? (
            issue.assignee.avatar ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name || ''}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-white/[0.08]" />
          )}
        </div>
      </div>
    </div>
  );
}
