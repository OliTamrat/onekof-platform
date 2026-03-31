'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface CreateIssueModalProps {
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: string;
}

export function CreateIssueModal({ onClose, defaultProjectId, defaultStatus }: CreateIssueModalProps) {
  const { t } = useLanguage();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('TASK');
  const [status, setStatus] = useState<string>(defaultStatus || 'TODO');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || '');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedWatchers, setSelectedWatchers] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [estimate, setEstimate] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);

  const queryClient = useQueryClient();

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
  });

  const { data: membersData } = useQuery({
    queryKey: ['organization-members'],
    queryFn: async () => {
      const res = await fetch('/api/organizations/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !projectId) {
      toast.warning(t('errors.missingFields'), t('errors.pleaseProvideTitle'));
      return;
    }

    createIssueMutation.mutate({
      title,
      description: description || undefined,
      type,
      status,
      priority,
      projectId,
      assigneeId: assigneeId || undefined,
      teamId: teamId || undefined,
      goalIds: selectedGoals.length > 0 ? selectedGoals : undefined,
      watchers: selectedWatchers.length > 0 ? selectedWatchers : undefined,
      dueDate: dueDate || undefined,
      estimate: estimate ? parseInt(estimate) : undefined,
    });
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleWatcher = (userId: string) => {
    setSelectedWatchers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectedProject = projectsData?.projects?.find((p: any) => p.id === projectId);

  const inputClasses = 'w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-[#1C8C7D] focus:ring-1 focus:ring-[#1C8C7D] focus:outline-none transition-colors';

  const labelClasses = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-xl bg-white shadow-2xl dark:bg-[#22272B] border border-transparent sm:border-slate-200/80 dark:sm:border-white/[0.08]">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Teal accent — desktop */}
        <div className="hidden sm:block h-[3px] w-full bg-gradient-to-r from-[#1C8C7D] to-[#1C8C7D]/60" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            {selectedProject && (
              <div
                className="hidden sm:flex h-8 w-8 rounded-lg items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: selectedProject.color || '#1C8C7D' }}
              >
                {selectedProject.key?.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {t('commandPalette.createNewIssue')}
              </h2>
              {selectedProject && (
                <p className="text-xs text-gray-500 dark:text-slate-500 truncate">{selectedProject.name}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 flex-shrink-0 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95 dark:hover:bg-white/[0.06] dark:hover:text-gray-300 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(95vh-140px)] sm:max-h-[calc(85vh-140px)] overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Essential fields — always visible */}
          <div className="space-y-4">
            {/* Project */}
            <div>
              <label className={labelClasses}>
                {t('common.project')} <span className="text-red-500">*</span>
              </label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClasses} required>
                <option value="">{t('common.project')}...</option>
                {projectsData?.projects?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className={labelClasses}>
                {t('common.title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClasses}
                placeholder={t('common.title')}
                required
                autoFocus
              />
            </div>

            {/* Type + Priority — compact row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>{t('common.type')}</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClasses}>
                  <option value="TASK">Task</option>
                  <option value="STORY">Story</option>
                  <option value="BUG">Bug</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>{t('common.priority')}</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClasses}>
                  <option value="HIGHEST">{t('priority.highest')}</option>
                  <option value="HIGH">{t('priority.high')}</option>
                  <option value="MEDIUM">{t('priority.medium')}</option>
                  <option value="LOW">{t('priority.low')}</option>
                  <option value="LOWEST">{t('priority.lowest')}</option>
                </select>
              </div>
            </div>

            {/* Status + Assignee — compact row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>{t('common.status')}</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses}>
                  <option value="TODO">{t('status.todo')}</option>
                  <option value="IN_PROGRESS">{t('status.inProgress')}</option>
                  <option value="IN_REVIEW">{t('status.inReview')}</option>
                  <option value="DONE">{t('status.done')}</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>{t('common.assignee')}</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClasses}>
                  <option value="">{t('common.unassigned')}</option>
                  {membersData?.members?.map((member: any) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.name || member.user?.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* More fields — collapsible */}
          <button
            type="button"
            onClick={() => setShowMoreFields(!showMoreFields)}
            className="flex items-center gap-2 text-sm font-medium text-[#1C8C7D] hover:text-[#167A6E] transition-colors w-full py-2"
          >
            {showMoreFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showMoreFields ? t('common.lessFields') || 'Less fields' : t('common.moreFields') || 'More fields'}
          </button>

          <div className={cn(
            'space-y-4 overflow-hidden transition-all duration-300 ease-in-out',
            showMoreFields ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            {/* Description */}
            <div>
              <label className={labelClasses}>{t('common.description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={inputClasses}
                placeholder={t('tasks.addDescription')}
              />
            </div>

            {/* Team + Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>{t('goals.team')}</label>
                <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={inputClasses}>
                  <option value="">{t('common.none')}</option>
                  {teamsData?.teams?.map((team: any) => (
                    <option key={team.id} value={team.id}>
                      {team.icon} {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>{t('common.dueDate')}</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClasses} />
              </div>
            </div>

            {/* Estimate */}
            <div className="w-1/2">
              <label className={labelClasses}>Estimate</label>
              <input type="number" value={estimate} onChange={(e) => setEstimate(e.target.value)} className={inputClasses} placeholder="0" min="0" />
            </div>

            {/* Goals */}
            <div>
              <label className={labelClasses}>{t('nav.goals')}</label>
              <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#1B1F23] p-3">
                {goalsData?.goals?.length > 0 ? (
                  goalsData.goals.map((goal: any) => (
                    <label key={goal.id} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal.id)}
                        onChange={() => toggleGoal(goal.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1C8C7D] focus:ring-[#1C8C7D]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{goal.title}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">{t('emptyStates.noGoals')}</p>
                )}
              </div>
            </div>

            {/* Watchers */}
            <div>
              <label className={labelClasses}>Watchers</label>
              <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#1B1F23] p-3">
                {membersData?.members?.length > 0 ? (
                  membersData.members.map((member: any) => (
                    <label key={member.userId} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={selectedWatchers.includes(member.userId)}
                        onChange={() => toggleWatcher(member.userId)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1C8C7D] focus:ring-[#1C8C7D]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {member.user?.name || member.user?.email}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">{t('common.noResults')}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-slate-700/50 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 dark:bg-[#1B1F23]/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-white/[0.06]"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createIssueMutation.isPending || !title.trim() || !projectId}
            className="h-10 rounded-lg bg-[#1C8C7D] text-white hover:bg-[#167A6E] disabled:opacity-50 gap-2"
          >
            {createIssueMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createIssueMutation.isPending ? t('common.creating') : t('nav.createIssue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
