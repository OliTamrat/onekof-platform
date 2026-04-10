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

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { ActivityTimeline as RealActivityTimeline } from '@/components/activity/activity-timeline';
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
  Share2,
  MoreVertical,
  FileText,
  Upload,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast-provider';
import { Button } from '@/components/ui/button';
import { AlertModal } from '@/components/ui/alert-modal';
import { SkeletonIssueDetail } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';

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
  issue?: Issue;
  issueId?: string;
  onClose: () => void;
}

type Tab = 'details' | 'settings';

export function IssueDetailSlideout({ issue: initialIssue, issueId, onClose }: IssueDetailSlideoutProps) {
  const { t } = useLanguage();
  const resolvedId = initialIssue?.id || issueId;
  const toast = useToast();
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(initialIssue?.description || '');
  const [commentContent, setCommentContent] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch org + members for assignee picker and role-based delete permission
  const { data: orgData } = useQuery({
    queryKey: ['current-org-for-issue-detail'],
    queryFn: async () => {
      const res = await fetch('/api/organizations');
      if (!res.ok) return null;
      return res.json();
    },
  });
  const currentOrgId = orgData?.organizations?.[0]?.id || orgData?.organization?.id;

  const { data: membersData } = useQuery({
    queryKey: ['org-members-for-issue-detail', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return { members: [] };
      const res = await fetch(`/api/organizations/${currentOrgId}/members`);
      if (!res.ok) return { members: [] };
      return res.json();
    },
    enabled: !!currentOrgId,
  });

  const members: any[] = membersData?.members || [];
  const currentMembership = members.find((m: any) => m.id === currentUserId || m.userId === currentUserId);
  const userRole = currentMembership?.role;
  const canDelete = userRole === 'OWNER' || userRole === 'ADMIN';

  // Fetch full issue details
  const { data: issueData, refetch } = useQuery({
    queryKey: ['issue', resolvedId],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${resolvedId}`);
      if (!res.ok) throw new Error('Failed to fetch issue');
      const data = await res.json();
      return data.issue;
    },
    enabled: !!resolvedId,
  });

  const issue = issueData || initialIssue;

  // Fetch watchers
  const { data: watchersData } = useQuery({
    queryKey: ['watchers', issue?.id],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${issue!.id}/watchers`);
      if (!res.ok) throw new Error('Failed to fetch watchers');
      return res.json();
    },
    enabled: !!issue?.id,
  });

  const watchers = watchersData?.watchers || issue?.watchers || [];

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: async (updates: Partial<Issue>) => {
      const res = await fetch(`/api/issues/${issue!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update issue');
      return res.json();
    },
    onSuccess: async () => {
      await refetch();
      // Invalidate all issues queries to refresh boards/lists
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['watchers', issue?.id] });
      queryClient.invalidateQueries({ queryKey: ['issue', issue?.id] });
    },
  });

  // Remove watcher mutation
  const removeWatcherMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/issues/${issue!.id}/watchers/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove watcher');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchers', issue?.id] });
      queryClient.invalidateQueries({ queryKey: ['issue', issue?.id] });
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
    { value: 'TODO', label: t('status.todo'), color: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300' },
    { value: 'IN_PROGRESS', label: t('status.inProgress'), color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    { value: 'IN_REVIEW', label: t('status.inReview'), color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
    { value: 'DONE', label: t('status.done'), color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    { value: 'BLOCKED', label: t('status.blocked'), color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'HIGHEST', label: t('priority.highest'), color: 'text-red-600 dark:text-red-400' },
    { value: 'HIGH', label: t('priority.high'), color: 'text-orange-600 dark:text-orange-400' },
    { value: 'MEDIUM', label: t('priority.medium'), color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'LOW', label: t('priority.low'), color: 'text-green-600 dark:text-green-400' },
    { value: 'LOWEST', label: t('priority.lowest'), color: 'text-gray-600 dark:text-gray-400' },
  ];

  if (!issue) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
        <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:max-w-4xl bg-white dark:bg-[#1B1F23] shadow-2xl z-50 animate-slide-in-right overflow-hidden">
          <SkeletonIssueDetail />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:max-w-4xl bg-white dark:bg-[#1B1F23] shadow-2xl z-50 flex flex-col animate-slide-in-right">

        {/* Jira-Style Clean Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-3 md:px-6 py-3">
          {/* Left: Task Key */}
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              {issue.key}
            </span>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-1">
            {/* Watch Icon with Count */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addWatcherMutation.mutateAsync(undefined).catch(() => {})}
              className="h-auto w-auto flex items-center gap-1 rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Watch this issue"
            >
              <Eye className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium">{watchers.length}</span>
            </Button>

            {/* Share Icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              className="h-auto w-auto rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Share"
            >
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            {/* More Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="h-auto w-auto rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="More options"
              >
                <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              {isMoreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-xl overflow-hidden">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(issue.key);
                        toast.success('Key copied');
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#282E33] text-slate-700 dark:text-slate-300"
                    >
                      Copy key
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-[#282E33] text-slate-700 dark:text-slate-300"
                    >
                      Settings
                    </button>
                    {canDelete && (
                      <>
                        <div className="border-t border-slate-100 dark:border-slate-700/50" />
                        <button
                          onClick={() => {
                            setIsMoreMenuOpen(false);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete issue
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-auto w-auto rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Close"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
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
              members={members}
            />
          )}
          {activeTab === 'settings' && <SettingsTab issue={issue} updateIssue={updateIssueMutation} />}
        </div>

        {/* Jira-Style Bottom Tab Bar */}
        <div className="flex items-center border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1B1F23]">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('details')}
            className={`flex-1 h-auto rounded-none flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-t-2 ${
              activeTab === 'details'
                ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.details')}</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 h-auto rounded-none flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-t-2 ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-500 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.settings')}</span>
          </Button>
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

      {/* Themed Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        type="error"
        destructive
        title={t('common.deleteIssueTitle') || 'Delete this issue?'}
        message={`${issue?.key ? issue.key + ' — ' : ''}${issue?.title || ''}\n\n${t('common.deleteIssueMessage') || 'This action cannot be undone. The issue and all its comments, attachments, and subtasks will be permanently removed.'}`}
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={async () => {
          try {
            const res = await fetch(`/api/issues/${issue!.id}`, { method: 'DELETE' });
            if (res.ok) {
              toast.success('Issue deleted');
              queryClient.invalidateQueries({ queryKey: ['issues'] });
              onClose();
            } else {
              const err = await res.json().catch(() => ({}));
              toast.error(err.error || 'Failed to delete');
            }
          } catch {
            toast.error('Failed to delete');
          }
        }}
      />
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
  members,
}: {
  issue: Issue;
  watchers: Watcher[];
  updateIssue: any;
  addWatcher: any;
  removeWatcher: any;
  members: any[];
}) {
  const { t } = useLanguage();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(issue.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(issue.description || '');
  const [commentContent, setCommentContent] = useState('');
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'TODO', label: t('status.todo'), color: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300' },
    { value: 'IN_PROGRESS', label: t('status.inProgress'), color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    { value: 'IN_REVIEW', label: t('status.inReview'), color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
    { value: 'DONE', label: t('status.done'), color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    { value: 'BLOCKED', label: t('status.blocked'), color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  ];

  const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    IN_REVIEW: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    DONE: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    BLOCKED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  };

  // Priority options
  const priorityOptions = [
    { value: 'HIGHEST', label: t('priority.highest'), color: 'text-red-600 dark:text-red-400' },
    { value: 'HIGH', label: t('priority.high'), color: 'text-orange-600 dark:text-orange-400' },
    { value: 'MEDIUM', label: t('priority.medium'), color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'LOW', label: t('priority.low'), color: 'text-green-600 dark:text-green-400' },
    { value: 'LOWEST', label: t('priority.lowest'), color: 'text-gray-600 dark:text-gray-400' },
  ];

  const priorityColors: Record<string, string> = {
    HIGHEST: 'text-red-600 dark:text-red-400',
    HIGH: 'text-orange-600 dark:text-orange-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    LOW: 'text-green-600 dark:text-green-400',
    LOWEST: 'text-gray-600 dark:text-gray-400',
  };

  const flashSaved = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div>
      {/* Title + Status Bar */}
      <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        {isEditingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={() => {
              if (editedTitle.trim() && editedTitle !== issue.title) {
                updateIssue.mutate({ title: editedTitle.trim() });
                flashSaved();
              }
              setIsEditingTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                setEditedTitle(issue.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="w-full text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 bg-transparent border-b-2 border-[#1C8C7D] outline-none"
          />
        ) : (
          <h1
            className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 cursor-pointer hover:text-[#1C8C7D] transition-colors"
            onClick={() => { setEditedTitle(issue.title); setIsEditingTitle(true); }}
            title={t('common.clickToEdit')}
          >
            {issue.title}
          </h1>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`h-auto inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${statusColors[issue.status]} hover:opacity-80`}
            >
              {issue.status.replace('_', ' ')}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 z-10 w-44 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#282E33] shadow-lg overflow-hidden">
                {statusOptions.map((status) => (
                  <Button
                    key={status.value}
                    variant="ghost"
                    onClick={() => {
                      updateIssue.mutate({ status: status.value });
                      setIsStatusDropdownOpen(false);
                      flashSaved();
                    }}
                    className={`w-full h-auto justify-start rounded-none text-left px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-[#1B1F23] flex items-center gap-2 ${
                      issue.status === status.value ? 'bg-gray-50 dark:bg-[#1B1F23]' : ''
                    }`}
                  >
                    {issue.status === status.value && <Check className="h-3.5 w-3.5 text-primary-500" />}
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${status.color} ${issue.status !== status.value ? 'ml-5' : ''}`}>
                      {status.label}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
          {showSaved && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Check className="h-3 w-3" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Two-Column Layout (Jira-style) */}
      <div className="flex flex-col md:flex-row">
        {/* LEFT COLUMN: Description, Subtasks, Activity */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Description */}
          <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('common.description')}</h2>
              <Button
                variant="ghost"
                onClick={() => setIsEditingDescription(!isEditingDescription)}
                className="h-auto px-2 py-1 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium"
              >
                {isEditingDescription ? t('common.cancel') : t('common.edit')}
              </Button>
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] p-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                  placeholder={t('tasks.addDescription')}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDescription(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateIssue.mutate({ description: editedDescription });
                      setIsEditingDescription(false);
                    }}
                    className="bg-primary-500 text-white hover:bg-primary-600"
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDescription(true)}
                className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282E33] rounded-md p-2 -mx-2 transition-colors min-h-[40px]"
              >
                {issue.description || t('tasks.addDescription')}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <SubtasksSection issue={issue} />

          {/* Attachments */}
          <AttachmentsSection issue={issue} />

          {/* Linked Work Items */}
          <LinksSection issue={issue} />

          {/* Activity */}
          <IssueActivitySection issue={issue} />

          {/* Comments */}
          <CommentsSection issue={issue} commentContent={commentContent} setCommentContent={setCommentContent} />
        </div>

        {/* RIGHT COLUMN: Details Panel (hidden on mobile, shown as section) */}
        <div className="w-full md:w-72 lg:w-80 md:border-l border-t md:border-t-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1B1F23] overflow-y-auto">
          {/* Details Header */}
          <div className="flex items-center justify-between px-3 md:px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('common.details')}</h3>
            <Settings className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>

          <div className="px-3 md:px-5 py-3 space-y-4">
            {/* Assignee */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 pt-0.5 shrink-0">{t('common.assignee')}</span>
              <div className="relative flex-1 min-w-0">
                <Button
                  variant="ghost"
                  onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                  className="h-auto w-full justify-start gap-2 px-2 py-1 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-md"
                >
                  {issue.assignee ? (
                    issue.assignee.avatar ? (
                      <img src={issue.assignee.avatar} alt={issue.assignee.name} className="h-5 w-5 rounded-full shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                        {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )
                  ) : (
                    <User className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                  <span className="truncate flex-1 text-left">{issue.assignee?.name || t('common.unassigned')}</span>
                  <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
                </Button>
                {isAssigneeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsAssigneeDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[220px] max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#282E33] shadow-xl">
                      {members.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">No members found</div>
                      ) : (
                        members.map((member: any) => {
                          const memberId = member.id || member.userId;
                          const memberName = member.name || member.user?.name || member.email || 'Unknown';
                          const memberAvatar = member.avatar || member.user?.avatar;
                          const isSelected = issue.assignee?.id === memberId;
                          return (
                            <Button
                              key={memberId}
                              variant="ghost"
                              onClick={() => {
                                updateIssue.mutate({ assigneeId: memberId });
                                setIsAssigneeDropdownOpen(false);
                                flashSaved();
                              }}
                              className={`w-full h-auto justify-start gap-2 rounded-none px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1B1F23] ${
                                isSelected ? 'bg-gray-50 dark:bg-[#1B1F23]' : ''
                              }`}
                            >
                              {memberAvatar ? (
                                <img src={memberAvatar} alt={memberName} className="h-5 w-5 rounded-full shrink-0" />
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                                  {memberName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate flex-1 text-left text-gray-900 dark:text-white">{memberName}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary-500 shrink-0" />}
                            </Button>
                          );
                        })
                      )}
                      {issue.assignee && (
                        <>
                          <div className="border-t border-gray-200 dark:border-slate-700" />
                          <Button
                            variant="ghost"
                            onClick={() => {
                              updateIssue.mutate({ assigneeId: null });
                              setIsAssigneeDropdownOpen(false);
                              flashSaved();
                            }}
                            className="w-full h-auto justify-start rounded-none px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1B1F23]"
                          >
                            {t('common.unassigned')}
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 pt-0.5 shrink-0">{t('common.priority')}</span>
              <div className="relative flex items-center gap-2 flex-1">
                <Flag className={`h-4 w-4 shrink-0 ${issue.priority ? priorityColors[issue.priority] : 'text-gray-400'}`} />
                <Button
                  variant="ghost"
                  onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                  className={`h-auto px-1 py-0.5 ${issue.priority ? priorityColors[issue.priority] : 'text-gray-500'} hover:underline cursor-pointer flex items-center gap-1 text-sm font-medium`}
                >
                  {issue.priority || 'None'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {isPriorityDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 z-10 w-40 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#282E33] shadow-lg overflow-hidden">
                    {priorityOptions.map((priority) => (
                      <Button
                        key={priority.value}
                        variant="ghost"
                        onClick={() => {
                          updateIssue.mutate({ priority: priority.value });
                          setIsPriorityDropdownOpen(false);
                          flashSaved();
                        }}
                        className={`w-full h-auto justify-start rounded-none text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1B1F23] ${
                          issue.priority === priority.value ? 'bg-gray-50 dark:bg-[#1B1F23]' : ''
                        }`}
                      >
                        <span className={priority.color}>{priority.label}</span>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        updateIssue.mutate({ priority: null });
                        setIsPriorityDropdownOpen(false);
                        flashSaved();
                      }}
                      className="w-full h-auto justify-start rounded-none text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#1B1F23] text-gray-500"
                    >
                      None
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 pt-0.5 shrink-0">{t('common.dueDate')}</span>
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                {isEditingDueDate ? (
                  <input
                    type="date"
                    defaultValue={issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateIssue.mutate({ dueDate: e.target.value });
                      }
                      setIsEditingDueDate(false);
                      flashSaved();
                    }}
                    onBlur={() => setIsEditingDueDate(false)}
                    autoFocus
                    className="border border-gray-300 dark:border-slate-700 rounded px-2 py-1 text-sm bg-white dark:bg-[#282E33] text-gray-900 dark:text-white"
                  />
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingDueDate(true)}
                    className={`h-auto px-1.5 py-0.5 text-sm cursor-pointer ${
                      issue.dueDate && new Date(issue.dueDate) < new Date()
                        ? 'text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded'
                        : 'text-gray-900 dark:text-white hover:underline'
                    }`}
                  >
                    {issue.dueDate ? format(new Date(issue.dueDate), 'MMM dd, yyyy') : 'None'}
                  </Button>
                )}
              </div>
            </div>

            {/* Labels */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 pt-0.5 shrink-0">Labels</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {issue.labels && Array.isArray(issue.labels) && issue.labels.length > 0
                  ? issue.labels.join(', ')
                  : 'None'}
              </span>
            </div>

            {/* Reporter */}
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 pt-0.5 shrink-0">Reporter</span>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {issue.reporter ? (
                  <>
                    {issue.reporter.avatar ? (
                      <img src={issue.reporter.avatar} alt={issue.reporter.name} className="h-5 w-5 rounded-full shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                        {issue.reporter.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-sm text-gray-900 dark:text-white truncate">{issue.reporter.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Watchers (collapsible in right panel) */}
          <WatchersSection
            issue={issue}
            watchers={watchers}
            addWatcher={addWatcher}
            removeWatcher={removeWatcher}
          />

          {/* Timestamps */}
          <div className="px-3 md:px-5 py-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {format(new Date(issue.createdAt), 'PPp')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Updated {format(new Date(issue.updatedAt), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ issue, updateIssue }: { issue: Issue; updateIssue: any }) {
  return (
    <div className="px-3 md:px-6 py-4 space-y-6">
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
  const toast = useToast();

  const handleAddWatcher = async () => {
    try {
      await addWatcher.mutateAsync();
    } catch (error: any) {
      if (error.message === 'Already watching this issue') {
        toast.info('Already watching', 'You are already watching this issue');
      } else {
        toast.error('Failed to add watcher', error.message);
      }
    }
  };

  const handleRemoveWatcher = async (userId: string) => {
    if (confirm('Stop watching this issue?')) {
      try {
        await removeWatcher.mutateAsync(userId);
      } catch (error: any) {
        toast.error('Failed to remove watcher', error.message);
      }
    }
  };

  return (
    <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Watchers ({watchers.length})
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={handleAddWatcher}
          disabled={addWatcher.isPending}
          className="h-auto px-2 py-1 flex items-center gap-1 text-sm text-primary-500 dark:text-primary-400 hover:underline"
        >
          <Plus className="h-4 w-4" />
          {addWatcher.isPending ? 'Adding...' : 'Watch'}
        </Button>
      </div>

      <div className="space-y-2">
        {watchers.length > 0 ? (
          watchers.filter((w) => w.user).map((watcher) => (
            <div key={watcher.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center gap-3">
                {watcher.user?.avatar ? (
                  <img
                    src={watcher.user.avatar}
                    alt={watcher.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                    {(watcher.user?.name || 'U').split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{watcher.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {watcher.watchReason === 'MANUAL' && 'Watching manually'}
                    {watcher.watchReason === 'AUTO_ASSIGNED' && 'Auto-watching (assigned)'}
                    {watcher.watchReason === 'AUTO_MENTIONED' && 'Auto-watching (mentioned)'}
                    {watcher.watchReason === 'AUTO_CREATED' && 'Auto-watching (creator)'}
                    {watcher.watchReason === 'AUTO_PARTICIPATED' && 'Auto-watching (participated)'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveWatcher(watcher.userId)}
                disabled={removeWatcher.isPending}
                className="h-auto w-auto p-1 text-gray-400 hover:text-red-600"
                title="Stop watching"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
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

// Activity Timeline Component — uses real ActivityTimeline from activity module
function IssueActivitySection({ issue }: { issue: Issue }) {
  return (
    <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Activity</h2>
      </div>
      <RealActivityTimeline
        entityType="TASK"
        entityId={issue.id}
        limit={10}
        showFilters={false}
      />
    </div>
  );
}

// Subtasks Section Component
function SubtasksSection({ issue }: { issue: Issue }) {
  const subtasks = issue.subtasks || [];
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const queryClient = useQueryClient();

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) return;

    try {
      const res = await fetch(`/api/issues/${issue.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: subtaskTitle }),
      });

      if (res.ok) {
        setSubtaskTitle('');
        setIsAddingSubtask(false);
        // Refresh issue data to show new subtask
        await queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
        await queryClient.invalidateQueries({ queryKey: ['issues'] });
      }
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  return (
    <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Subtasks ({subtasks.length})
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsAddingSubtask(!isAddingSubtask)}
          className="h-auto px-2 py-1 flex items-center gap-1 text-sm text-primary-500 dark:text-primary-400 hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add subtask
        </Button>
      </div>

      {/* Add Subtask Form */}
      {isAddingSubtask && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              } else if (e.key === 'Escape') {
                setIsAddingSubtask(false);
                setSubtaskTitle('');
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingSubtask(false);
                setSubtaskTitle('');
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddSubtask}
              disabled={!subtaskTitle.trim()}
              className="bg-primary-500 text-white hover:bg-primary-600"
            >
              Add
            </Button>
          </div>
        </div>
      )}

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
  const queryClient = useQueryClient();
  const toast = useToast();
  const comments = issue.comments || [];
  const [isSending, setIsSending] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch org members for @mentions
  const { data: orgData } = useQuery({
    queryKey: ['current-org-for-mentions'],
    queryFn: async () => {
      const res = await fetch('/api/organizations');
      if (!res.ok) return null;
      return res.json();
    },
  });
  const currentOrgId = orgData?.organizations?.[0]?.id || orgData?.organization?.id;

  const { data: membersData } = useQuery({
    queryKey: ['org-members-mentions', currentOrgId],
    queryFn: async () => {
      if (!currentOrgId) return { members: [] };
      const res = await fetch(`/api/organizations/${currentOrgId}/members`);
      if (!res.ok) return { members: [] };
      return res.json();
    },
    enabled: !!currentOrgId,
  });

  const filteredMembers = (membersData?.members || []).filter((m: any) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
  }).slice(0, 6);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentContent(value);
    const cursorPos = e.target.selectionStart;
    // Find last @ before cursor
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIdx = textBeforeCursor.lastIndexOf('@');
    if (atIdx >= 0) {
      const afterAt = textBeforeCursor.slice(atIdx + 1);
      // Only trigger if no space after @
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionStart(atIdx);
        setMentionQuery(afterAt);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  };

  const insertMention = (member: any) => {
    const displayName = (member.name || member.email || '').replace(/\s+/g, '');
    const before = commentContent.slice(0, mentionStart);
    const after = commentContent.slice(mentionStart + 1 + mentionQuery.length);
    const newValue = `${before}@${displayName} ${after}`;
    setCommentContent(newValue);
    setMentionOpen(false);
    setMentionQuery('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSendComment = async () => {
    if (!commentContent.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });

      if (res.ok) {
        setCommentContent('');
        // Refresh issue data to get new comments
        await queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
        await queryClient.invalidateQueries({ queryKey: ['issues'] });
      } else {
        toast.error('Failed to send comment');
      }
    } catch (error) {
      console.error('Failed to send comment:', error);
      toast.error('Failed to send comment');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="px-3 md:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add Comment */}
      <div className="mb-4 relative">
        <textarea
          ref={textareaRef}
          value={commentContent}
          onChange={handleTextareaChange}
          placeholder="Add a comment... Type @ to mention someone"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && mentionOpen) {
              e.preventDefault();
              setMentionOpen(false);
              return;
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSendComment();
            }
          }}
        />

        {/* @mention dropdown */}
        {mentionOpen && filteredMembers.length > 0 && (
          <div className="absolute left-3 bottom-full mb-1 z-20 w-64 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-xl overflow-hidden">
            {filteredMembers.map((member: any) => (
              <button
                key={member.id}
                type="button"
                onClick={() => insertMention(member)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-[#1C8C7D] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {(member.name || member.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name || member.email}</div>
                  {member.name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={handleSendComment}
            disabled={!commentContent.trim() || isSending}
            className="bg-primary-500 text-white hover:bg-primary-600"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
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
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {comment.content.split(/(@[A-Za-z][A-Za-z0-9_]*)/g).map((part, i) =>
                  part.startsWith('@')
                    ? <span key={i} className="text-[#1C8C7D] font-medium bg-[#1C8C7D]/10 px-1 rounded">{part}</span>
                    : <span key={i}>{part}</span>
                )}
              </p>
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

// Attachments Section Component
function AttachmentsSection({ issue }: { issue: Issue }) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/tasks/${issue.id}/attachments`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issue.id]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`/api/tasks/${issue.id}/attachments`, { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || 'Upload failed');
        }
      } catch {
        toast.error('Upload failed');
      }
    }
    setIsUploading(false);
    fetchAttachments();
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      const res = await fetch(`/api/tasks/${issue.id}/attachments?attachmentId=${attachmentId}`, { method: 'DELETE' });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        toast.success('Attachment deleted');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 px-3 md:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          Attachments ({attachments.length})
        </h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-xs font-medium text-[#1C8C7D] hover:text-[#156B60] disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] px-4 py-6 cursor-pointer hover:border-[#1C8C7D] transition-colors"
        >
          <Upload className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Drop files here or click to upload</span>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] px-3 py-2">
              <FileText className="h-4 w-4 text-[#1C8C7D] shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#1C8C7D] truncate block"
                >
                  {att.filename}
                </a>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(att.size / 1024).toFixed(1)} KB · {att.uploadedBy?.name || 'Unknown'} · {new Date(att.uploadedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(att.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Links Section Component
function LinksSection({ issue }: { issue: Issue }) {
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/tasks/${issue.id}/links`)
      .then((res) => res.ok ? res.json() : { links: [] })
      .then((data) => setLinks(data.links || []))
      .catch(() => {});
  }, [issue.id]);

  if (links.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 px-3 md:px-6 py-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <LinkIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        Linked Work Items ({links.length})
      </h2>
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={`/dashboard/issues?taskId=${link.toTask.id}`}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#22272B] px-3 py-2 hover:border-[#1C8C7D] transition-colors"
          >
            <span
              className="h-5 w-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: link.toTask.project?.color || '#3B82F6' }}
            >
              {link.toTask.project?.key?.slice(0, 2)}
            </span>
            <span className="text-xs text-[#1C8C7D] font-medium shrink-0">{link.type.toLowerCase().replace(/_/g, ' ')}</span>
            <span className="text-xs font-mono text-gray-500 shrink-0">{link.toTask.key}</span>
            <span className="text-sm text-gray-900 dark:text-white flex-1 truncate">{link.toTask.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
