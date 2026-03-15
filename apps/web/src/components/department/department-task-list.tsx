'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Clock, type LucideIcon } from 'lucide-react';
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

interface DepartmentTaskListProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  emptyMessage?: string;
  defaultLabels?: string[];
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

export function DepartmentTaskList({
  title,
  description,
  icon: Icon,
  iconColor,
  emptyMessage = 'No tasks yet. Create one to get started.',
  defaultLabels = [],
}: DepartmentTaskListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!session,
  });

  const { data: issuesData, isLoading } = useQuery<{ issues?: Task[] }>({
    queryKey: ['issues', 'department', title],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: async (taskTitle: string) => {
      const projectId = projectsData?.projects?.[0]?.id;
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

  const tasks = (issuesData?.issues || []).filter(t => {
    if (!search) return true;
    return t.title.toLowerCase().includes(search.toLowerCase()) || t.key.toLowerCase().includes(search.toLowerCase());
  });

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
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: iconColor + '20' }}>
              <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Inline create form */}
      {showCreateForm && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#22272B] px-4 py-3 sm:px-6">
          <form onSubmit={handleCreateSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="flex-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || !newTaskTitle.trim()}
              className="rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? '...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setNewTaskTitle(''); }}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282E33] transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500 dark:border-slate-700" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
              <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">{emptyMessage}</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-3 flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282E33] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your first task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 text-left hover:bg-slate-50 dark:hover:bg-[#22272B] transition-colors group"
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
                {task.dueDate && (
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
