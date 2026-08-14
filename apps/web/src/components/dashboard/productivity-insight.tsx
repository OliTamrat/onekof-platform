'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gauge, Loader2, Sparkles, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import {
  CARD_ICON_CHIP,
  CARD_SUBTITLE,
  CARD_SURFACE,
  CARD_TITLE,
} from '@/components/ui/card-surface';

interface Bucket {
  key: string;
  label: string;
  minutes: number;
  share: number;
  measuredShare: number;
}

interface Stats {
  periodDays: number;
  totalMinutes: number;
  measuredShare: number;
  changePct: number | null;
  activeDays: number;
  contributors: number;
  projects: Bucket[];
  types: Bucket[];
  people: Bucket[];
  personBreakdownRestricted: boolean;
  estimateVsActual: { compared: number; overrun: number; overrunShare: number };
  completedCoverage: { completed: number; withLoggedTime: number; share: number };
}

interface Response {
  summary: string | null;
  stats: Stats;
  empty?: boolean;
  aiUnavailable?: boolean;
}

const PERIODS = [7, 30, 90];

function fmtHours(minutes: number): string {
  const h = minutes / 60;
  if (h >= 100) return `${Math.round(h)}h`;
  return `${h.toFixed(1)}h`;
}

/**
 * Where the hours went, and what an AI reading of them suggests.
 *
 * The figures come from the server as figures; the model is given those and
 * asked to interpret, never to count. So the numbers on this card and the
 * numbers in a report cannot disagree — there is only one arithmetic.
 *
 * The measured share is displayed beside every total on purpose. It is the
 * card's own health warning: a productivity summary drawn mostly from typed
 * time is worth reading, but it is not a measurement, and a reader deserves
 * to see which one they are looking at without opening the entries.
 */
export function ProductivityInsight({ projectId }: { projectId?: string | null }) {
  const { t } = useLanguage();
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery<Response>({
    queryKey: ['productivity-summary', days, projectId ?? null],
    queryFn: async () => {
      const params = new URLSearchParams({ days: String(days) });
      if (projectId) params.set('projectId', projectId);
      const res = await fetch(`/api/ai/productivity-summary?${params}`);
      if (!res.ok) throw new Error('Failed to load productivity summary');
      return res.json();
    },
    // The narrative costs a model call; don't regenerate it on every focus.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const s = data?.stats;

  return (
    <div className={CARD_SURFACE + ' p-6'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={CARD_ICON_CHIP}
            style={{ backgroundColor: 'rgba(28,140,125,0.1)', color: '#1C8C7D' }}
          >
            <Gauge className="h-4 w-4" />
          </span>
          <h2 className={CARD_TITLE}>{t('productivity.title')}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              className={
                'rounded-md px-2 py-1 text-xs font-medium transition-colors ' +
                (days === p
                  ? 'bg-[#1C8C7D] text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/[0.06]')
              }
            >
              {t('productivity.lastDays').replace('{n}', String(p))}
            </button>
          ))}
        </div>
      </div>
      <p className={CARD_SUBTITLE + ' mt-1.5'}>{t('productivity.subtitle')}</p>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}
      {error && (
        <p className="py-10 text-center text-sm text-red-600 dark:text-red-400">
          {t('productivity.loadError')}
        </p>
      )}

      {s && !isLoading && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label={t('productivity.totalLogged')} value={fmtHours(s.totalMinutes)} />
            <Figure
              label={t('productivity.measured')}
              value={`${s.measuredShare}%`}
              hint={<Timer className="h-3 w-3" />}
              tone={s.measuredShare >= 50 ? 'good' : 'warn'}
            />
            <Figure
              label={t('productivity.vsPrevious')}
              value={s.changePct === null ? '—' : `${s.changePct >= 0 ? '+' : ''}${s.changePct}%`}
            />
            <Figure
              label={t('productivity.overEstimate')}
              value={s.estimateVsActual.compared > 0 ? `${s.estimateVsActual.overrunShare}%` : '—'}
            />
          </div>

          {/* The card's own health warning — see the component note. */}
          {s.totalMinutes > 0 && s.measuredShare < 50 && (
            <p className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              {t('productivity.mostlySelfReported')}
            </p>
          )}

          {data.empty ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-white/50">
              {t('productivity.noTimeLogged')}
            </p>
          ) : (
            <>
              <Breakdown title={t('productivity.byProject')} rows={s.projects.slice(0, 5)} t={t} />
              {s.people.length > 0 && (
                <Breakdown
                  title={
                    s.personBreakdownRestricted
                      ? t('productivity.yourTime')
                      : t('productivity.byPerson')
                  }
                  rows={s.people.slice(0, 5)}
                  t={t}
                />
              )}

              {data.summary && (
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[#1C8C7D]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('productivity.aiReading')}
                  </div>
                  <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-white/75">
                    {data.summary.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              )}
              {data.aiUnavailable && (
                <p className="mt-4 text-xs text-slate-400 dark:text-white/35">
                  {t('productivity.aiUnavailable')}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Figure({
  label, value, hint, tone,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  tone?: 'good' | 'warn';
}) {
  const colour =
    tone === 'warn'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'good'
        ? 'text-[#1C8C7D]'
        : 'text-slate-900 dark:text-white';
  return (
    <div>
      <div className={`flex items-center gap-1 text-xl font-semibold tabular-nums ${colour}`}>
        {hint}
        {value}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-slate-500 dark:text-white/45">
        {label}
      </div>
    </div>
  );
}

function Breakdown({
  title, rows, t,
}: {
  title: string;
  rows: Bucket[];
  t: (k: string) => string;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50">
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {rows.map((b) => (
          <li key={b.key} className="flex items-center gap-3">
            <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700 dark:text-white/80">
              {b.label}
            </span>
            <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
              <span
                className="block h-full rounded-full bg-[#1C8C7D]"
                style={{ width: `${b.share}%` }}
              />
            </span>
            <span className="w-20 shrink-0 text-right text-[13px] tabular-nums text-slate-600 dark:text-white/60">
              {fmtHours(b.minutes)}
            </span>
            {/* Per row, because one project can be well measured while
                another is entirely recalled. */}
            <span
              title={t('productivity.measuredShareHint')}
              className="w-12 shrink-0 text-right text-[11px] tabular-nums text-slate-400 dark:text-white/35"
            >
              {b.measuredShare}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
