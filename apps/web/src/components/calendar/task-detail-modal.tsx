'use client';

/**
 * Task Detail Modal - Google Calendar Style
 * Full task editing with all fields
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  X,
  Calendar,
  Clock,
  User,
  Tag,
  AlignLeft,
  Flag,
  Trash2,
  Save,
  Bell,
  Link as LinkIcon,
  Paperclip,
} from 'lucide-react';
import type { CalendarTask } from './dual-calendar';
import { Button } from '@/components/ui/button';

interface TaskDetailModalProps {
  task: CalendarTask;
  onClose: () => void;
  onUpdate?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
    startTime: task.startDate ? new Date(task.startDate).toTimeString().slice(0, 5) : '',
    dueTime: task.dueDate ? new Date(task.dueDate).toTimeString().slice(0, 5) : '',
    assigneeId: task.assignee?.id || '',
    tags: task.tags?.join(', ') || '',
    reminder: 'none',
  });

  // Fetch team members for assignee dropdown
  const { data: teamData } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const res = await fetch('/api/team/members');
      if (!res.ok) throw new Error('Failed to fetch team members');
      return res.json();
    },
  });

  const members = teamData?.members || [];

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/issues/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setIsEditing(false);
      onClose();
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/issues/${task.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      onDelete?.(task.id);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = formData.startDate && formData.startTime
      ? new Date(`${formData.startDate}T${formData.startTime}`)
      : null;

    const dueDateTime = formData.dueDate && formData.dueTime
      ? new Date(`${formData.dueDate}T${formData.dueTime}`)
      : formData.dueDate
      ? new Date(formData.dueDate)
      : null;

    updateMutation.mutate({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      startDate: startDateTime?.toISOString(),
      dueDate: dueDateTime?.toISOString(),
      assigneeId: formData.assigneeId || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#22272B] rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${task.project.color}20` }}
            >
              <Calendar className="h-5 w-5" style={{ color: task.project.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Task' : task.key}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#6B7684]">{task.project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-lg hover:bg-gray-100 dark:hover:bg-[#282E33]"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            ) : (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600 dark:text-slate-400">
                {task.description || 'No description'}
              </p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              ) : (
                <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                  {task.status.replace('_', ' ')}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  task.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                  task.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  {task.priority}
                </span>
              )}
            </div>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {task.startDate ? new Date(task.startDate).toLocaleString() : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due Date
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'Not set'}
                </p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignee
            </label>
            {isEditing ? (
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Unassigned</option>
                {members.map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : task.assignee ? (
              <div className="flex items-center gap-2">
                {task.assignee.avatar ? (
                  <img src={task.assignee.avatar} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-medium text-white">
                    {task.assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-gray-900 dark:text-white">{task.assignee.name}</span>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-[#6B7684]">Unassigned</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Enter tags separated by commas"
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            ) : task.tags && task.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-slate-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-[#6B7684]">No tags</p>
            )}
          </div>

          {/* Reminder */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Reminder
              </label>
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="none">No reminder</option>
                <option value="15min">15 minutes before</option>
                <option value="1hour">1 hour before</option>
                <option value="1day">1 day before</option>
                <option value="daily">Daily at 9 AM</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="rounded-lg text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-primary-500 text-white hover:bg-primary-600"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
