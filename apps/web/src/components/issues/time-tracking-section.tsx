'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Clock, Loader2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface WorkLogEntry {
  id: string;
  minutes: number;
  workedOn: string;
  description: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; avatar: string | null };
}

/** "3h 20m" / "45m" — minutes are the stored truth, hours are presentation. */
function fmtMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Log and review time on a task.
 *
 * This is the writer tasks.time_spent never had: the field was shown on the
 * dashboard and accepted by the API, but no interface existed to enter it, so
 * the number never moved. Entries carry who, how long and which day —
 * separate hour and minute fields rather than a free-text duration, because
 * "1.5" meaning ninety minutes to one person and an hour and five to another
 * is exactly the ambiguity a recorded effort figure cannot afford.
 */
export function TimeTrackingSection({ taskId }: { taskId: string }) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const [hours, setHours] = useState('');
  const [mins, setMins] = useState('');
  const [workedOn, setWorkedOn] = useState(todayISO());
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ logs: WorkLogEntry[]; totalMinutes: number }>({
    queryKey: ['worklogs', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${taskId}/worklogs`);
      if (!res.ok) throw new Error('Failed to load work log');
      return res.json();
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['worklogs', taskId] });
    // The cached sum on the task changed too — anything showing timeSpent
    // (boards, dashboard, sprint views) is stale until refetched.
    queryClient.invalidateQueries({ queryKey: ['issues'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const logMutation = useMutation({
    mutationFn: async () => {
      const total = (parseInt(hours, 10) || 0) * 60 + (parseInt(mins, 10) || 0);
      if (total < 1) throw new Error(t('timeTracking.enterSomeTime'));
      const res = await fetch(`/api/issues/${taskId}/worklogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutes: total,
          workedOn,
          description: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('timeTracking.logFailed'));
      }
      return res.json();
    },
    onSuccess: () => {
      setHours('');
      setMins('');
      setNote('');
      setFormError(null);
      invalidate();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : t('timeTracking.logFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (workLogId: string) => {
      const res = await fetch(`/api/issues/${taskId}/worklogs`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workLogId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('timeTracking.deleteFailed'));
      }
      return res.json();
    },
    onSuccess: invalidate,
    onError: (err) =>
      setFormError(err instanceof Error ? err.message : t('timeTracking.deleteFailed')),
  });

  const inputCls =
    'rounded-md border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1B1F23] ' +
    'px-2 py-1.5 text-sm text-slate-900 dark:text-white ' +
    'focus:border-[#1C8C7D] focus:outline-none';

  return (
    <div className="border-t border-slate-200 dark:border-white/[0.08] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#1C8C7D]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50">
            {t('timeTracking.title')}
          </h3>
        </div>
        {data && data.totalMinutes > 0 && (
          <span className="text-sm font-medium tabular-nums text-slate-700 dark:text-white/80">
            {fmtMinutes(data.totalMinutes)} {t('timeTracking.logged')}
          </span>
        )}
      </div>

      {/* Entry form */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min={0}
          max={24}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder={t('timeTracking.hoursShort')}
          aria-label={t('timeTracking.hours')}
          className={inputCls + ' w-16'}
        />
        <input
          type="number"
          min={0}
          max={59}
          value={mins}
          onChange={(e) => setMins(e.target.value)}
          placeholder={t('timeTracking.minutesShort')}
          aria-label={t('timeTracking.minutes')}
          className={inputCls + ' w-16'}
        />
        <input
          type="date"
          value={workedOn}
          max={todayISO()}
          onChange={(e) => setWorkedOn(e.target.value)}
          aria-label={t('timeTracking.workedOn')}
          className={inputCls}
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('timeTracking.notePlaceholder')}
          maxLength={500}
          className={inputCls + ' min-w-[120px] flex-1'}
        />
        <button
          onClick={() => logMutation.mutate()}
          disabled={logMutation.isPending}
          className="rounded-md bg-[#1C8C7D] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#177567] disabled:opacity-50"
        >
          {logMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('timeTracking.logTime')
          )}
        </button>
      </div>

      {formError && <p className="mt-2 text-xs text-red-500">{formError}</p>}

      {/* Entries */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        </div>
      ) : data && data.logs.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-white/[0.06]">
          {data.logs.map((log) => (
            <li key={log.id} className="flex items-center gap-2.5 py-2">
              <span className="w-14 shrink-0 text-sm font-medium tabular-nums text-slate-800 dark:text-white/85">
                {fmtMinutes(log.minutes)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-white/60">
                {log.user.name || log.user.email}
                {log.description ? ` — ${log.description}` : ''}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-white/35">
                {new Date(log.workedOn).toLocaleDateString()}
              </span>
              {/* Server enforces author-only deletion; the button is hidden
                  for others so it cannot invite a guaranteed 403. */}
              {log.user.id === currentUserId && (
                <button
                  onClick={() => deleteMutation.mutate(log.id)}
                  disabled={deleteMutation.isPending}
                  aria-label={t('timeTracking.deleteEntry')}
                  className="shrink-0 rounded p-1 text-slate-300 transition-colors hover:text-red-500 dark:text-white/25 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400 dark:text-white/35">
          {t('timeTracking.noEntries')}
        </p>
      )}
    </div>
  );
}
