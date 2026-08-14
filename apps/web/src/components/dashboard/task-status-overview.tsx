'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED' | 'BACKLOG';

interface StatsResponse {
  stats: { completed: number; updated: number; created: number; dueSoon: number };
  statusBreakdown: Partial<Record<TaskStatus, number>>;
  priorityBreakdown: Partial<Record<string, number>>;
  totalTasks: number;
}

interface IssueRow {
  id: string;
  key: string;
  title: string;
  priority: string;
  dueDate: string | null;
  project?: { key: string } | null;
}

/** Donut geometry — identical to the project overview so the two read as kin. */
const RADIUS = 35;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 1.5;

/**
 * Workflow order, not severity order. Unlike project health — where problems
 * lead — a task pipeline reads left to right as work flows, and that is the
 * order every board in the product already uses.
 */
const STATUS_ORDER: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];

/** Existing dashboard semantics, kept: green to-do, blue progress, amber review. */
const STATUS_COLOR: Record<TaskStatus, string> = {
  BACKLOG: '#94A3B8',
  TODO: '#22C55E',
  IN_PROGRESS: '#3B82F6',
  IN_REVIEW: '#F59E0B',
  DONE: '#10B981',
  BLOCKED: '#EF4444',
};

const PRIORITY_ROWS: { key: string; labelKey: string; color: string }[] = [
  { key: 'HIGHEST', labelKey: 'priority.highest', color: '#EF4444' },
  { key: 'HIGH', labelKey: 'priority.high', color: '#F97316' },
  { key: 'MEDIUM', labelKey: 'priority.medium', color: '#EAB308' },
  { key: 'LOW', labelKey: 'priority.low', color: '#22C55E' },
  { key: 'LOWEST', labelKey: 'priority.lowest', color: '#94A3B8' },
];

const CARD =
  'rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] ' +
  'p-6 shadow-md hover:shadow-xl transition-all duration-300 ' +
  // No dark: override, deliberately. The established cards' dark border
  // class is invalid Tailwind and silently drops, so they render the
  // light-mode slate-200/50 line in dark mode too — the visible white
  // edge requested. Matching the render, not the (broken) intent.
  'border border-slate-200/50 ' +
  'hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D]';

const SECTION_LABEL =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50';

/**
 * Task-level status overview in the drill-down style of the project one.
 *
 * Counts come from /api/dashboard/stats — server-side groupBy over every
 * task — and NOT from the fetched issues list. The list endpoint caps its
 * unpaginated response at 500 rows, so the old card, which counted that
 * array, froze at exactly 500 for any organization that grew past it and
 * read as "task creation stopped working". Aggregates don't page; they are
 * immune to the cap by construction.
 *
 * Drill-down items are fetched through the paginated path for the same
 * reason: page one of a status is a real page, not a slice of a capped dump.
 */
export function TaskStatusOverview({ projectId }: { projectId?: string | null }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<TaskStatus | null>(null);

  const statsUrl = projectId ? `/api/dashboard/stats?projectId=${projectId}` : '/api/dashboard/stats';
  // Same key and URL as the page's own stats query, so this deduplicates
  // against it in the react-query cache instead of doubling the request.
  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ['dashboard-stats', projectId ?? null],
    queryFn: async () => {
      const res = await fetch(statsUrl);
      if (!res.ok) throw new Error('Failed to load stats');
      return res.json();
    },
  });

  const total = data?.totalTasks ?? 0;
  const counts = useMemo(
    () =>
      STATUS_ORDER.map((s) => ({
        status: s,
        count: data?.statusBreakdown?.[s] ?? 0,
      })),
    [data],
  );
  const nonEmpty = useMemo(() => counts.filter((c) => c.count > 0), [counts]);

  const arcs = useMemo(() => {
    let consumed = 0;
    return nonEmpty.map((c) => {
      const length = total > 0 ? (c.count / total) * CIRCUMFERENCE : 0;
      const arc = {
        status: c.status,
        dash: nonEmpty.length === 1 ? length : Math.max(0, length - GAP),
        offset: -consumed,
      };
      consumed += length;
      return arc;
    });
  }, [nonEmpty, total]);

  // Items behind the selected band, first page only — the card is a doorway,
  // the issues page is the room.
  const { data: drill, isLoading: drillLoading } = useQuery<{ data?: IssueRow[]; issues?: IssueRow[] }>({
    queryKey: ['status-drill', selected, projectId ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ status: selected!, page: '1', limit: '8' });
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to load items');
      return res.json();
    },
    enabled: !!selected,
  });
  const drillItems: IssueRow[] = drill?.data ?? drill?.issues ?? [];

  const statusLabel = (s: TaskStatus) =>
    ({
      BACKLOG: t('status.backlog'),
      TODO: t('status.todo'),
      IN_PROGRESS: t('status.inProgress'),
      IN_REVIEW: t('status.inReview'),
      DONE: t('status.done'),
      BLOCKED: t('status.blocked'),
    })[s];

  const chosenCount = selected ? (data?.statusBreakdown?.[selected] ?? 0) : 0;
  const priorityMax = Math.max(
    1,
    ...PRIORITY_ROWS.map((r) => data?.priorityBreakdown?.[r.key] ?? 0),
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* ---------------- Donut + legend ---------------- */}
      <div className={CARD}>
        <h2 className={SECTION_LABEL}>{t('dashboard.statusOverview')}</h2>

        {isLoading && (
          <div className="flex h-44 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
        {error && (
          <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">
            {t('dashboard.statsError')}
          </p>
        )}

        {!isLoading && !error && (
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-[136px] w-[136px] shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={STROKE}
                  stroke="currentColor" className="text-slate-100 dark:text-white/[0.05]"
                />
                {arcs.map((a) => (
                  <circle
                    key={a.status}
                    cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={STROKE}
                    stroke={STATUS_COLOR[a.status]}
                    strokeDasharray={`${a.dash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={a.offset}
                    className={
                      'cursor-pointer transition-opacity duration-200 ' +
                      (selected && selected !== a.status ? 'opacity-20' : 'opacity-100')
                    }
                    onClick={() => setSelected((c) => (c === a.status ? null : a.status))}
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-bold leading-none text-slate-900 dark:text-white">
                  {total}
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                  {t('dashboard.totalItems')}
                </span>
              </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-0.5">
              {counts.map((c) => {
                const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                const isEmpty = c.count === 0;
                const isActive = selected === c.status;
                return (
                  <li key={c.status}>
                    <button
                      disabled={isEmpty}
                      aria-pressed={isActive}
                      onClick={() => setSelected((cur) => (cur === c.status ? null : c.status))}
                      className={
                        'flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition-colors ' +
                        (isEmpty
                          ? 'cursor-default opacity-40'
                          : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]') +
                        (isActive ? ' bg-slate-100 dark:bg-white/[0.07]' : '')
                      }
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_COLOR[c.status] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700 dark:text-white/80">
                        {statusLabel(c.status)}
                      </span>
                      <span className="w-[76px] shrink-0 text-right text-[13px] tabular-nums text-slate-500 dark:text-white/60">
                        {c.count} · {pct}%
                      </span>
                      <ChevronRight
                        className={
                          'h-3.5 w-3.5 shrink-0 transition-transform ' +
                          (isEmpty ? 'invisible' : 'text-slate-400 dark:text-white/30') +
                          (isActive ? ' rotate-90' : '')
                        }
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ---------------- Companion panel ---------------- */}
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={SECTION_LABEL}>
            {selected
              ? `${statusLabel(selected)} · ${chosenCount}`
              : t('dashboard.priorityBreakdown')}
          </h2>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-[11px] font-medium text-[#1C8C7D] hover:underline"
            >
              {t('common.clear')}
            </button>
          )}
        </div>
        <div
          className="mt-2 h-[3px] w-16 rounded-full transition-colors"
          style={{ backgroundColor: selected ? STATUS_COLOR[selected] : 'transparent' }}
        />

        {!selected && !isLoading && (
          <ul className="mt-4 space-y-3">
            {PRIORITY_ROWS.map((r) => {
              const v = data?.priorityBreakdown?.[r.key] ?? 0;
              return (
                <li key={r.key} className="flex items-center gap-3">
                  <span className="w-[84px] shrink-0 text-[12px] text-slate-600 dark:text-white/70">
                    {t(r.labelKey)}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <span
                      className="block h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${(v / priorityMax) * 100}%`, backgroundColor: r.color }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-[13px] font-medium tabular-nums text-slate-700 dark:text-white/80">
                    {v}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {selected && (
          <>
            {drillLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <ul className="mt-4 max-h-[220px] space-y-1 overflow-y-auto pr-1">
                {drillItems.map((it) => (
                  <li key={it.id}>
                    <button
                      onClick={() => router.push(`/dashboard/issues?taskId=${it.id}`)}
                      className="flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    >
                      <span className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-white/40">
                        {it.key}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-800 dark:text-white/85">
                        {it.title}
                      </span>
                      {it.dueDate && (
                        <span
                          className={
                            'shrink-0 text-[11px] tabular-nums ' +
                            (new Date(it.dueDate) < new Date()
                              ? 'text-red-500'
                              : 'text-slate-400 dark:text-white/35')
                          }
                        >
                          {new Date(it.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {chosenCount > drillItems.length && !drillLoading && (
              <p className="mt-2 text-[11px] text-slate-400 dark:text-white/35">
                {chosenCount - drillItems.length} {t('dashboard.moreOnIssuesPage')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
