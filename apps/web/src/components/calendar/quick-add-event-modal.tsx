'use client';

/**
 * Quick Add Event Modal - Google Calendar Style
 * Fast event creation from calendar clicks
 */

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  X,
  Calendar,
  Clock,
  User,
  AlignLeft,
  Flag,
  Plus,
  Bell,
  Tag,
} from 'lucide-react';

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

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/team/members');
      if (!res.ok) throw new Error('Failed to fetch team members');
      return res.json();
    },
  });

  const projects = projectsData?.projects || [];
  const members = teamData?.members || [];
  const selectedProjectId = projectId || projects[0]?.id;

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#22272B] rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#0065FF]" />
            Create Event
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-[#9FADBC]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              className="w-full rounded-lg border-0 bg-gray-50 dark:bg-[#282E33] px-4 py-3 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6B7684] focus:outline-none focus:ring-2 focus:ring-[#0065FF]"
              required
              autoFocus
            />
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
            >
              <option value="">Assign to...</option>
              {members.map((member: any) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-[#9FADBC] mb-1">
                Start
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-[#9FADBC] mb-1">
                Due
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                />
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-[#9FADBC] mb-1 flex items-center gap-1">
              <AlignLeft className="h-3 w-3" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Add details about this event..."
              className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6B7684] focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-[#9FADBC] mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="meeting, urgent, planning (comma-separated)"
              className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#6B7684] focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-[#9FADBC] mb-1 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Reminder
            </label>
            <select
              value={formData.reminder}
              onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-[#0065FF] focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20"
            >
              <option value="none">No reminder</option>
              <option value="15min">15 minutes before</option>
              <option value="1hour">1 hour before</option>
              <option value="1day">1 day before</option>
              <option value="daily">Daily at 9 AM</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#9FADBC] hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
