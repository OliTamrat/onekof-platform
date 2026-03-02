'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Calendar, Tag, User, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  reporter?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color?: string;
  };
  commentCount: number;
  attachmentCount: number;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
}

export function IssueDetailModal({ issue, onClose }: IssueDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(issue.title);
  const [editedDescription, setEditedDescription] = useState(issue.description || '');
  const [editedStatus, setEditedStatus] = useState(issue.status);
  const [editedPriority, setEditedPriority] = useState(issue.priority);

  const queryClient = useQueryClient();

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: async (updates: Partial<Issue>) => {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateIssueMutation.mutate({
      title: editedTitle,
      description: editedDescription,
      status: editedStatus,
      priority: editedPriority,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    setEditedStatus(newStatus as any);
    updateIssueMutation.mutate({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: string) => {
    setEditedPriority(newPriority as any);
    updateIssueMutation.mutate({ priority: newPriority });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG': return '🐛';
      case 'STORY': return '📖';
      case 'EPIC': return '⚡';
      case 'SUBTASK': return '📋';
      default: return '✓';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGHEST': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'HIGH': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'LOW': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'LOWEST': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(issue.type)}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {issue.key}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {issue.project.name}
                </span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-lg font-semibold dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              ) : (
                <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {issue.title}
                </h2>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Left Column - Main Content */}
          <div className="flex-1 space-y-6 p-6">
            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Add a description..."
                />
              ) : (
                <div className="min-h-[100px] rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                  {issue.description ? (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">No description provided</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateIssueMutation.isPending}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {updateIssueMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(issue.title);
                    setEditedDescription(issue.description || '');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit Issue
              </button>
            )}

            {/* Comments Section */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                Comments ({issue.commentCount})
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comments feature coming soon...
                </p>
              </div>
            </div>

            {/* Activity */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Activity
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>Created {format(new Date(issue.createdAt), 'PPp')}</div>
                <div>Updated {format(new Date(issue.updatedAt), 'PPp')}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="w-80 space-y-4 border-l border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Status
              </label>
              <select
                value={editedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Priority
              </label>
              <select
                value={editedPriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${getPriorityColor(editedPriority)} dark:border-gray-600`}
              >
                <option value="HIGHEST">⬆️ Highest</option>
                <option value="HIGH">🔺 High</option>
                <option value="MEDIUM">➡️ Medium</option>
                <option value="LOW">🔻 Low</option>
                <option value="LOWEST">⬇️ Lowest</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Assignee
              </label>
              {issue.assignee ? (
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600">
                  {issue.assignee.avatar ? (
                    <img
                      src={issue.assignee.avatar}
                      alt={issue.assignee.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                      {issue.assignee.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {issue.assignee.name}
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400 dark:border-gray-600">
                  Unassigned
                </div>
              )}
            </div>

            {/* Reporter */}
            {issue.reporter && (
              <div>
                <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Reporter
                </label>
                <div className="flex items-center gap-2">
                  {issue.reporter.avatar ? (
                    <img
                      src={issue.reporter.avatar}
                      alt={issue.reporter.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white">
                      {issue.reporter.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {issue.reporter.name}
                  </span>
                </div>
              </div>
            )}

            {/* Labels */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <Tag className="inline h-3 w-3 mr-1" />
                Labels
              </label>
              {issue.labels && issue.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-200"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No labels</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <Calendar className="inline h-3 w-3 mr-1" />
                Due Date
              </label>
              {issue.dueDate ? (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(issue.dueDate), 'PPP')}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No due date</p>
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                <Paperclip className="inline h-3 w-3 mr-1" />
                Attachments
              </label>
              <p className="text-sm text-gray-400">
                {issue.attachmentCount > 0
                  ? `${issue.attachmentCount} attachment(s)`
                  : 'No attachments'}
              </p>
            </div>

            {/* Delete Button */}
            <div className="pt-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4" />
                Delete Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
