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
import { useLanguage } from '@/contexts/language-context';

interface TaskDetailModalProps {
  task: CalendarTask;
  onClose: () => void;
  onUpdate?: (task: CalendarTask) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const { t } = useLanguage();
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
    if (confirm(t('errors.areYouSureDelete'))) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-[#22272B] rounded-t-2xl sm:rounded-xl shadow-2xl border border-transparent sm:border-slate-200/80 dark:sm:border-white/[0.08]">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Project color accent bar */}
        <div
          className="hidden sm:block h-[3px] w-full"
          style={{ background: `linear-gradient(to right, ${task.project.color || '#1C8C7D'}, ${task.project.color || '#1C8C7D'}80)` }}
        />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 bg-white dark:bg-[#22272B] px-4 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${task.project.color}15` }}
            >
              <Calendar className="h-4 w-4" style={{ color: task.project.color }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {isEditing ? t('tasks.editTask') : task.key}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#6B7684] truncate">{task.project.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-9 rounded-lg text-sm text-gray-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33] active:scale-95 transition-all"
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
                  title={t('tasks.deleteTask')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#282E33] active:scale-95 transition-all"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-80px)] p-4 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
              {t('common.title')}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
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
              {t('common.description')}
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                placeholder={t('tasks.addDescription')}
              />
            ) : (
              <p className="text-gray-600 dark:text-slate-400">
                {task.description || t('common.noDescription')}
              </p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">
                {t('common.status')}
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                >
                  <option value="TODO">{t('status.todo')}</option>
                  <option value="IN_PROGRESS">{t('status.inProgress')}</option>
                  <option value="IN_REVIEW">{t('status.inReview')}</option>
                  <option value="DONE">{t('status.done')}</option>
                  <option value="BLOCKED">{t('status.blocked')}</option>
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
                {t('common.priority')}
              </label>
              {isEditing ? (
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                >
                  <option value="CRITICAL">{t('priority.critical')}</option>
                  <option value="HIGH">{t('priority.high')}</option>
                  <option value="MEDIUM">{t('priority.medium')}</option>
                  <option value="LOW">{t('priority.low')}</option>
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
                {t('common.startDate')}
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                  />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                  />
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {task.startDate ? new Date(task.startDate).toLocaleString() : t('common.notSet')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('common.dueDate')}
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                  />
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
                  />
                </div>
              ) : (
                <p className="text-gray-900 dark:text-white">
                  {task.dueDate ? new Date(task.dueDate).toLocaleString() : t('common.notSet')}
                </p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('common.assignee')}
            </label>
            {isEditing ? (
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
              >
                <option value="">{t('common.unassigned')}</option>
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
              <p className="text-gray-500 dark:text-[#6B7684]">{t('common.unassigned')}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t('common.tags')}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder={t('tasks.enterTags')}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
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
              <p className="text-gray-500 dark:text-[#6B7684]">{t('tasks.noTags')}</p>
            )}
          </div>

          {/* Reminder */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('calendar.reminder')}
              </label>
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 py-2 text-gray-900 dark:text-white focus:border-[#1C8C7D] focus:outline-none focus:ring-1 focus:ring-[#1C8C7D]"
              >
                <option value="none">{t('calendar.noReminder')}</option>
                <option value="15min">{t('calendar.minutes15Before')}</option>
                <option value="1hour">{t('calendar.hour1Before')}</option>
                <option value="1day">{t('calendar.day1Before')}</option>
                <option value="daily">{t('calendar.dailyAt9')}</option>
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
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-lg bg-[#1C8C7D] text-white hover:bg-[#167A6E] gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? t('common.saving') : t('tasks.saveChanges')}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
