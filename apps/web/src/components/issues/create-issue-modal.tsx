'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';
import { Button } from '@/components/ui/button';

interface CreateIssueModalProps {
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: string;
}

export function CreateIssueModal({ onClose, defaultProjectId, defaultStatus }: CreateIssueModalProps) {
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

  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  // Fetch teams
  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      return res.json();
    },
  });

  // Fetch goals
  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    },
  });

  // Fetch organization members for assignee and watchers
  const { data: membersData } = useQuery({
    queryKey: ['organization-members'],
    queryFn: async () => {
      const res = await fetch('/api/organizations/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });

  // Create issue mutation
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
      toast.warning('Missing fields', 'Please provide a title and select a project');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-[#22272B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Issue
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#282E33] dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-140px)] overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="sm:col-span-2 space-y-4">
              {/* Project (Required) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
                  required
                >
                  <option value="">Select a project</option>
                  {projectsData?.projects?.map((project: any) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title (Required) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
                  placeholder="Enter issue title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
                  placeholder="Add a detailed description..."
                />
              </div>
            </div>

            {/* Type, Status, Priority Row */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              >
                <option value="TASK">✓ Task</option>
                <option value="STORY">📖 Story</option>
                <option value="BUG">🐛 Bug</option>
                <option value="EPIC">⚡ Epic</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              >
                <option value="HIGHEST">⬆️ Highest</option>
                <option value="HIGH">🔺 High</option>
                <option value="MEDIUM">➡️ Medium</option>
                <option value="LOW">🔻 Low</option>
                <option value="LOWEST">⬇️ Lowest</option>
              </select>
            </div>

            {/* Assignee & Team */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              >
                <option value="">Unassigned</option>
                {membersData?.members?.map((member: any) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user?.name || member.user?.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Assignment */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              >
                <option value="">No team</option>
                {teamsData?.teams?.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.icon} {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date & Estimate */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimate (hours)
              </label>
              <input
                type="number"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-700 dark:bg-[#282E33] dark:text-white"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Goals Linking */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Link to Goals/OKRs
              </label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-slate-700 dark:bg-[#282E33]">
                {goalsData?.goals?.length > 0 ? (
                  goalsData.goals.map((goal: any) => (
                    <label key={goal.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal.id)}
                        onChange={() => toggleGoal(goal.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {goal.title}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No goals available</p>
                )}
              </div>
            </div>

            {/* Watchers */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Watchers (will be notified of updates)
              </label>
              <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-300 p-3 dark:border-slate-700 dark:bg-[#282E33]">
                {membersData?.members?.length > 0 ? (
                  membersData.members.map((member: any) => (
                    <label key={member.userId} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWatchers.includes(member.userId)}
                        onChange={() => toggleWatcher(member.userId)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {member.user?.name || member.user?.email}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No members available</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-[#282E33]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createIssueMutation.isPending || !title.trim() || !projectId}
            className="rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            {createIssueMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createIssueMutation.isPending ? 'Creating...' : 'Create Issue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
