'use client';

/**
 * Create/Edit sprint modal + Start confirmation dialog.
 * House modal style comes from the Dialog primitives (bottom sheet on
 * mobile, centered on desktop, teal accent bar). All labels flow through
 * t() with the org's terminology noun ("Sprint" / "Work Cycle").
 */

import { useState } from 'react';
import { Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';
import { useTerminology } from '@/hooks/use-terminology';
import {
  Sprint,
  useCreateSprint,
  useUpdateSprint,
  useStartSprint,
  useDeleteSprint,
  useCompleteSprint,
} from './use-sprints';

const inputClass =
  'w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#181D23] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

export function SprintModal({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint | null; // null = create
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { sprintNoun } = useTerminology();
  const toast = useToast();
  const createMutation = useCreateSprint(projectId);
  const updateMutation = useUpdateSprint(projectId);

  const [name, setName] = useState(sprint?.name ?? '');
  const [goal, setGoal] = useState(sprint?.goal ?? '');
  const [startDate, setStartDate] = useState(sprint?.startDate?.slice(0, 10) ?? '');
  const [endDate, setEndDate] = useState(sprint?.endDate?.slice(0, 10) ?? '');

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const body = {
      name: name.trim(),
      goal: goal.trim() || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };
    try {
      if (sprint) {
        await updateMutation.mutateAsync({ sprintId: sprint.id, ...body });
        toast.success(t('sprints.updated', { noun: sprintNoun }));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(t('sprints.created', { noun: sprintNoun }));
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sprints.actionFailed'));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {sprint
              ? t('sprints.edit', { noun: sprintNoun })
              : t('sprints.create', { noun: sprintNoun })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
              {t('sprints.name')}
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('sprints.namePlaceholder', { noun: sprintNoun })}
              className={inputClass}
              maxLength={120}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
              {t('sprints.goal')}
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t('sprints.goalPlaceholder', { noun: sprintNoun })}
              className={`${inputClass} min-h-[72px] resize-y`}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
                {t('sprints.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
                {t('sprints.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pending || !name.trim()}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CompleteSprintDialog({
  projectId,
  sprint,
  otherSprints,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  /** PLANNED sprints in the same project — candidate rollover targets */
  otherSprints: Sprint[];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { sprintNoun } = useTerminology();
  const toast = useToast();
  const completeMutation = useCompleteSprint(projectId);
  const [rolloverTo, setRolloverTo] = useState<string>('backlog');

  const handleComplete = async () => {
    try {
      const result = await completeMutation.mutateAsync({ sprintId: sprint.id, rolloverTo });
      toast.success(
        t('sprints.completedToast', {
          noun: sprintNoun,
          done: result.sprint.completedCount ?? 0,
          rolled: result.rolledOver ?? 0,
        })
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sprints.actionFailed'));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sprints.complete', { noun: sprintNoun })}</DialogTitle>
          <DialogDescription>{t('sprints.completeHint')}</DialogDescription>
        </DialogHeader>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
            {t('sprints.rolloverLabel')}
          </label>
          <select
            value={rolloverTo}
            onChange={(e) => setRolloverTo(e.target.value)}
            className={inputClass}
          >
            <option value="backlog">{t('sprints.rolloverBacklog')}</option>
            {otherSprints
              .filter((s) => s.id !== sprint.id && s.status === 'PLANNED')
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={completeMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            {t('sprints.complete', { noun: sprintNoun })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSprintDialog({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { sprintNoun, sprintNounPlural } = useTerminology();
  const toast = useToast();
  const deleteMutation = useDeleteSprint(projectId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(sprint.id);
      toast.success(t('sprints.deleted', { noun: sprintNoun }));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('sprints.actionFailed'));
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sprints.deleteConfirmTitle', { noun: sprintNoun })}</DialogTitle>
          <DialogDescription>
            {t('sprints.deleteConfirmMessage', { nounPlural: sprintNounPlural })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StartSprintDialog({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { sprintNoun } = useTerminology();
  const toast = useToast();
  const updateMutation = useUpdateSprint(projectId);
  const startMutation = useStartSprint(projectId);

  // Prefill: existing dates, else today + 2 weeks (approved default)
  const today = new Date().toISOString().slice(0, 10);
  const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(sprint.startDate?.slice(0, 10) ?? today);
  const [endDate, setEndDate] = useState(sprint.endDate?.slice(0, 10) ?? twoWeeks);

  const pending = updateMutation.isPending || startMutation.isPending;
  // Empty sprints can't start — the commitment snapshot would be meaningless
  const isEmpty = sprint.taskCount === 0;

  const handleStart = async () => {
    try {
      await updateMutation.mutateAsync({
        sprintId: sprint.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      await startMutation.mutateAsync(sprint.id);
      toast.success(t('sprints.started', { noun: sprintNoun }));
      onClose();
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      toast.error(
        status === 409
          ? t('sprints.activeAlready', { noun: sprintNoun })
          : err instanceof Error
            ? err.message
            : t('sprints.actionFailed')
      );
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('sprints.start', { noun: sprintNoun })}</DialogTitle>
          <DialogDescription>
            {t('sprints.startHint', { noun: sprintNoun })}
          </DialogDescription>
        </DialogHeader>

        {isEmpty && (
          <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            {t('sprints.emptyStartBlocked', { noun: sprintNoun })}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
              {t('sprints.startDate')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-white/85">
              {t('sprints.endDate')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleStart}
            disabled={pending || isEmpty || !startDate || !endDate || endDate <= startDate}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {t('sprints.startNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
