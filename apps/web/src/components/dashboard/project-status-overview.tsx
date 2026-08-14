'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { ProjectHealth } from '@onekof/database';
import { HEALTH_COLOR, HEALTH_LABEL, HEALTH_ORDER } from '@/lib/project-health';
import { useLanguage } from '@/contexts/language-context';

interface ProjectSummary {
  id: string;
  name: string;
  key: string;
  color: string | null;
  health: ProjectHealth;
  isOverridden: boolean;
  reason: string;
  metrics: {
    total: number;
    done: number;
    blocked: number;
    overdue: number;
    percentComplete: number;
  };
}

interface Segment {
  health: ProjectHealth;
  count: number;
  projects: ProjectSummary[];
}

/** Donut geometry, in the 100×100 viewBox the SVG below uses. */
const RADIUS = 35;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Gap between segments, in the same units, so bands stay visually distinct. */
const GAP = 1.5;

/**
 * Project delivery health, for leaders who track projects rather than tasks.
 *
 * Sits below the existing task-level Status Overview and answers the question
 * that one cannot: not "how many items are in progress" but "which projects
 * are in trouble". Every band is clickable and drills through to the projects
 * behind it.
 */
export function ProjectStatusOverview() {
  const router = useRouter();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<ProjectHealth | null>(null);

  const { data, isLoading, error } = useQuery<{ total: number; segments: Segment[] }>({
    queryKey: ['project-status-overview'],
    queryFn: async () => {
      const res = await fetch('/api/projects/status-overview');
      if (!res.ok) throw new Error('Failed to load project status');
      return res.json();
    },
  });

  const total = data?.total ?? 0;
  const segments = useMemo(
    () =>
      // Preserve the worst-first order from the server rather than whatever
      // order the fetch happened to produce.
      HEALTH_ORDER.map(
        (h) => data?.segments.find((s) => s.health === h) ?? { health: h, count: 0, projects: [] },
      ),
    [data],
  );

  /**
   * Arc offsets, accumulated in declaration order so segments sit adjacent.
   * Only non-empty bands consume arc; empty ones still render in the legend.
   */
  const arcs = useMemo(() => {
    let consumed = 0;
    return segments
      .filter((s) => s.count > 0)
      .map((s) => {
        const length = total > 0 ? (s.count / total) * CIRCUMFERENCE : 0;
        const arc = {
          health: s.health,
          // Shrink each arc by the gap so neighbours do not touch. Guard
          // against a single-segment donut, where subtracting the gap from a
          // full circle would leave a visible notch for no reason.
          dash: segments.filter((x) => x.count > 0).length === 1
            ? length
            : Math.max(0, length - GAP),
          offset: -consumed,
        };
        consumed += length;
        return arc;
      });
  }, [segments, total]);

  const handleDrill = (health: ProjectHealth, count: number) => {
    if (count === 0) return;
    setExpanded((cur) => (cur === health ? null : health));
  };

  return (
    <div className="rounded-xl border border-slate-200/50 dark:border-white/[0.08] bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] p-6 shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
          {t('dashboard.projectStatusOverview')}
        </h2>
        {expanded && (
          <button
            onClick={() => setExpanded(null)}
            className="text-xs font-medium text-[#1C8C7D] hover:underline"
          >
            {t('common.clear')}
          </button>
        )}
      </div>
      <p className="mb-5 text-sm text-slate-600 dark:text-white/60">
        {t('dashboard.projectStatusDescription')}
      </p>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}

      {error && (
        <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">
          {t('dashboard.projectStatusError')}
        </p>
      )}

      {!isLoading && !error && total === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-white/50">
          {t('dashboard.noProjectsYet')}
        </p>
      )}

      {!isLoading && !error && total > 0 && (
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Donut */}
          <div className="relative h-40 w-40 shrink-0 self-center md:self-start">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                strokeWidth="14"
                className="text-slate-200 dark:text-white/[0.06]"
                stroke="currentColor"
              />
              {arcs.map((a) => (
                <circle
                  key={a.health}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="14"
                  stroke={HEALTH_COLOR[a.health]}
                  strokeDasharray={`${a.dash} ${CIRCUMFERENCE}`}
                  strokeDashoffset={a.offset}
                  strokeLinecap="butt"
                  className={
                    'cursor-pointer transition-opacity ' +
                    (expanded && expanded !== a.health ? 'opacity-25' : 'opacity-100')
                  }
                  onClick={() =>
                    handleDrill(
                      a.health,
                      segments.find((s) => s.health === a.health)?.count ?? 0,
                    )
                  }
                />
              ))}
            </svg>
            {/* Centre total. pointer-events-none so it never blocks a segment. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-white/50">
                {t('dashboard.projects')}
              </span>
            </div>
          </div>

          {/* Legend */}
          <ul className="flex-1 space-y-1.5">
            {segments.map((s) => {
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              const isEmpty = s.count === 0;
              const isActive = expanded === s.health;
              return (
                <li key={s.health}>
                  <button
                    disabled={isEmpty}
                    onClick={() => handleDrill(s.health, s.count)}
                    aria-expanded={isActive}
                    className={
                      'group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ' +
                      (isEmpty
                        ? 'cursor-default opacity-40'
                        : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04]') +
                      (isActive ? ' bg-slate-100 dark:bg-white/[0.06]' : '')
                    }
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: HEALTH_COLOR[s.health] }}
                    />
                    <span className="flex-1 truncate text-sm text-slate-700 dark:text-white/80">
                      {HEALTH_LABEL[s.health]}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-white/60">
                      {s.count} · {pct}%
                    </span>
                    {!isEmpty && (
                      <ChevronRight
                        className={
                          'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ' +
                          (isActive ? 'rotate-90' : '')
                        }
                      />
                    )}
                  </button>

                  {/* Drill-down */}
                  {isActive && (
                    <ul className="mb-1 ml-6 mt-1 space-y-0.5 border-l border-slate-200 pl-3 dark:border-white/10">
                      {s.projects.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => router.push(`/projects/${p.id}`)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                          >
                            <span className="flex-1 truncate text-xs text-slate-700 dark:text-white/75">
                              <span className="font-medium">{p.key}</span> {p.name}
                            </span>
                            <span
                              className="shrink-0 text-[10px] text-slate-400 dark:text-white/40"
                              title={p.reason}
                            >
                              {p.isOverridden ? t('dashboard.setManually') : p.reason}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
