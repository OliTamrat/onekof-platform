'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, Flame, Timer, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { CARD_ICON_CHIP, CARD_SURFACE } from '@/components/ui/card-surface';

interface Performance {
  periodDays: number;
  completed: { count: number; previousCount: number; changePct: number | null };
  onTime: { rated: number; onTimeCount: number; lateCount: number; rate: number; hasData: boolean };
  time: { totalMinutes: number; measuredMinutes: number; measuredShare: number; previousMinutes: number; changePct: number | null };
  streak: { activeDays: number; currentStreak: number };
}

const PERIODS = [7, 30, 90];

function fmtHours(minutes: number): string {
  const h = minutes / 60;
  if (h >= 100) return `${Math.round(h)}h`;
  return `${h.toFixed(1)}h`;
}

/**
 * A person's own read on their own work — completion, on-time delivery,
 * hours logged and a day-streak. Scoped to the caller only: there is no
 * "view someone else's" mode, on purpose (see the API route's own note).
 * The same numbers are feedback for the person they describe and a
 * management report for anyone else — this component is only ever the
 * first one.
 */
export function PersonalPerformance() {
  const { t } = useLanguage();
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery<Performance>({
    queryKey: ['my-performance', days],
    queryFn: async () => {
      const res = await fetch(`/api/me/performance?days=${days}`);
      if (!res.ok) throw new Error('Failed to load performance');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div className={CARD_SURFACE + ' animate-pulse p-4'}>
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-white/[0.08]" />
      </div>
    );
  }

  return (
    <div className={CARD_SURFACE + ' p-4'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={CARD_ICON_CHIP} style={{ backgroundColor: 'rgba(28,140,125,0.1)', color: '#1C8C7D' }}>
            <TrendingUp className="h-4 w-4" />
          </span>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50">
            {t('myWork.yourPerformance')}
          </h2>
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

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          value={String(data.completed.count)}
          label={t('myWork.completed')}
          trend={data.completed.changePct}
        />
        <Tile
          icon={<Clock className="h-3.5 w-3.5" />}
          value={data.onTime.hasData ? `${data.onTime.rate}%` : '—'}
          label={t('myWork.onTime')}
          hint={data.onTime.hasData ? undefined : t('myWork.onTimeNoData')}
        />
        <Tile
          icon={<Timer className="h-3.5 w-3.5" />}
          value={fmtHours(data.time.totalMinutes)}
          label={t('myWork.hoursLogged')}
          trend={data.time.changePct}
          hint={data.time.totalMinutes > 0 ? `${data.time.measuredShare}% ${t('productivity.measured').toLowerCase()}` : undefined}
        />
        <Tile
          icon={<Flame className="h-3.5 w-3.5" />}
          value={String(data.streak.currentStreak)}
          label={t('myWork.dayStreak')}
          hint={data.streak.currentStreak === 0 ? t('myWork.streakNone') : undefined}
        />
      </div>
    </div>
  );
}

function Tile({
  icon, value, label, trend, hint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: number | null;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/40">
        {icon}
        {trend != null && (
          <span className={trend >= 0 ? 'text-[11px] text-emerald-500' : 'text-[11px] text-red-500'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{value}</div>
      <div className="text-[11px] text-slate-500 dark:text-white/45">{label}</div>
      {hint && <div className="text-[10px] text-slate-400 dark:text-white/30">{hint}</div>}
    </div>
  );
}
