'use client';

/**
 * Epic Detail Page
 *
 * Shows an Epic with aggregated child task stats:
 * - Progress bar (% of children in DONE)
 * - Status breakdown
 * - Estimate rollup
 * - Child task list grouped by status
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  User,
  Flag,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { SkeletonCard, Skeleton } from '@/components/ui/skeleton';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { useLanguage } from '@/contexts/language-context';

interface EpicResponse {
  epic: {
    id: string;
    key: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    dueDate?: string;
    createdAt: string;
    project: { id: string; name: string; key: string; color?: string };
    assignee?: { id: string; name: string; email: string; avatar?: string };
    reporter?: { id: string; name: string; email: string; avatar?: string };
  };
  children: Array<{
    id: string;
    key: string;
    title: string;
    type: string;
    status: string;
    priority?: string;
    estimate?: number;
    timeSpent?: number;
    dueDate?: string;
    assignee?: { id: string; name: string; email: string; avatar?: string };
  }>;
  stats: {
    total: number;
    byStatus: Record<string, number>;
    progress: number;
    estimateTotal: number;
    timeSpentTotal: number;
  };
}

const STATUS_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  BACKLOG: { label: 'Backlog', icon: Circle, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  TODO: { label: 'To Do', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  IN_REVIEW: { label: 'In Review', icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  BLOCKED: { label: 'Blocked', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
  LOWEST: 'text-gray-500 dark:text-gray-400',
};

export default function EpicDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const epicId = params?.id as string;
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<EpicResponse>({
    queryKey: ['epic', epicId],
    queryFn: async () => {
      const res = await fetch(`/api/epics/${epicId}`);
      if (!res.ok) throw new Error('Failed to fetch epic');
      return res.json();
    },
    enabled: !!epicId,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="bg-gray-50 dark:bg-[#1B1F23] min-h-full p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-3/4" />
          <div className="grid grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="space-y-2 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex min-h-full items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-slate-400 mb-4">Epic not found or you don&apos;t have access.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { epic, children, stats } = data;

  // Group children by status
  const childrenByStatus: Record<string, typeof children> = {};
  for (const child of children) {
    if (!childrenByStatus[child.status]) childrenByStatus[child.status] = [];
    childrenByStatus[child.status].push(child);
  }

  const statusOrder = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];

  return (
    <AppLayout>
      <div className="min-h-full bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="px-4 md:px-6 py-4">
            {/* Back button + breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-7 px-2 text-xs text-gray-600 dark:text-slate-400"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t('common.back')}
              </Button>
              <span className="text-gray-300 dark:text-slate-600">/</span>
              <span
                className="h-5 rounded px-1.5 text-[10px] font-bold text-white flex items-center"
                style={{ backgroundColor: epic.project.color || '#3B82F6' }}
              >
                {epic.project.key}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-slate-400">{epic.key}</span>
            </div>

            {/* Epic icon + title */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-2.5 w-2.5" />
                    Epic
                  </span>
                  {epic.priority && (
                    <span className={`flex items-center gap-1 text-xs ${PRIORITY_COLORS[epic.priority]}`}>
                      <Flag className="h-3 w-3" />
                      {epic.priority}
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                  {epic.title}
                </h1>
                {epic.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 max-w-3xl">
                    {epic.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-4 md:px-6 py-6 space-y-6 max-w-6xl">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Progress</h2>
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                {stats.byStatus.DONE} of {stats.total} done
                <span className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                  {stats.progress}%
                </span>
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-[#1C8C7D] transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Total tasks</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stats.total}</div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">In progress</div>
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
                {stats.byStatus.IN_PROGRESS + stats.byStatus.IN_REVIEW}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Estimate</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.estimateTotal}h
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Time spent</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                {stats.timeSpentTotal}h
              </div>
            </div>
          </div>

          {/* Children grouped by status */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Child tasks ({stats.total})
            </h2>
            {children.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
                <Target className="h-8 w-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  No tasks linked to this epic yet. Create a task and set this epic as its parent.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusOrder.map((status) => {
                  const tasks = childrenByStatus[status];
                  if (!tasks || tasks.length === 0) return null;
                  const meta = STATUS_META[status];
                  const Icon = meta.icon;
                  return (
                    <div key={status}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${meta.color}`} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                          ({tasks.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {tasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => setSelectedChildId(task.id)}
                            className="w-full flex items-center gap-3 rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 py-2 text-left hover:border-primary-500 transition-colors"
                          >
                            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 shrink-0 w-20">
                              {task.key}
                            </span>
                            <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                              {task.title}
                            </span>
                            {task.priority && (
                              <Flag className={`h-3.5 w-3.5 shrink-0 ${PRIORITY_COLORS[task.priority] || 'text-gray-400'}`} />
                            )}
                            {task.estimate && (
                              <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">
                                {task.estimate}h
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="shrink-0 flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                            {task.assignee ? (
                              task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="h-6 w-6 shrink-0 rounded-full"
                                />
                              ) : (
                                <div className="h-6 w-6 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-semibold">
                                  {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )
                            ) : (
                              <div className="h-6 w-6 shrink-0 rounded-full border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center">
                                <User className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Child task slideout */}
      {selectedChildId && (
        <IssueDetailSlideout
          issueId={selectedChildId}
          onClose={() => setSelectedChildId(null)}
        />
      )}
    </AppLayout>
  );
}
