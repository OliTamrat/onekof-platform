'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight, ChevronDown, Target, BookOpen, CheckSquare, Bug,
  ListChecks, Loader2, User, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeIssue {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; avatar: string | null } | null;
  project?: { id: string; name: string; key: string; color: string } | null;
  _count?: { subtasks: number };
  dueDate?: string | null;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  EPIC: { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  STORY: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  TASK: { icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  BUG: { icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10' },
  SUBTASK: { icon: ListChecks, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-500',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-amber-500',
  DONE: 'bg-emerald-500',
  BACKLOG: 'bg-gray-400',
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  HIGHEST: { label: 'Highest', color: 'text-red-400' },
  HIGH: { label: 'High', color: 'text-orange-400' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-400' },
  LOW: { label: 'Low', color: 'text-emerald-400' },
  LOWEST: { label: 'Lowest', color: 'text-slate-400' },
};

function TreeNode({ issue, depth, projectId, onSelect }: {
  issue: TreeIssue;
  depth: number;
  projectId?: string;
  onSelect?: (issue: TreeIssue) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = (issue._count?.subtasks || 0) > 0;
  const config = typeConfig[issue.type] || typeConfig.TASK;
  const Icon = config.icon;
  const status = statusColors[issue.status] || 'bg-gray-400';
  const priority = priorityLabels[issue.priority];

  const { data: children, isLoading } = useQuery({
    queryKey: ['issue-children', issue.id],
    queryFn: async () => {
      const params = new URLSearchParams({ parentId: issue.id });
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.issues || [];
    },
    enabled: expanded && hasChildren,
  });

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-pointer',
          depth === 0 && 'py-2',
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors', hasChildren ? 'hover:bg-slate-200 dark:hover:bg-white/[0.08]' : 'invisible')}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          ) : expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {/* Type icon */}
        <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded', config.bg)}>
          <Icon className={cn('h-3.5 w-3.5', config.color)} />
        </div>

        {/* Key */}
        <span className="shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500">
          {issue.key}
        </span>

        {/* Title */}
        <span
          className="min-w-0 flex-1 truncate text-sm text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
          onClick={() => onSelect?.(issue)}
        >
          {issue.title}
        </span>

        {/* Status dot */}
        <div className={cn('h-2 w-2 shrink-0 rounded-full', status)} title={issue.status.replace('_', ' ')} />

        {/* Priority */}
        {priority && (
          <span className={cn('hidden shrink-0 text-[10px] font-medium sm:inline', priority.color)}>
            {priority.label}
          </span>
        )}

        {/* Assignee */}
        {issue.assignee && (
          <div className="hidden shrink-0 sm:flex" title={issue.assignee.name}>
            {issue.assignee.avatar ? (
              <img src={issue.assignee.avatar} className="h-5 w-5 rounded-full" alt="" />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                {issue.assignee.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        )}

        {/* Child count */}
        {hasChildren && (
          <span className="shrink-0 rounded-full bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {issue._count!.subtasks}
          </span>
        )}
      </div>

      {/* Children */}
      {expanded && children && children.length > 0 && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l border-slate-200 dark:border-white/[0.06]"
            style={{ left: `${depth * 24 + 20}px` }}
          />
          {children.map((child: TreeIssue) => (
            <TreeNode
              key={child.id}
              issue={child}
              depth={depth + 1}
              projectId={projectId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function IssueHierarchyTree({ projectId, onSelect }: {
  projectId?: string;
  onSelect?: (issue: TreeIssue) => void;
}) {
  const { data: rootIssues, isLoading } = useQuery({
    queryKey: ['issues-hierarchy-root', projectId],
    queryFn: async () => {
      const params = new URLSearchParams({ topLevel: 'true' });
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.issues || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!rootIssues || rootIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Target className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No issues found</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create an Epic to start building your hierarchy</p>
      </div>
    );
  }

  const epics = rootIssues.filter((i: TreeIssue) => i.type === 'EPIC');
  const stories = rootIssues.filter((i: TreeIssue) => i.type === 'STORY');
  const tasks = rootIssues.filter((i: TreeIssue) => i.type === 'TASK');
  const bugs = rootIssues.filter((i: TreeIssue) => i.type === 'BUG');
  const others = rootIssues.filter((i: TreeIssue) => !['EPIC', 'STORY', 'TASK', 'BUG'].includes(i.type));

  const sorted = [...epics, ...stories, ...tasks, ...bugs, ...others];

  return (
    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
      {sorted.map((issue: TreeIssue) => (
        <TreeNode
          key={issue.id}
          issue={issue}
          depth={0}
          projectId={projectId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
