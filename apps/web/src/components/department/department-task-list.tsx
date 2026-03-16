'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, type LucideIcon } from 'lucide-react';
import { UnifiedPageHeader, type TabDefinition, type FilterField, type GroupByField, type ViewMode } from '@/components/navigation/unified-page-header';
import { AIInsightsPanel } from '@/components/department/ai-insights-panel';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string | null;
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color: string };
}

type DepartmentCategory = 'development' | 'marketing' | 'operations' | 'research' | 'knowledge' | 'general';

interface DepartmentTaskListProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessage?: string;
  defaultLabels?: string[];
  baseHref?: string;
  currentTab?: string;
  tabs?: TabDefinition[];
  category?: DepartmentCategory;
  projectId?: string;
}

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-blue-400',
};

const STATUS_BADGE: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  IN_REVIEW: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  BLOCKED: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_ORDER = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];
const PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function DepartmentTaskList({
  title,
  description,
  icon: Icon,
  iconColor,
  emptyMessage = 'No tasks yet. Create one to get started.',
  defaultLabels = [],
  baseHref,
  currentTab,
  tabs,
  category = 'general',
  projectId: scopedProjectId,
}: DepartmentTaskListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Control bar state
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [groupBy, setGroupBy] = useState<GroupByField>('none');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [insightsOpen, setInsightsOpen] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!session,
  });

  const { data: issuesData, isLoading } = useQuery<{ issues?: (Task & { labels?: string[] })[] }>({
    queryKey: ['issues', 'department', title, scopedProjectId],
    queryFn: async () => {
      const url = scopedProjectId
        ? `/api/issues?projectId=${scopedProjectId}`
        : '/api/issues';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: async (taskTitle: string) => {
      const projectId = scopedProjectId || projectsData?.projects?.[0]?.id;
      if (!projectId) throw new Error('No project available');
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          projectId,
          status: 'TODO',
          priority: 'MEDIUM',
          labels: defaultLabels,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setNewTaskTitle('');
      setShowCreateForm(false);
    },
  });

  // Filter by department labels client-side
  const allTasks = useMemo(() => {
    const raw = issuesData?.issues || [];
    if (defaultLabels.length === 0) return raw;
    return raw.filter(task => {
      const taskLabels: string[] = Array.isArray(task.labels) ? task.labels.map((l: string) => l.toLowerCase()) : [];
      return defaultLabels.every(dl => taskLabels.includes(dl.toLowerCase()));
    });
  }, [issuesData?.issues, defaultLabels]);

  // Apply search + filters
  const filteredTasks = useMemo(() => {
    let result = allTasks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }

    if (activeFilters.status?.length) {
      result = result.filter(t => activeFilters.status.includes(t.status));
    }
    if (activeFilters.priority?.length) {
      result = result.filter(t => activeFilters.priority.includes(t.priority));
    }

    return result;
  }, [allTasks, search, activeFilters]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { '': filteredTasks };

    const groups: Record<string, Task[]> = {};
    const order = groupBy === 'status' ? STATUS_ORDER : PRIORITY_ORDER;

    order.forEach(key => { groups[key] = []; });

    filteredTasks.forEach(task => {
      const key = groupBy === 'status' ? task.status : task.priority;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [filteredTasks, groupBy]);

  const handleFilterChange = (field: FilterField, values: string[]) => {
    setActiveFilters(prev => ({ ...prev, [field]: values }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createMutation.mutate(newTaskTitle.trim());
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#1B1F23]">
      {/* Unified Header with Navigation + Controls */}
      <UnifiedPageHeader
        title={title}
        description={description}
        icon={<Icon className="h-6 w-6" />}
        iconColor={iconColor}
        currentTab={currentTab}
        baseHref={baseHref}
        customTabs={tabs}
        showTabs={!!tabs && tabs.length > 0}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
        searchValue={search}
        onSearchChange={setSearch}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        viewMode={viewMode}
        onViewChange={setViewMode}
        insightsOpen={insightsOpen}
        onInsightsToggle={() => setInsightsOpen(prev => !prev)}
        taskCounts={{ total: allTasks.length, filtered: filteredTasks.length }}
      />

      {/* AI Insights Panel */}
      {insightsOpen && (
        <AIInsightsPanel tasks={allTasks} category={category} title={title} />
      )}

      {/* Quick create bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 sm:px-6">
        {showCreateForm ? (
          <form onSubmit={handleCreateSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || !newTaskTitle.trim()}
              className="rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? '...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setNewTaskTitle(''); }}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282E33] transition-colors"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create task</span>
          </button>
        )}
      </div>

      {/* Task content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500 dark:border-slate-700" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Icon className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
              {search || Object.values(activeFilters).some(v => v.length > 0)
                ? 'No tasks match your current filters.'
                : emptyMessage}
            </p>
            {!search && !Object.values(activeFilters).some(v => v.length > 0) && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-3 flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282E33] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create your first task
              </button>
            )}
          </div>
        ) : viewMode === 'board' ? (
          /* Board view - kanban columns by status */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 h-full auto-rows-min">
            {STATUS_ORDER.filter(s => filteredTasks.some(t => t.status === s)).map(status => {
              const statusTasks = filteredTasks.filter(t => t.status === status);
              return (
                <div key={status} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-[#22272B] min-w-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <span className={cn('rounded-md px-2 py-1 text-[11px] font-bold tracking-wide', STATUS_BADGE[status])}>
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{statusTasks.length}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {statusTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-4 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all shadow-sm group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn('h-2 w-2 rounded-full', PRIORITY_DOT[task.priority])} />
                          <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{task.key}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</p>
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-medium text-slate-400" style={{ color: task.project.color }}>{task.project.key}</span>
                          {task.assignee ? (
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-[10px] text-white font-semibold shadow-sm" title={task.assignee.name}>
                              {task.assignee.name.charAt(0)}
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center" title="Unassigned">
                              <span className="text-[10px] text-slate-400">?</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List view (default) and compact view */
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
              <div key={groupKey || 'all'}>
                {/* Group header */}
                {groupBy !== 'none' && groupKey && (
                  <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-50 dark:bg-[#22272B] px-4 py-2 sm:px-6 border-b border-slate-200 dark:border-slate-700">
                    <span className={cn(
                      'rounded px-2 py-0.5 text-[11px] font-bold',
                      groupBy === 'status' ? STATUS_BADGE[groupKey] || '' : '',
                      groupBy === 'priority' ? PRIORITY_DOT[groupKey] ? `text-${PRIORITY_DOT[groupKey].replace('bg-', '')}` : '' : ''
                    )}>
                      {groupKey.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{tasks.length} items</span>
                  </div>
                )}

                {tasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={cn(
                      'flex w-full items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-[#22272B] transition-colors group',
                      viewMode === 'compact' ? 'px-4 py-1.5 sm:px-6' : 'px-4 py-3 sm:px-6'
                    )}
                  >
                    {/* Priority dot */}
                    <span className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />

                    {/* Key */}
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-16 sm:w-20 truncate">
                      {task.key}
                    </span>

                    {/* Title */}
                    <span className="flex-1 text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {task.title}
                    </span>

                    {/* Status */}
                    <span className={cn('hidden sm:inline rounded-md px-2 py-0.5 text-[10px] font-medium shrink-0', STATUS_BADGE[task.status])}>
                      {task.status.replace('_', ' ')}
                    </span>

                    {/* Due date */}
                    {task.dueDate && viewMode !== 'compact' && (
                      <span className="hidden md:flex items-center gap-1 text-xs text-slate-400 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}

                    {/* Assignee */}
                    {task.assignee && (
                      <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center text-[10px] text-white font-medium shrink-0">
                        {task.assignee.name.charAt(0)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail slideout */}
      {selectedTaskId && (
        <IssueDetailSlideout
          issueId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
