'use client';

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  AlignLeft,
  Flag,
  Plus,
  Bell,
  Tag,
  User,
} from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent } from '@/components/ui/slideout-panel';

interface QuickAddEventModalProps {
  date: Date;
  onClose: () => void;
  projectId?: string;
}

export function QuickAddEventModal({ date, onClose, projectId }: QuickAddEventModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: date.toISOString().split('T')[0],
    startTime: date.toTimeString().slice(0, 5),
    dueDate: date.toISOString().split('T')[0],
    dueTime: '',
    priority: 'MEDIUM' as const,
    status: 'TODO' as const,
    assigneeId: '',
    tags: '',
    reminder: '1hour',
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const { data: membersData } = useQuery({
    queryKey: ['organization-members'],
    queryFn: async () => {
      const res = await fetch('/api/organization-members');
      if (!res.ok) return { members: [] };
      return res.json();
    },
  });

  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];
  const selectedProjectId = projectId || projects[0]?.id;

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime || '00:00'}`);
    const dueDateTime = formData.dueTime
      ? new Date(`${formData.dueDate}T${formData.dueTime}`)
      : new Date(formData.dueDate);

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      projectId: selectedProjectId,
      status: formData.status,
      priority: formData.priority,
      startDate: startDateTime.toISOString(),
      dueDate: dueDateTime.toISOString(),
      assigneeId: formData.assigneeId || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      reminder: formData.reminder,
    });
  };

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = 'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors';
  const labelClass = 'flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5';

  return (
    <SlideoutPanel
      open
      onClose={onClose}
      title="Create Event"
      size="sm"
      headerActions={<Plus className="h-5 w-5 text-primary-500" />}
      showFooter
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282E33] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="quick-add-form"
            disabled={createMutation.isPending || !formData.title.trim()}
            className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      }
    >
      <SlideoutPanelContent>
        <form id="quick-add-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Event title"
              className="w-full border-0 bg-transparent px-0 py-1 text-lg font-semibold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-0"
              required
              autoFocus
            />
            <div className="h-px bg-slate-200 dark:bg-slate-700 mt-1" />
          </div>

          {/* Priority & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Flag className="h-3 w-3" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => update('priority', e.target.value)}
                className={inputClass}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <User className="h-3 w-3" />
                Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => update('assigneeId', e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {members.map((member: { id: string; name: string }) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <Calendar className="h-3 w-3" />
                Start
              </label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  className={inputClass}
                />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <Clock className="h-3 w-3" />
                Due
              </label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => update('dueDate', e.target.value)}
                  className={inputClass}
                />
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => update('dueTime', e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <AlignLeft className="h-3 w-3" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder="Add details about this event..."
              className={inputClass}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>
              <Tag className="h-3 w-3" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="meeting, urgent, planning (comma-separated)"
              className={inputClass}
            />
          </div>

          {/* Reminder */}
          <div>
            <label className={labelClass}>
              <Bell className="h-3 w-3" />
              Reminder
            </label>
            <select
              value={formData.reminder}
              onChange={(e) => update('reminder', e.target.value)}
              className={inputClass}
            >
              <option value="none">No reminder</option>
              <option value="15min">15 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
              <option value="daily">Daily at 9 AM</option>
            </select>
          </div>
        </form>
      </SlideoutPanelContent>
    </SlideoutPanel>
  );
}
