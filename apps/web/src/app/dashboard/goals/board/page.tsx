'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Target } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { GOALS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';
import {
  BOARD_STATUSES,
  fetchGoals,
  GOAL_PRIORITY_DOT,
  GOAL_STATUS_LABEL_KEYS,
  progressBarClass,
  type Goal,
  type GoalStatus,
} from '@/lib/goals/types';

/**
 * Goals — Board view, grouped by status. Queries the organization's real goals.
 *
 * Replaces a page that rendered seven invented goals and never touched the
 * database. Read-only for now: drag-to-change-status needs an optimistic
 * update against PATCH /api/goals/[id] and belongs in its own change, where it
 * can be tested properly rather than bolted on here.
 */
export default function GoalsBoardPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['goals', 'all'],
    queryFn: () => fetchGoals('all'),
  });

  const columns = useMemo(() => {
    const all: Goal[] = data?.goals ?? [];
    const grouped = new Map<GoalStatus, Goal[]>();
    for (const status of BOARD_STATUSES) grouped.set(status, []);
    for (const goal of all) {
      // CANCELLED has no column on purpose — see BOARD_STATUSES. Those goals
      // are still reachable in the List view rather than silently vanishing.
      if (grouped.has(goal.status)) grouped.get(goal.status)!.push(goal);
    }
    return grouped;
  }, [data]);

  const total = data?.goals?.length ?? 0;

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <UnifiedPageHeader
          title={t('goals.goalsBoard')}
          icon={<LayoutDashboard className="h-6 w-6" />}
          iconColor="#8B5CF6"
          customTabs={GOALS_TABS}
          showTabs
          currentTab="board"
          baseHref="/dashboard/goals"
        />

        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          )}

          {isError && (
            <p className="text-sm text-red-600 dark:text-red-400">{t('goals.noGoalsBoard')}</p>
          )}

          {!isLoading && !isError && total === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t('emptyStates.noGoals')}
              </p>
              <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                {t('emptyStates.noGoalsDesc')}
              </p>
            </div>
          )}

          {total > 0 && (
            // Board scrolls inside itself; the page body never scrolls sideways.
            <div className="flex gap-4 overflow-x-auto pb-2">
              {BOARD_STATUSES.map((status) => {
                const items = columns.get(status) ?? [];
                return (
                  <div key={status} className="flex w-72 shrink-0 flex-col">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(GOAL_STATUS_LABEL_KEYS[status])}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {items.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2 dark:bg-white/[0.03]">
                      {items.length === 0 && (
                        <p className="px-2 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                          —
                        </p>
                      )}

                      {items.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => router.push('/dashboard/goals')}
                          className="block w-full rounded-md border border-gray-200 bg-white p-3 text-left hover:border-primary-300 dark:border-white/[0.08] dark:bg-[#12161B] dark:hover:border-primary-500/40"
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${GOAL_PRIORITY_DOT[goal.priority]}`}
                            />
                            <p className="whitespace-normal text-sm font-medium text-gray-900 dark:text-white">
                              {goal.title}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.08]">
                              <div
                                className={`h-full rounded-full ${progressBarClass(goal.status)}`}
                                style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                              />
                            </div>
                            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                              {goal.progress}%
                            </span>
                          </div>

                          {goal.team?.name && (
                            <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
                              {goal.team.name}
                            </p>
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
    </AppLayout>
  );
}
