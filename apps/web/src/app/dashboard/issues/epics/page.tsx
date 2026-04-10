'use client';

/**
 * Epics List Page
 *
 * Lists all EPIC-type tasks the user can see, with progress bars showing
 * % of child tasks complete. Click to open the epic detail page.
 */

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Target,
  Sparkles,
  Flag,
  User,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/contexts/language-context';

interface Epic {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project: { id: string; name: string; key: string; color?: string };
  assignee?: { id: string; name: string; avatar?: string };
  childCount: number;
  childDoneCount: number;
  progress: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
  LOWEST: 'text-gray-500 dark:text-gray-400',
};

export default function EpicsListPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const scopedProjectId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('projectId')
    : null;

  const { data, isLoading } = useQuery<{ epics: Epic[] }>({
    queryKey: ['epics', scopedProjectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (scopedProjectId) params.append('projectId', scopedProjectId);
      const res = await fetch(`/api/epics?${params}`);
      if (!res.ok) throw new Error('Failed to fetch epics');
      return res.json();
    },
  });

  const epics = data?.epics || [];

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Epics"
        icon={<Target className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="epics"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
      />

      <div className="min-h-full bg-gray-50 dark:bg-[#1B1F23] p-3 md:p-6">
        {isLoading ? (
          <div className="space-y-3 max-w-4xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : epics.length === 0 ? (
          <div className="flex h-full items-center justify-center pt-12">
            <EmptyState
              icon={Target}
              title="No epics yet"
              description="Create a task with type EPIC to group related work and track progress across multiple tasks."
            />
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {epics.map((epic) => (
              <button
                key={epic.id}
                type="button"
                onClick={() => router.push(`/dashboard/issues/epics/${epic.id}`)}
                className="w-full group text-left rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 hover:border-purple-500 transition-all"
              >
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                    <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="h-5 rounded px-1.5 text-[10px] font-bold text-white flex items-center"
                        style={{ backgroundColor: epic.project.color || '#3B82F6' }}
                      >
                        {epic.project.key}
                      </span>
                      <span className="text-xs font-mono text-gray-500 dark:text-slate-400">
                        {epic.key}
                      </span>
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
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {epic.title}
                    </h3>
                    {epic.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                        {epic.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {epic.assignee ? (
                      epic.assignee.avatar ? (
                        <img
                          src={epic.assignee.avatar}
                          alt={epic.assignee.name}
                          className="h-7 w-7 rounded-full"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-semibold">
                          {epic.assignee.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )
                    ) : (
                      <div className="h-7 w-7 rounded-full border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {epic.childDoneCount} of {epic.childCount} tasks done
                    </span>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {epic.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-[#1C8C7D] transition-all duration-500"
                      style={{ width: `${epic.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer metadata */}
                {epic.dueDate && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    Due {new Date(epic.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
