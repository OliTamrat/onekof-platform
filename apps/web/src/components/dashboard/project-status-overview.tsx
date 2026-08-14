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
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Gap between segments so adjacent bands stay visually distinct. */
const GAP = 1.5;

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
 * Project delivery health, for leaders who track projects rather than tasks.
 *
 * Laid out as a donut plus a companion detail panel rather than an inline
 * expander: selecting a band swaps what the panel shows, so the reader's eye
 * stays in one place instead of the legend reflowing underneath the cursor.
 * With nothing selected the panel carries the portfolio-wide work breakdown,
 * so the space is never empty.
 */
export function ProjectStatusOverview() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ProjectHealth | null>(null);

  const { data, isLoading, error } = useQuery<{ total: number; segments: Segment[] }>({
    queryKey: ['project-status-overview'],
    queryFn: async () => {
      const res = await fetch('/api/projects/status-overview');
      if (!res.ok) throw new Error('Failed to load project status');
      return res.json();
    },
  });

  const total = data?.total ?? 0;

  // Preserve the worst-first order from the server rather than whatever order
  // the response happened to arrive in, and fill absent bands with zeroes.
  const segments = useMemo(
    () =>
      HEALTH_ORDER.map(
        (h) => data?.segments.find((s) => s.health === h) ?? { health: h, count: 0, projects: [] },
      ),
    [data],
  );

  const nonEmpty = useMemo(() => segments.filter((s) => s.count > 0), [segments]);

  /** Arc offsets accumulated in order so segments sit adjacent around the ring. */
  const arcs = useMemo(() => {
    let consumed = 0;
    return nonEmpty.map((s) => {
      const length = total > 0 ? (s.count / total) * CIRCUMFERENCE : 0;
      const arc = {
        health: s.health,
        // Shrink each arc by the gap so neighbours do not touch — except when
        // one band is the whole ring, where a gap would read as a stray notch.
        dash: nonEmpty.length === 1 ? length : Math.max(0, length - GAP),
        offset: -consumed,
      };
      consumed += length;
      return arc;
    });
  }, [nonEmpty, total]);

  /** Portfolio-wide work totals, shown when no band is selected. */
  const portfolio = useMemo(() => {
    const all = segments.flatMap((s) => s.projects);
    const sum = (pick: (p: ProjectSummary) => number) => all.reduce((n, p) => n + pick(p), 0);
    const items = sum((p) => p.metrics.total);
    const done = sum((p) => p.metrics.done);
    const overdue = sum((p) => p.metrics.overdue);
    const blocked = sum((p) => p.metrics.blocked);
    return {
      items,
      rows: [
        { label: t('dashboard.itemsComplete'), value: done, color: HEALTH_COLOR.COMPLETE },
        { label: t('dashboard.itemsOverdue'), value: overdue, color: HEALTH_COLOR.OFF_TRACK },
        { label: t('dashboard.itemsBlocked'), value: blocked, color: HEALTH_COLOR.BLOCKED },
        {
          label: t('dashboard.itemsRemaining'),
          // Remaining excludes overdue and blocked so the four rows partition
          // the work rather than double-counting an item that is both.
          value: Math.max(0, items - done - overdue - blocked),
          color: HEALTH_COLOR.NOT_STARTED,
        },
      ],
    };
  }, [segments, t]);

  const chosen = selected ? segments.find((s) => s.health === selected) : null;
  const barMax = Math.max(1, ...portfolio.rows.map((r) => r.value));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* ---------------- Donut + legend ---------------- */}
      <div className={CARD}>
        <h2 className={SECTION_LABEL}>{t('dashboard.projectStatusOverview')}</h2>

        {isLoading && (
          <div className="flex h-44 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">
            {t('dashboard.projectStatusError')}
          </p>
        )}

        {!isLoading && !error && total === 0 && (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-white/50">
            {t('dashboard.noProjectsYet')}
          </p>
        )}

        {!isLoading && !error && total > 0 && (
          <>
            <div className="mt-4 flex items-center gap-5">
              {/* Donut */}
              <div className="relative h-[136px] w-[136px] shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-white/[0.05]"
                  />
                  {arcs.map((a) => (
                    <circle
                      key={a.health}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      strokeWidth={STROKE}
                      stroke={HEALTH_COLOR[a.health]}
                      strokeDasharray={`${a.dash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={a.offset}
                      className={
                        'cursor-pointer transition-opacity duration-200 ' +
                        (selected && selected !== a.health ? 'opacity-20' : 'opacity-100')
                      }
                      onClick={() => setSelected((c) => (c === a.health ? null : a.health))}
                    />
                  ))}
                </svg>
                {/* pointer-events-none so the label never swallows a segment click */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[26px] font-bold leading-none text-slate-900 dark:text-white">
                    {total}
                  </span>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-white/50">
                    {t('dashboard.projects')}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <ul className="min-w-0 flex-1 space-y-0.5">
                {segments.map((s) => {
                  const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                  const isEmpty = s.count === 0;
                  const isActive = selected === s.health;
                  return (
                    <li key={s.health}>
                      <button
                        disabled={isEmpty}
                        aria-pressed={isActive}
                        onClick={() => setSelected((c) => (c === s.health ? null : s.health))}
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
                          style={{ backgroundColor: HEALTH_COLOR[s.health] }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700 dark:text-white/80">
                          {HEALTH_LABEL[s.health]}
                        </span>
                        {/* Fixed-width, tabular figures so the value column
                            aligns down the list regardless of digit count. */}
                        <span className="w-[68px] shrink-0 text-right text-[13px] tabular-nums text-slate-500 dark:text-white/60">
                          {s.count} · {pct}%
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

            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400 dark:border-white/[0.06] dark:text-white/35">
              {t('dashboard.projectStatusFootnote')}
            </p>
          </>
        )}
      </div>

      {/* ---------------- Companion detail panel ---------------- */}
      <div className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={SECTION_LABEL}>
            {chosen
              ? `${t('dashboard.projectsThatAre')} ${HEALTH_LABEL[chosen.health].toLowerCase()}`
              : t('dashboard.workAcrossProjects')}
          </h2>
          {chosen && (
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-[11px] font-medium text-[#1C8C7D] hover:underline"
            >
              {t('common.clear')}
            </button>
          )}
        </div>

        {/* Accent rule in the selected band's colour, tying panel to segment. */}
        <div
          className="mt-2 h-[3px] w-16 rounded-full transition-colors"
          style={{
            backgroundColor: chosen ? HEALTH_COLOR[chosen.health] : 'transparent',
          }}
        />

        {isLoading && (
          <div className="flex h-44 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && !error && !chosen && (
          <>
            <ul className="mt-4 space-y-3">
              {portfolio.rows.map((r) => (
                <li key={r.label} className="flex items-center gap-3">
                  <span className="w-[104px] shrink-0 text-[12px] text-slate-600 dark:text-white/70">
                    {r.label}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <span
                      className="block h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${(r.value / barMax) * 100}%`,
                        backgroundColor: r.color,
                      }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-[13px] font-medium tabular-nums text-slate-700 dark:text-white/80">
                    {r.value}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400 dark:border-white/[0.06] dark:text-white/35">
              {t('dashboard.workBreakdownFootnote')}
            </p>
          </>
        )}

        {!isLoading && chosen && (
          <ul className="mt-4 max-h-[220px] space-y-1 overflow-y-auto pr-1">
            {chosen.projects.map((p) => {
              const pct = Math.round(p.metrics.percentComplete * 100);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="shrink-0 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-white/40">
                        {p.key}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-slate-800 dark:text-white/85">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-[12px] tabular-nums text-slate-500 dark:text-white/55">
                        {pct}%
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: HEALTH_COLOR[p.health],
                          }}
                        />
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400 dark:text-white/40">
                        {p.isOverridden ? t('dashboard.setManually') : p.reason}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
