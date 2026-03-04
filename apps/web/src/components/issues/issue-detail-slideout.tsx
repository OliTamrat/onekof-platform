'use client';

/**
 * Issue Detail Slide-Out Panel
 *
 * Jira-style slide-out drawer with:
 * - Details tab (description, watchers, activity, subtasks)
 * - Settings tab (notifications, permissions)
 * - Lightning-fast performance
 * - Only Lucide React Icons (NO EMOJIS!)
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Calendar,
  User,
  Users,
  Bell,
  Settings,
  Activity,
  CheckSquare,
  MessageSquare,
  Paperclip,
  ChevronDown,
  Clock,
  Flag,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Send,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';

// Types
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
  watchers?: Watcher[];
  watcherCount?: number;
  subtasks?: Subtask[];
  subtaskProgress?: number;
  comments?: Comment[];
  commentCount: number;
  attachmentCount: number;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Watcher {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  watchReason: 'MANUAL' | 'AUTO_ASSIGNED' | 'AUTO_MENTIONED' | 'AUTO_CREATED' | 'AUTO_PARTICIPATED';
  notifyOnComment: boolean;
  notifyOnStatusChange: boolean;
  notifyOnAssignment: boolean;
  notifyOnPriorityChange: boolean;
  notifyOnDueDate: boolean;
  addedAt: string;
}

interface Subtask {
  id: string;
  key: string;
  title: string;
  status: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface IssueDetailSlideoutProps {
  issue: Issue;
  onClose: () => void;
}

type Tab = 'details' | 'settings';

export function IssueDetailSlideout({ issue: initialIssue, onClose }: IssueDetailSlideoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(initialIssue.description || '');
  const [commentContent, setCommentContent] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch full issue details
  const { data: issueData, refetch } = useQuery({
    queryKey: ['issue', initialIssue.id],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${initialIssue.id}`);
      if (!res.ok) throw new Error('Failed to fetch issue');
      const data = await res.json();
      return data.issue;
    },
  });

  const issue = issueData || initialIssue;

  // Fetch watchers
  const { data: watchersData } = useQuery({
    queryKey: ['watchers', issue.id],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${issue.id}/watchers`);
      if (!res.ok) throw new Error('Failed to fetch watchers');
      return res.json();
    },
  });

  const watchers = watchersData?.watchers || issue.watchers || [];

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
    onSuccess: async () => {
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Add watcher mutation
  const addWatcherMutation = useMutation({
    mutationFn: async (userId?: string) => {
      const res = await fetch(`/api/issues/${issue.id}/watchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add watcher');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchers', issue.id] });
      queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
    },
  });

  // Remove watcher mutation
  const removeWatcherMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/issues/${issue.id}/watchers/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove watcher');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchers', issue.id] });
      queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
    },
  });

  // Status badge colors
  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    IN_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    DONE: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    BLOCKED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  };

  // Priority badge colors
  const priorityColors: Record<string, string> = {
    HIGHEST: 'text-red-600 dark:text-red-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    LOW: 'text-green-600 dark:text-green-400',
    LOWEST: 'text-gray-600 dark:text-gray-400',
  };

  // Status options
  const statusOptions = [
    { value: 'TODO', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
    { value: 'DONE', label: 'Done', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'HIGHEST', label: 'Highest', color: 'text-red-600 dark:text-red-400' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 dark:text-orange-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'LOW', label: 'Low', color: 'text-green-600 dark:text-green-400' },
    { value: 'LOWEST', label: 'Lowest', color: 'text-gray-600 dark:text-gray-400' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-[#1B1F23] shadow-2xl z-50 flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {issue.project?.key}-{issue.key}
            </span>
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${statusColors[issue.status]} hover:opacity-80 transition-opacity`}
              >
                {issue.status.replace('_', ' ')}
                <ChevronDown className="h-3 w-3" />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 z-10 w-40 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => {
                        updateIssueMutation.mutate({ status: status.value });
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        issue.status === status.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'details'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Info className="h-4 w-4" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <DetailsTab
              issue={issue}
              watchers={watchers}
              updateIssue={updateIssueMutation}
              addWatcher={addWatcherMutation}
              removeWatcher={removeWatcherMutation}
            />
          )}
          {activeTab === 'settings' && <SettingsTab issue={issue} updateIssue={updateIssueMutation} />}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
}

// Details Tab Component
function DetailsTab({
  issue,
  watchers,
  updateIssue,
  addWatcher,
  removeWatcher,
}: {
  issue: Issue;
  watchers: Watcher[];
  updateIssue: any;
  addWatcher: any;
  removeWatcher: any;
}) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(issue.description || '');
  const [commentContent, setCommentContent] = useState('');
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);

  // Priority options
  const priorityOptions = [
    { value: 'HIGHEST', label: 'Highest', color: 'text-red-600 dark:text-red-400' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 dark:text-orange-400' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'LOW', label: 'Low', color: 'text-green-600 dark:text-green-400' },
    { value: 'LOWEST', label: 'Lowest', color: 'text-gray-600 dark:text-gray-400' },
  ];

  const priorityColors: Record<string, string> = {
    HIGHEST: 'text-red-600 dark:text-red-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    LOW: 'text-green-600 dark:text-green-400',
    LOWEST: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {issue.title}
        </h1>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Assigned to {issue.assignee?.name || 'Unassigned'}</span>
        </div>

        {/* Priority Dropdown */}
        <div className="relative flex items-center gap-2">
          <Flag className={`h-4 w-4 ${issue.priority ? priorityColors[issue.priority] : 'text-gray-400'}`} />
          <button
            onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            className={`${issue.priority ? priorityColors[issue.priority] : ''} hover:underline cursor-pointer flex items-center gap-1`}
          >
            {issue.priority || 'No priority'}
            <ChevronDown className="h-3 w-3" />
          </button>
          {isPriorityDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 z-10 w-36 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => {
                    updateIssue.mutate({ priority: priority.value });
                    setIsPriorityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    issue.priority === priority.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                >
                  <span className={priority.color}>{priority.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  updateIssue.mutate({ priority: null });
                  setIsPriorityDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                No priority
              </button>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {isEditingDueDate ? (
            <input
              type="date"
              defaultValue={issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateIssue.mutate({ dueDate: e.target.value });
                }
                setIsEditingDueDate(false);
              }}
              onBlur={() => setIsEditingDueDate(false)}
              autoFocus
              className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          ) : (
            <button
              onClick={() => setIsEditingDueDate(true)}
              className="hover:underline cursor-pointer"
            >
              {issue.dueDate ? format(new Date(issue.dueDate), 'MMM dd, yyyy') : 'No due date'}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h2>
          <button
            onClick={() => setIsEditingDescription(!isEditingDescription)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isEditingDescription ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingDescription ? (
          <div className="space-y-2">
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full min-h-[200px] rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
              placeholder="Add a description..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingDescription(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateIssue.mutate({ description: editedDescription });
                  setIsEditingDescription(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {issue.description || 'No description provided.'}
          </div>
        )}
      </div>

      {/* Watchers Section */}
      <WatchersSection
        issue={issue}
        watchers={watchers}
        addWatcher={addWatcher}
        removeWatcher={removeWatcher}
      />

      {/* Activity Timeline */}
      <ActivityTimeline issue={issue} />

      {/* Subtasks */}
      <SubtasksSection issue={issue} />

      {/* Comments */}
      <CommentsSection issue={issue} commentContent={commentContent} setCommentContent={setCommentContent} />

    </div>
  );
}

// Settings Tab Component
function SettingsTab({ issue, updateIssue }: { issue: Issue; updateIssue: any }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Notify on comments</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get notified when someone comments</p>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Notify on status changes</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get notified when status changes</p>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Notify on assignments</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get notified when assigned</p>
            </div>
          </div>
          <input type="checkbox" className="h-4 w-4" defaultChecked />
        </div>
      </div>
    </div>
  );
}

// Watchers Section Component
function WatchersSection({
  issue,
  watchers,
  addWatcher,
  removeWatcher,
}: {
  issue: Issue;
  watchers: Watcher[];
  addWatcher: any;
  removeWatcher: any;
}) {
  const handleAddWatcher = async () => {
    try {
      // Add current user as watcher
      await addWatcher.mutateAsync();
    } catch (error: any) {
      if (error.message === 'Already watching this issue') {
        alert('You are already watching this issue');
      } else {
        alert('Failed to add watcher: ' + error.message);
      }
    }
  };

  const handleRemoveWatcher = async (userId: string) => {
    if (confirm('Stop watching this issue?')) {
      try {
        await removeWatcher.mutateAsync(userId);
      } catch (error: any) {
        alert('Failed to remove watcher: ' + error.message);
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Watchers ({watchers.length})
          </h2>
        </div>
        <button
          onClick={handleAddWatcher}
          disabled={addWatcher.isPending}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {addWatcher.isPending ? 'Adding...' : 'Watch'}
        </button>
      </div>

      <div className="space-y-2">
        {watchers.length > 0 ? (
          watchers.map((watcher) => (
            <div key={watcher.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                {watcher.user.avatar ? (
                  <img
                    src={watcher.user.avatar}
                    alt={watcher.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {watcher.user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{watcher.user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {watcher.watchReason === 'MANUAL' && 'Watching manually'}
                    {watcher.watchReason === 'AUTO_ASSIGNED' && 'Auto-watching (assigned)'}
                    {watcher.watchReason === 'AUTO_MENTIONED' && 'Auto-watching (mentioned)'}
                    {watcher.watchReason === 'AUTO_CREATED' && 'Auto-watching (creator)'}
                    {watcher.watchReason === 'AUTO_PARTICIPATED' && 'Auto-watching (participated)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveWatcher(watcher.userId)}
                disabled={removeWatcher.isPending}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                title="Stop watching"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No watchers yet. Click "Watch" to get notifications about this task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Timeline Component
function ActivityTimeline({ issue }: { issue: Issue }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Activity timeline coming soon...</p>
    </div>
  );
}

// Subtasks Section Component
function SubtasksSection({ issue }: { issue: Issue }) {
  const subtasks = issue.subtasks || [];

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Subtasks ({subtasks.length})
          </h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="h-4 w-4" />
          Add subtask
        </button>
      </div>

      <div className="space-y-2">
        {subtasks.length > 0 ? (
          subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <CheckSquare className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">{subtask.title}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 py-4 text-center">
            No subtasks yet.
          </p>
        )}
      </div>
    </div>
  );
}

// Comments Section Component
function CommentsSection({ issue, commentContent, setCommentContent }: { issue: Issue; commentContent: string; setCommentContent: (val: string) => void }) {
  const comments = issue.comments || [];

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add Comment */}
      <div className="mb-4">
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
              {comment.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author.name}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to get priority colors
const priorityColors: Record<string, string> = {
  HIGHEST: 'text-red-600 dark:text-red-400',
  HIGH: 'text-orange-600 dark:text-orange-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  LOW: 'text-green-600 dark:text-green-400',
  LOWEST: 'text-gray-600 dark:text-gray-400',
};
