'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ListChecks, Search, Target } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { GOALS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';
import {
  fetchGoals,
  GOAL_PRIORITY_DOT,
  GOAL_STATUS_LABEL_KEYS,
  GOAL_STATUS_STYLES,
  progressBarClass,
  type Goal,
} from '@/lib/goals/types';

/**
 * Goals — List view. Queries the organization's real goals.
 *
 * The page that previously lived here rendered six invented goals owned by
 * invented people and never touched the database. This one shares its query
 * and its vocabulary with the main Goals page via lib/goals/types.
 */
export default function GoalsListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['goals', 'all'],
    queryFn: () => fetchGoals('all'),
  });

  const goals = useMemo(() => {
    const all: Goal[] = data?.goals ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.team?.name.toLowerCase().includes(q) ||
        g.owner?.name.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        <UnifiedPageHeader
          title={t('goals.goalsList')}
          icon={<ListChecks className="h-6 w-6" />}
          iconColor="#8B5CF6"
          customTabs={GOALS_TABS}
          showTabs
          currentTab="list"
          baseHref="/dashboard/goals"
        />

        <div className="border-b border-gray-200 px-6 py-3 dark:border-white/[0.08]">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('goals.searchGoals')}
              className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-white/[0.08] dark:bg-[#12161B] dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          )}

          {isError && (
            <p className="text-sm text-red-600 dark:text-red-400">{t('goals.noGoals')}</p>
          )}

          {!isLoading && !isError && goals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {search ? t('goals.noGoalsMatchingFilters') : t('emptyStates.noGoals')}
              </p>
              {!search && (
                <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                  {t('emptyStates.noGoalsDesc')}
                </p>
              )}
            </div>
          )}

          {goals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-white/[0.08]">
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('goals.goal')}
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('goals.status')}
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('goals.progress')}
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      {t('sidebar.teams')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => (
                    <tr
                      key={goal.id}
                      onClick={() => router.push('/dashboard/goals')}
                      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${GOAL_PRIORITY_DOT[goal.priority]}`}
                          />
                          <div className="min-w-0">
                            <p className="whitespace-normal font-medium text-gray-900 dark:text-white">
                              {goal.title}
                            </p>
                            {goal.description && (
                              <p className="mt-0.5 line-clamp-1 whitespace-normal text-xs text-gray-500 dark:text-gray-400">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${GOAL_STATUS_STYLES[goal.status]}`}
                        >
                          {t(GOAL_STATUS_LABEL_KEYS[goal.status])}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.08]">
                            <div
                              className={`h-full rounded-full ${progressBarClass(goal.status)}`}
                              style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {goal.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                        {goal.team?.name ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
