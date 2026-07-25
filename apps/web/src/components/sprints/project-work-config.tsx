'use client';

/**
 * Work configuration card (Phase 4 of the Sprint & Settings architecture).
 *
 * The first real UI consumer of the ProjectSettings override layer: each
 * field shows its EFFECTIVE value plus whether it is inherited from the
 * organization or set on this project, applies changes immediately via
 * PATCH /api/projects/[id]/settings (server enforces project ADMIN+), and
 * offers "Use organization default" to restore inheritance (null override).
 * The transition matrix below is what workflow enforcement obeys.
 */

import { Workflow, Zap, Ruler } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';
import { useTerminology } from '@/hooks/use-terminology';
import { DEFAULT_TRANSITIONS, WORKFLOW_STATUSES } from '@/lib/workflow-engine';
import {
  useProjectSettings,
  useUpdateProjectSettings,
  ProjectSettingsOverrides,
} from './use-sprints';

function InheritBadge({
  overridden,
  onReset,
}: {
  overridden: boolean;
  onReset: () => void;
}) {
  const { t } = useLanguage();
  return overridden ? (
    <span className="flex items-center gap-2">
      <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:text-[#2BB5A2]">
        {t('projectSettings.overridden')}
      </span>
      <button
        type="button"
        onClick={onReset}
        className="text-[10px] text-gray-400 underline hover:text-gray-600 dark:hover:text-white/70"
      >
        {t('projectSettings.useOrgDefault')}
      </button>
    </span>
  ) : (
    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/[0.08] dark:text-white/50">
      {t('projectSettings.inherited')}
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] ${
        checked ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-white/[0.08]'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export function ProjectWorkConfig({ projectId }: { projectId: string }) {
  const { t } = useLanguage();
  const { sprintNoun } = useTerminology();
  const toast = useToast();
  const { data } = useProjectSettings(projectId);
  const updateMutation = useUpdateProjectSettings(projectId);

  if (!data) return null;
  const { overrides, effective } = data;

  const apply = async (patch: Partial<ProjectSettingsOverrides>) => {
    try {
      await updateMutation.mutateAsync(patch);
      toast.success(t('projectSettings.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('projectSettings.saveFailed'));
    }
  };

  const matrix = effective.workflowTransitions ?? DEFAULT_TRANSITIONS;
  const statusLabel = (id: string) =>
    t(`status.${id.toLowerCase().replace('_', '')}`) ||
    WORKFLOW_STATUSES.find((s) => s.id === id)?.label ||
    id;

  return (
    <div className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="h-5 w-5 text-[#1C8C7D]" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('projectSettings.workConfigTitle')}
        </h2>
      </div>

      <div className="space-y-5">
        {/* Sprint planning */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
              <Zap className="h-3.5 w-3.5 text-primary-500" />
              {t('projectSettings.sprintPlanning', { noun: sprintNoun })}
            </label>
            <div className="mt-1">
              <InheritBadge
                overridden={overrides.sprintsEnabled !== null}
                onReset={() => apply({ sprintsEnabled: null })}
              />
            </div>
          </div>
          <Toggle
            checked={effective.sprintsEnabled}
            onChange={() => apply({ sprintsEnabled: !effective.sprintsEnabled })}
          />
        </div>

        {/* Estimation unit */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
              <Ruler className="h-3.5 w-3.5 text-primary-500" />
              {t('projectSettings.estimationUnit')}
            </label>
            <div className="mt-1">
              <InheritBadge
                overridden={overrides.estimationUnit !== null}
                onReset={() => apply({ estimationUnit: null })}
              />
            </div>
          </div>
          <select
            value={effective.estimationUnit}
            onChange={(e) => apply({ estimationUnit: e.target.value as 'HOURS' | 'POINTS' })}
            className="h-8 rounded-md border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0E11] px-2 text-sm text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none"
          >
            <option value="HOURS">{t('projectSettings.hours')}</option>
            <option value="POINTS">{t('projectSettings.points')}</option>
          </select>
        </div>

        {/* Workflow enforcement */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t('projectSettings.workflowEnforcement')}
            </label>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-white/70">
              {t('projectSettings.workflowEnforcementHint')}
            </p>
            <div className="mt-1">
              <InheritBadge
                overridden={overrides.enforceWorkflow !== null}
                onReset={() => apply({ enforceWorkflow: null })}
              />
            </div>
          </div>
          <Toggle
            checked={effective.enforceWorkflow}
            onChange={() => apply({ enforceWorkflow: !effective.enforceWorkflow })}
          />
        </div>

        {/* Transition matrix (read-only view) */}
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('projectSettings.transitionMatrix')}
          </h3>
          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-white/[0.08] dark:bg-[#181D23]">
                  <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('projectSettings.fromStatus')}
                  </th>
                  <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/50">
                    {t('projectSettings.toStatuses')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {WORKFLOW_STATUSES.map((s) => (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className="mr-2 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-gray-900 dark:text-white">{statusLabel(s.id)}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-white/70">
                      {(matrix[s.id] || []).map(statusLabel).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
