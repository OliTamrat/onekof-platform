'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface ApprovalState {
  requireApproval: boolean;
  status: string;
  approval: {
    approvedAt: string;
    approver: { id: string; name: string | null; email: string } | null;
  } | null;
}

/**
 * The board approval step: sign-off between review and completion.
 *
 * Renders only when it has something to say — an item in review, or an item
 * carrying an approval record. On every other task it returns null rather
 * than adding an empty section to the slideout.
 *
 * The approve button is shown to everyone with task access and the server
 * enforces the admin requirement; hiding it on a role guess would repeat the
 * project dialog's old mistake, where a silent 403 read as a broken control.
 * Here a 403 renders as its message.
 */
export function ApprovalSection({ taskId }: { taskId: string }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data } = useQuery<ApprovalState>({
    queryKey: ['approval', taskId],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${taskId}/approve`);
      if (!res.ok) throw new Error('Failed to load approval state');
      return res.json();
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['approval', taskId] });
    queryClient.invalidateQueries({ queryKey: ['issues'] });
  };

  const act = (method: 'POST' | 'DELETE') =>
    fetch(`/api/issues/${taskId}/approve`, { method }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('approval.actionFailed'));
      }
      return res.json();
    });

  const approveMutation = useMutation({
    mutationFn: () => act('POST'),
    onSuccess: () => { setActionError(null); invalidate(); },
    onError: (e) => setActionError(e instanceof Error ? e.message : t('approval.actionFailed')),
  });
  const revokeMutation = useMutation({
    mutationFn: () => act('DELETE'),
    onSuccess: () => { setActionError(null); invalidate(); },
    onError: (e) => setActionError(e instanceof Error ? e.message : t('approval.actionFailed')),
  });

  if (!data) return null;

  const inReview = data.status === 'IN_REVIEW';
  const approved = data.approval != null;

  // Nothing to show: not in review, no record, and the project does not use
  // approval anyway.
  if (!inReview && !approved) return null;

  return (
    <div className="border-t border-slate-200 dark:border-white/[0.08] px-4 py-4">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-[#1C8C7D]" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-white/50">
          {t('approval.title')}
        </h3>
      </div>

      <div className="mt-3">
        {approved ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="h-3.5 w-3.5" />
              {t('approval.approvedBy')}{' '}
              {data.approval!.approver?.name || data.approval!.approver?.email || '—'}
              {' · '}
              {new Date(data.approval!.approvedAt).toLocaleDateString()}
            </span>
            {inReview && (
              <button
                onClick={() => revokeMutation.mutate()}
                disabled={revokeMutation.isPending}
                className="text-xs font-medium text-slate-500 hover:text-red-500 dark:text-white/50 dark:hover:text-red-400"
              >
                {t('approval.revoke')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-white/60">
              {data.requireApproval
                ? t('approval.awaitingRequired')
                : t('approval.awaitingOptional')}
            </span>
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="rounded-md bg-[#1C8C7D] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#177567] disabled:opacity-50"
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('approval.approve')
              )}
            </button>
          </div>
        )}
        {actionError && <p className="mt-2 text-xs text-red-500">{actionError}</p>}
      </div>
    </div>
  );
}
