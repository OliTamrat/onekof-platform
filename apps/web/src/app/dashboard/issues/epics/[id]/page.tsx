'use client';

/**
 * Epic Detail Page
 *
 * Two-column layout:
 *  Left  (main)  — progress bar + child task list + quick-add
 *  Right (aside) — stat cards + epic metadata
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Plus,
  BarChart3,
  Timer,
  ListChecks,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { SkeletonCard, Skeleton } from '@/components/ui/skeleton';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
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

const STATUS_META: Record<string, { label: string; icon: any; color: string; dotColor: string }> = {
  BACKLOG:     { label: 'Backlog',      icon: Circle,       color: 'text-slate-500',  dotColor: 'bg-slate-400' },
  TODO:        { label: 'To Do',        icon: Circle,       color: 'text-gray-500',   dotColor: 'bg-gray-400' },
  IN_PROGRESS: { label: 'In Progress',  icon: Clock,        color: 'text-blue-500',   dotColor: 'bg-blue-500' },
  IN_REVIEW:   { label: 'In Review',    icon: AlertCircle,  color: 'text-yellow-500', dotColor: 'bg-yellow-500' },
  DONE:        { label: 'Done',         icon: CheckCircle2, color: 'text-green-500',  dotColor: 'bg-green-500' },
  BLOCKED:     { label: 'Blocked',      icon: XCircle,      color: 'text-red-500',    dotColor: 'bg-red-500' },
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH:    'text-orange-500 dark:text-orange-400',
  MEDIUM:  'text-yellow-500 dark:text-yellow-400',
  LOW:     'text-green-500 dark:text-green-400',
  LOWEST:  'text-gray-400 dark:text-gray-500',
};

const STATUS_ORDER = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'DONE'];

export default function EpicDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const epicId = params?.id as string;
  const queryClient = useQueryClient();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
        <div className="bg-gray-50 dark:bg-[#0B0E11] min-h-full">
          <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6 py-4">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="flex gap-6 p-6">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
            <div className="w-72 space-y-3">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex min-h-full items-center justify-center bg-gray-50 dark:bg-[#0B0E11]">
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-white/50 mb-4">Epic not found or you don&apos;t have access.</p>
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

  const progressWidth = `${stats.progress}%`;

  return (
    <AppLayout>
      <div className="min-h-full bg-gray-50 dark:bg-[#0B0E11]">

        {/* ── Full-width header ── */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="px-4 md:px-6 py-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-7 px-2 text-xs text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white"
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
              <span className="text-xs font-mono text-gray-400 dark:text-white/40">{epic.key}</span>
            </div>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0 mt-0.5">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                      <Sparkles className="h-2.5 w-2.5" />
                      Epic
                    </span>
                    {epic.priority && (
                      <span className={`flex items-center gap-1 text-xs font-medium ${PRIORITY_COLORS[epic.priority]}`}>
                        <Flag className="h-3 w-3" />
                        {epic.priority}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-white/30">
                      {epic.project.name}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white leading-tight">
                    {epic.title}
                  </h1>
                  {epic.description && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-white/50 max-w-2xl line-clamp-2">
                      {epic.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Add child task — top-right */}
              <Button
                onClick={() => setShowCreateModal(true)}
                className="shrink-0 h-9 rounded-lg bg-[#1C8C7D] text-white hover:bg-[#167A6E] gap-1.5 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add child task
              </Button>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-160px)]">

          {/* LEFT — progress + child tasks */}
          <div className="flex-1 min-w-0 px-4 md:px-6 py-6 space-y-6">

            {/* Progress bar */}
            <div className="bg-white dark:bg-[#12161B] rounded-xl border border-gray-200 dark:border-white/[0.08] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  Progress
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-white/50">
                    {stats.byStatus.DONE ?? 0} of {stats.total} done
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {stats.progress}%
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#1E2328] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#1C8C7D] transition-all duration-500"
                  style={{ width: progressWidth }}
                />
              </div>

              {/* Mini status breakdown */}
              {stats.total > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {STATUS_ORDER.map((s) => {
                    const count = stats.byStatus[s] ?? 0;
                    if (count === 0) return null;
                    const meta = STATUS_META[s];
                    return (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${meta.dotColor}`} />
                        <span className="text-xs text-gray-500 dark:text-white/50">{meta.label}</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-white/80">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Child tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4 text-gray-500 dark:text-white/40" />
                  Child tasks
                  <span className="ml-1 rounded-full bg-gray-100 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:text-white/60">
                    {stats.total}
                  </span>
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="h-7 px-2.5 text-xs gap-1 border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add task
                </Button>
              </div>

              {children.length === 0 ? (
                <div
                  onClick={() => setShowCreateModal(true)}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-12 text-center cursor-pointer hover:border-[#1C8C7D] hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.06] mb-3 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-white/50 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    No child tasks yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                    Click to add the first task to this epic
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {STATUS_ORDER.map((status) => {
                    const tasks = childrenByStatus[status];
                    if (!tasks || tasks.length === 0) return null;
                    const meta = STATUS_META[status];
                    const Icon = meta.icon;
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <span className={`h-2 w-2 rounded-full ${meta.dotColor}`} />
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-white/50">
                            {meta.label}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-white/30">({tasks.length})</span>
                        </div>
                        <div className="space-y-1.5">
                          {tasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => setSelectedChildId(task.id)}
                              className="w-full flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-2.5 text-left hover:border-[#1C8C7D]/60 hover:shadow-sm transition-all group"
                            >
                              <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.color}`} />
                              <span className="text-[11px] font-mono text-gray-400 dark:text-white/30 shrink-0 w-16">
                                {task.key}
                              </span>
                              <span className="flex-1 text-sm text-gray-800 dark:text-white/90 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {task.title}
                              </span>
                              {task.priority && (
                                <Flag className={`h-3 w-3 shrink-0 ${PRIORITY_COLORS[task.priority] || 'text-gray-400'}`} />
                              )}
                              {task.estimate && (
                                <span className="shrink-0 flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-white/30">
                                  <Timer className="h-2.5 w-2.5" />
                                  {task.estimate}h
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {task.assignee ? (
                                task.assignee.avatar ? (
                                  <img
                                    src={task.assignee.avatar}
                                    alt={task.assignee.name}
                                    title={task.assignee.name}
                                    className="h-6 w-6 shrink-0 rounded-full ring-1 ring-gray-200 dark:ring-white/10"
                                  />
                                ) : (
                                  <div
                                    title={task.assignee.name}
                                    className="h-6 w-6 shrink-0 rounded-full bg-[#1C8C7D] text-white flex items-center justify-center text-[10px] font-semibold"
                                  >
                                    {task.assignee.name?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )
                              ) : (
                                <div className="h-6 w-6 shrink-0 rounded-full border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center">
                                  <User className="h-3 w-3 text-gray-300 dark:text-slate-500" />
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

          {/* RIGHT — stats + metadata */}
          <div className="lg:w-72 xl:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-5 py-6 space-y-6">

            {/* Stat cards */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-3">
                Overview
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 dark:bg-[#0B0E11] border border-gray-100 dark:border-white/[0.05] px-3 py-3">
                  <div className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wide">Total</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-[#0B0E11] border border-gray-100 dark:border-white/[0.05] px-3 py-3">
                  <div className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wide">Active</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {(stats.byStatus.IN_PROGRESS ?? 0) + (stats.byStatus.IN_REVIEW ?? 0)}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-[#0B0E11] border border-gray-100 dark:border-white/[0.05] px-3 py-3">
                  <div className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wide">Estimate</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.estimateTotal}h</div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-[#0B0E11] border border-gray-100 dark:border-white/[0.05] px-3 py-3">
                  <div className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wide">Spent</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.timeSpentTotal}h</div>
                </div>
              </div>
            </div>

            {/* Epic metadata */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/30 mb-3">
                Details
              </h3>
              <div className="space-y-3">

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/40">Status</span>
                  {(() => {
                    const meta = STATUS_META[epic.status] || STATUS_META.TODO;
                    const Icon = meta.icon;
                    return (
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${meta.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Priority */}
                {epic.priority && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-white/40">Priority</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${PRIORITY_COLORS[epic.priority]}`}>
                      <Flag className="h-3 w-3" />
                      {epic.priority}
                    </span>
                  </div>
                )}

                {/* Assignee */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/40">Assignee</span>
                  {epic.assignee ? (
                    <div className="flex items-center gap-1.5">
                      {epic.assignee.avatar ? (
                        <img src={epic.assignee.avatar} alt={epic.assignee.name} className="h-5 w-5 rounded-full" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-[#1C8C7D] text-white flex items-center justify-center text-[9px] font-bold">
                          {epic.assignee.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-gray-700 dark:text-white/80">{epic.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-white/30">Unassigned</span>
                  )}
                </div>

                {/* Reporter */}
                {epic.reporter && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-white/40">Reporter</span>
                    <div className="flex items-center gap-1.5">
                      {epic.reporter.avatar ? (
                        <img src={epic.reporter.avatar} alt={epic.reporter.name} className="h-5 w-5 rounded-full" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-[9px] font-bold">
                          {epic.reporter.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs text-gray-700 dark:text-white/80">{epic.reporter.name}</span>
                    </div>
                  </div>
                )}

                {/* Due date */}
                {epic.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-white/40">Due date</span>
                    <span className="flex items-center gap-1 text-xs text-gray-700 dark:text-white/80">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(epic.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}

                {/* Project */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/40">Project</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-4 w-4 rounded text-[8px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: epic.project.color || '#3B82F6' }}
                    >
                      {epic.project.key?.slice(0, 1)}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-white/80 max-w-[120px] truncate">
                      {epic.project.name}
                    </span>
                  </div>
                </div>

                {/* Created */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-white/40">Created</span>
                  <span className="text-xs text-gray-500 dark:text-white/40">
                    {new Date(epic.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick tip when no children */}
            {children.length === 0 && (
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 p-4">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">How child tasks work</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/60 leading-relaxed">
                  Click <strong>Add child task</strong> above. Each task you add becomes part of this epic and counts toward the progress bar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Child task slideout */}
      {selectedChildId && (
        <IssueDetailSlideout
          issueId={selectedChildId}
          onClose={() => {
            setSelectedChildId(null);
            queryClient.invalidateQueries({ queryKey: ['epic', epicId] });
          }}
        />
      )}

      {/* Create child task modal — pre-linked to this epic */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['epic', epicId] });
          }}
          defaultProjectId={epic.project.id}
          defaultParentId={epic.id}
        />
      )}
    </AppLayout>
  );
}
