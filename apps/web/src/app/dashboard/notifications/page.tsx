'use client';

/**
 * Notifications Page
 *
 * Shows a personalized activity feed for the current user — activities on
 * tasks they watch that were performed by other people (excludes self-actions).
 * Click any notification to drill into the task.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Edit3,
  Eye,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';

interface Notification {
  id: string;
  action: string;
  activityType: string;
  entityType: string;
  entityId: string;
  aiSummary: string | null;
  impactScore: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  task: {
    id: string;
    key: string;
    title: string;
    project: { id: string; key: string; name: string; color: string | null };
  } | null;
}

const ACTION_ICONS: Record<string, any> = {
  CREATED: CheckCircle2,
  UPDATED: Edit3,
  DELETED: Trash2,
  COMPLETED: CheckCircle2,
  ASSIGNED: UserPlus,
  COMMENTED: MessageSquare,
  WATCH_ADDED: Eye,
  WATCH_REMOVED: Eye,
};

const ACTION_COLORS: Record<string, string> = {
  CREATED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  UPDATED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  DELETED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  ASSIGNED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  COMMENTED: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const { data, isLoading } = useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      return res.json();
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleClick = (n: Notification) => {
    if (n.task) {
      const projectId = n.task.project?.id;
      const url = projectId
        ? `/dashboard/issues?projectId=${projectId}&taskId=${n.task.id}`
        : `/dashboard/issues?taskId=${n.task.id}`;
      router.push(url);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('notifications.title') || 'Notifications'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} new ${unreadCount === 1 ? 'update' : 'updates'}`
                    : 'All caught up'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <EmptyState
                  icon={Bell}
                  title="No notifications yet"
                  description="When someone comments on a task you watch, assigns you to something, or updates a task you care about, it will show up here."
                />
              </div>
            ) : (
              notifications.map((n) => {
                const ActionIcon = ACTION_ICONS[n.action] || Edit3;
                const actionColor = ACTION_COLORS[n.action] || ACTION_COLORS.UPDATED;
                const actorName = n.user?.name || n.user?.email || 'Someone';

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n)}
                    className="w-full text-left group flex items-start gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 hover:border-primary-500 transition-colors"
                  >
                    {/* Actor avatar */}
                    {n.user?.avatar ? (
                      <img
                        src={n.user.avatar}
                        alt={actorName}
                        className="h-9 w-9 shrink-0 rounded-full ring-2 ring-primary-500/10"
                      />
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-[#16A085] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-primary-500/10">
                        {actorName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {actorName}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${actionColor}`}
                        >
                          <ActionIcon className="h-2.5 w-2.5" />
                          {n.action.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>

                      {/* AI summary or task reference */}
                      {n.aiSummary ? (
                        <div className="flex items-start gap-1.5 mb-2">
                          <Sparkles className="h-3 w-3 text-primary-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                            {n.aiSummary}
                          </p>
                        </div>
                      ) : n.task ? (
                        <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
                          on <span className="font-mono text-primary-600 dark:text-primary-400">{n.task.key}</span> —{' '}
                          {n.task.title}
                        </p>
                      ) : null}

                      {/* Footer: project + timestamp */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                        {n.task?.project && (
                          <>
                            <span
                              className="h-4 rounded px-1 text-[9px] font-bold text-white flex items-center"
                              style={{ backgroundColor: n.task.project.color || '#3B82F6' }}
                            >
                              {n.task.project.key}
                            </span>
                            <span className="text-gray-400">•</span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
