'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Calendar, ChevronDown, Settings, MoreHorizontal,
  Link2, FileText, Zap, CheckCircle2, Plus, Send, ChevronUp, Check
} from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/ui/alert-modal';

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
  subtasks?: Subtask[];
  subtaskProgress?: number;
  comments?: Comment[];
  commentCount: number;
  attachmentCount: number;
  labels?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  goals?: any[];
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

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
}

export function IssueDetailModal({ issue: initialIssue, onClose }: IssueDetailModalProps) {
  const [editedStatus, setEditedStatus] = useState(initialIssue.status);
  const [editedDescription, setEditedDescription] = useState(initialIssue.description || '');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const queryClient = useQueryClient();

  // Helper function to show alert modal
  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  // Fetch full issue details with auto-refetch
  const { data: issueData, refetch } = useQuery({
    queryKey: ['issue', initialIssue.id],
    queryFn: async () => {
      const res = await fetch(`/api/issues/${initialIssue.id}`);
      if (!res.ok) throw new Error('Failed to fetch issue');
      const data = await res.json();
      return data.issue;
    },
    refetchInterval: false, // Don't auto-refetch
  });

  const issue = issueData || initialIssue;

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
      // Force refetch the issue details
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Create subtask mutation
  const createSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/issues/${issue.id}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to create subtask');
      return res.json();
    },
    onSuccess: async () => {
      // Force refetch the issue details to show new subtask
      await refetch();
      setNewSubtaskTitle('');
      setIsCreatingSubtask(false);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to create comment');
      return res.json();
    },
    onSuccess: async () => {
      // Force refetch the issue details to show new comment
      await refetch();
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setEditedStatus(newStatus as any);
    updateIssueMutation.mutate({ status: newStatus });
  };

  const handleDescriptionSave = () => {
    updateIssueMutation.mutate({ description: editedDescription });
    setIsEditingDescription(false);
  };

  const handleCreateSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    createSubtaskMutation.mutate(newSubtaskTitle);
  };

  const handlePostComment = () => {
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'STORY': return 'Story';
      case 'BUG': return 'Bug';
      case 'TASK': return 'Task';
      case 'EPIC': return 'Epic';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    // Return appropriate icon based on type
    return <Zap className="h-4 w-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50">
      {/* Side Panel */}
      <div className="flex h-full w-full max-w-4xl flex-col bg-[#22272B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C333A] px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              className="text-[#9FADBC] hover:text-white transition-colors"
              title="Settings"
              onClick={() => showAlert('Settings', 'Settings functionality coming soon!', 'info')}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              className="text-[#9FADBC] hover:text-white transition-colors"
              title="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showAlert('Success', 'Link copied to clipboard!', 'success');
              }}
            >
              <Link2 className="h-5 w-5" />
            </button>
            <button
              className="text-[#9FADBC] hover:text-white transition-colors"
              title="More actions"
              onClick={() => showAlert('More Actions', 'Available actions: Delete, Archive, Move, Clone, Export', 'info')}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-[#9FADBC] hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Main Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Issue Header */}
            <div className="mb-6">
              <h1 className="mb-4 text-2xl font-medium text-white">
                {issue.title}
              </h1>

              <div className="flex items-center gap-3">
                {/* Status Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="flex items-center gap-2 rounded-md bg-[#0065FF] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] cursor-pointer focus:outline-none transition-colors disabled:opacity-50"
                    disabled={updateIssueMutation.isPending}
                  >
                    {editedStatus === 'TODO' && 'To Do'}
                    {editedStatus === 'IN_PROGRESS' && 'In Progress'}
                    {editedStatus === 'IN_REVIEW' && 'In Review'}
                    {editedStatus === 'DONE' && 'Done'}
                    {editedStatus === 'BLOCKED' && 'Blocked'}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-[#DFE1E6] shadow-lg min-w-[160px]">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('TODO')}
                      className={`text-sm cursor-pointer ${
                        editedStatus === 'TODO'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {editedStatus === 'TODO' && <Check className="h-4 w-4 mr-2" />}
                      <span className={editedStatus !== 'TODO' ? 'ml-6' : ''}>To Do</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      className={`text-sm cursor-pointer ${
                        editedStatus === 'IN_PROGRESS'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {editedStatus === 'IN_PROGRESS' && <Check className="h-4 w-4 mr-2" />}
                      <span className={editedStatus !== 'IN_PROGRESS' ? 'ml-6' : ''}>In Progress</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('IN_REVIEW')}
                      className={`text-sm cursor-pointer ${
                        editedStatus === 'IN_REVIEW'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {editedStatus === 'IN_REVIEW' && <Check className="h-4 w-4 mr-2" />}
                      <span className={editedStatus !== 'IN_REVIEW' ? 'ml-6' : ''}>In Review</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('DONE')}
                      className={`text-sm cursor-pointer ${
                        editedStatus === 'DONE'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {editedStatus === 'DONE' && <Check className="h-4 w-4 mr-2" />}
                      <span className={editedStatus !== 'DONE' ? 'ml-6' : ''}>Done</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('BLOCKED')}
                      className={`text-sm cursor-pointer ${
                        editedStatus === 'BLOCKED'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {editedStatus === 'BLOCKED' && <Check className="h-4 w-4 mr-2" />}
                      <span className={editedStatus !== 'BLOCKED' ? 'ml-6' : ''}>Blocked</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Type Badge */}
                <div className="flex items-center gap-2 rounded-md border border-[#2C333A] bg-[#282E33] px-3 py-1.5 text-sm font-medium text-white">
                  {getTypeIcon(issue.type)}
                  {getTypeLabel(issue.type)}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <button className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-white">
                Description
                <ChevronDown className="h-4 w-4" />
              </button>

              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border border-[#2C333A] bg-[#1B1F23] px-3 py-2 text-sm text-white placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none"
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDescriptionSave}
                      disabled={updateIssueMutation.isPending}
                      className="rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] disabled:opacity-50 transition-colors"
                    >
                      {updateIssueMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingDescription(false);
                        setEditedDescription(issue.description || '');
                      }}
                      className="rounded-md border border-[#2C333A] bg-[#282E33] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2C333A] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className="cursor-pointer rounded-md border border-transparent px-3 py-2 text-sm text-[#9FADBC] hover:border-[#2C333A] hover:bg-[#282E33] transition-colors min-h-[80px]"
                >
                  {issue.description || 'Click to add a description...'}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div className="mb-6">
              <button className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-white">
                <div className="flex items-center gap-2">
                  Subtasks
                  <span className="text-[#9FADBC]">{issue.subtaskProgress || 0}% Done</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Progress Bar */}
              <div className="mb-3 h-2 w-full rounded-full bg-[#2C333A]">
                <div
                  className="h-2 rounded-full bg-[#0065FF] transition-all duration-300"
                  style={{ width: `${issue.subtaskProgress || 0}%` }}
                />
              </div>

              {/* Subtask List */}
              <div className="space-y-2">
                {issue.subtasks && issue.subtasks.length > 0 ? (
                  issue.subtasks.map((subtask: Subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 rounded-md border border-[#2C333A] bg-[#1B1F23] p-3 hover:bg-[#282E33] transition-colors cursor-pointer"
                      onClick={() => showAlert('Open Subtask', `Opening subtask ${subtask.key}: ${subtask.title}`, 'info')}
                    >
                      <CheckCircle2
                        className={`h-4 w-4 transition-colors ${
                          subtask.status === 'DONE' ? 'text-[#0065FF]' : 'text-[#9FADBC]'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white">{subtask.title}</div>
                        <div className="text-xs text-[#9FADBC]">{subtask.key}</div>
                      </div>
                      {subtask.assignee && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                          {subtask.assignee.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  !isCreatingSubtask && (
                    <div className="text-center py-4 text-sm text-[#9FADBC]">
                      No subtasks yet
                    </div>
                  )
                )}

                {/* Create Subtask Form */}
                {isCreatingSubtask ? (
                  <div className="flex gap-2 rounded-md border border-[#0065FF] bg-[#1B1F23] p-3">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !createSubtaskMutation.isPending) {
                          handleCreateSubtask();
                        }
                        if (e.key === 'Escape') {
                          setIsCreatingSubtask(false);
                          setNewSubtaskTitle('');
                        }
                      }}
                      placeholder="Subtask title..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-[#9FADBC] focus:outline-none"
                      autoFocus
                      disabled={createSubtaskMutation.isPending}
                    />
                    <button
                      onClick={handleCreateSubtask}
                      disabled={createSubtaskMutation.isPending || !newSubtaskTitle.trim()}
                      className="text-[#0065FF] hover:text-white disabled:opacity-50 transition-colors"
                      title="Add subtask"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCreatingSubtask(true)}
                    className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-[#9FADBC] hover:bg-[#282E33] hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add subtask
                  </button>
                )}
              </div>
            </div>

            {/* Linked Goals */}
            {issue.goals && issue.goals.length > 0 && (
              <div className="mb-6">
                <button className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-white">
                  Linked to Goals
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div className="space-y-2">
                  {issue.goals.map((goalLink: any) => (
                    <div
                      key={goalLink.goal.id}
                      className="rounded-md border border-[#2C333A] bg-[#1B1F23] p-3 hover:bg-[#282E33] transition-colors cursor-pointer"
                      onClick={() => showAlert('Open Goal', `Opening goal: ${goalLink.goal.title}`, 'info')}
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-[#0065FF]" />
                        <span className="text-sm font-medium text-white">{goalLink.goal.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation Section */}
            <div className="mb-6">
              <button className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-white">
                <div className="flex items-center gap-2">
                  Documentation
                </div>
                <MoreHorizontal className="h-4 w-4" />
              </button>

              <button
                onClick={() => showAlert('Link Documentation', 'Connect this issue to wiki pages, docs, or knowledge base articles', 'info')}
                className="flex w-full items-center gap-2 rounded-md border border-[#2C333A] bg-[#1B1F23] p-3 text-sm text-[#9FADBC] hover:bg-[#282E33] hover:text-white transition-colors"
              >
                <FileText className="h-4 w-4" />
                Link documentation
              </button>
            </div>

            {/* Activity - Comments */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2 border-b border-[#2C333A] pb-2">
                <button className="border-b-2 border-[#0065FF] px-1 pb-2 text-sm font-medium text-white">
                  Comments
                </button>
                <span className="text-sm text-[#9FADBC]">({issue.comments?.length || 0})</span>
              </div>

              {/* Comments List */}
              {issue.comments && issue.comments.length > 0 && (
                <div className="mb-4 space-y-4">
                  {issue.comments.map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0065FF] text-sm font-medium text-white">
                        {comment.author.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{comment.author.name}</span>
                          <span className="text-xs text-[#9FADBC]">
                            {format(new Date(comment.createdAt), 'PPp')}
                          </span>
                        </div>
                        <div className="rounded-md border border-[#2C333A] bg-[#1B1F23] px-3 py-2 text-sm text-white">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0065FF] text-sm font-medium text-white">
                  {issue.assignee?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full rounded-md border border-[#2C333A] bg-[#1B1F23] px-3 py-2 text-sm text-white placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none transition-colors"
                    disabled={createCommentMutation.isPending}
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={createCommentMutation.isPending || !commentContent.trim()}
                    className="mt-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] disabled:opacity-50 transition-colors"
                  >
                    {createCommentMutation.isPending ? 'Posting...' : 'Comment'}
                  </button>
                  <div className="mt-2 text-xs text-[#9FADBC]">
                    Pro tip: press <kbd className="rounded bg-[#2C333A] px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded bg-[#2C333A] px-1.5 py-0.5">Enter</kbd> to comment
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-1 text-xs text-[#9FADBC]">
              <div>Created {format(new Date(issue.createdAt), 'PPp')}</div>
              <div>Updated {format(new Date(issue.updatedAt), 'PPp')}</div>
            </div>
          </div>

          {/* Right Sidebar - Details */}
          <div className="w-64 border-l border-[#2C333A] bg-[#1B1F23] px-6 py-6 overflow-y-auto">
            {/* Details Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Details</h3>
              <button
                className="text-[#9FADBC] hover:text-white transition-colors"
                onClick={() => showAlert('Configure Details', 'Customize which fields to show in the Details panel', 'info')}
                title="Configure details"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Assignee */}
              <div>
                <div className="mb-1 text-xs font-medium text-[#9FADBC]">Assignee</div>
                {issue.assignee ? (
                  <div className="flex items-center gap-2">
                    {issue.assignee.avatar ? (
                      <img
                        src={issue.assignee.avatar}
                        alt={issue.assignee.name}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                        {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-sm text-white">{issue.assignee.name}</span>
                  </div>
                ) : (
                  <button
                    className="text-sm text-[#0065FF] hover:underline"
                    onClick={() => showAlert('Assign to Me', 'This feature will assign this issue to you automatically', 'info')}
                  >
                    Assign to me
                  </button>
                )}
              </div>

              {/* Priority */}
              <div>
                <div className="mb-1 text-xs font-medium text-[#9FADBC]">Priority</div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center justify-between w-full rounded-md border border-[#2C333A] bg-[#282E33] px-3 py-1.5 text-sm text-white hover:bg-[#2C333A] cursor-pointer focus:outline-none transition-colors">
                    <span>{issue.priority || 'None'}</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-[#DFE1E6] shadow-lg min-w-[160px]">
                    <DropdownMenuItem
                      onClick={() => updateIssueMutation.mutate({ priority: 'HIGHEST' })}
                      className={`text-sm cursor-pointer ${
                        issue.priority === 'HIGHEST'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {issue.priority === 'HIGHEST' && <Check className="h-4 w-4 mr-2" />}
                      <span className={issue.priority !== 'HIGHEST' ? 'ml-6' : ''}>Highest</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateIssueMutation.mutate({ priority: 'HIGH' })}
                      className={`text-sm cursor-pointer ${
                        issue.priority === 'HIGH'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {issue.priority === 'HIGH' && <Check className="h-4 w-4 mr-2" />}
                      <span className={issue.priority !== 'HIGH' ? 'ml-6' : ''}>High</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateIssueMutation.mutate({ priority: 'MEDIUM' })}
                      className={`text-sm cursor-pointer ${
                        issue.priority === 'MEDIUM'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {issue.priority === 'MEDIUM' && <Check className="h-4 w-4 mr-2" />}
                      <span className={issue.priority !== 'MEDIUM' ? 'ml-6' : ''}>Medium</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateIssueMutation.mutate({ priority: 'LOW' })}
                      className={`text-sm cursor-pointer ${
                        issue.priority === 'LOW'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {issue.priority === 'LOW' && <Check className="h-4 w-4 mr-2" />}
                      <span className={issue.priority !== 'LOW' ? 'ml-6' : ''}>Low</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateIssueMutation.mutate({ priority: 'LOWEST' })}
                      className={`text-sm cursor-pointer ${
                        issue.priority === 'LOWEST'
                          ? 'bg-[#0065FF] text-white hover:bg-[#0052CC]'
                          : 'text-gray-900 hover:bg-[#F4F5F7]'
                      }`}
                    >
                      {issue.priority === 'LOWEST' && <Check className="h-4 w-4 mr-2" />}
                      <span className={issue.priority !== 'LOWEST' ? 'ml-6' : ''}>Lowest</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Due Date */}
              <div>
                <div className="mb-1 text-xs font-medium text-[#9FADBC]">Due date</div>
                {issue.dueDate ? (
                  <div className="relative">
                    <DatePicker
                      selected={issue.dueDate ? new Date(issue.dueDate) : null}
                      onChange={(date: Date | null) => {
                        updateIssueMutation.mutate({ dueDate: date ? date.toISOString() : null });
                      }}
                      customInput={
                        <div className="flex items-center gap-1.5 text-sm text-white cursor-pointer hover:text-[#0065FF] transition-colors">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(new Date(issue.dueDate), 'MMM dd, yyyy')}</span>
                        </div>
                      }
                      dateFormat="MMM dd, yyyy"
                      className="cursor-pointer"
                      calendarClassName="!bg-white !border-[#DFE1E6] !shadow-lg"
                      wrapperClassName="w-full"
                    />
                  </div>
                ) : (
                  <DatePicker
                    selected={null}
                    onChange={(date: Date | null) => {
                      updateIssueMutation.mutate({ dueDate: date ? date.toISOString() : null });
                    }}
                    customInput={
                      <button className="text-sm text-[#0065FF] hover:underline">
                        Set due date
                      </button>
                    }
                    dateFormat="MMM dd, yyyy"
                    calendarClassName="!bg-white !border-[#DFE1E6] !shadow-lg"
                  />
                )}
              </div>

              {/* Labels */}
              <div>
                <div className="mb-1 text-xs font-medium text-[#9FADBC]">Labels</div>
                {issue.labels && Array.isArray(issue.labels) && issue.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((label: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-sm bg-[#2C333A] px-2 py-1 text-xs text-white"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button
                    className="text-sm text-[#0065FF] hover:underline"
                    onClick={() => showAlert('Add Labels', 'Add tags and labels to categorize this issue', 'info')}
                  >
                    Add labels
                  </button>
                )}
              </div>

              {/* Reporter */}
              <div>
                <div className="mb-1 text-xs font-medium text-[#9FADBC]">Reporter</div>
                {issue.reporter ? (
                  <div className="flex items-center gap-2">
                    {issue.reporter.avatar ? (
                      <img
                        src={issue.reporter.avatar}
                        alt={issue.reporter.name}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                        {issue.reporter.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="text-sm text-white">{issue.reporter.name}</span>
                  </div>
                ) : (
                  <div className="text-sm text-white">None</div>
                )}
              </div>

              {/* Development */}
              <div className="border-t border-[#2C333A] pt-4">
                <button
                  onClick={() => setShowDevelopment(!showDevelopment)}
                  className="flex w-full items-center justify-between text-xs font-medium text-[#9FADBC] hover:text-white transition-colors"
                >
                  <span>Development</span>
                  {showDevelopment ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {showDevelopment && (
                  <div className="mt-2 space-y-2 text-xs text-white">
                    <button
                      onClick={() => showAlert('Create Branch', 'Create a new Git branch for this issue', 'info')}
                      className="block w-full text-left text-[#0065FF] hover:underline"
                    >
                      + Create branch
                    </button>
                    <button
                      onClick={() => showAlert('Link Pull Request', 'Link an existing pull request to this issue', 'info')}
                      className="block w-full text-left text-[#0065FF] hover:underline"
                    >
                      + Link PR
                    </button>
                  </div>
                )}
              </div>

              {/* Automation */}
              <div className="border-t border-[#2C333A] pt-4">
                <button
                  onClick={() => setShowAutomation(!showAutomation)}
                  className="flex w-full items-center justify-between text-xs font-medium text-[#9FADBC] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Automation</span>
                  </div>
                  {showAutomation ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
                {showAutomation && (
                  <div className="mt-2 space-y-2 text-xs text-white">
                    <div className="text-[#9FADBC]">No automation rules</div>
                    <button
                      onClick={() => showAlert('Add Automation Rule', 'Create rules for auto-assign, status transitions, and notifications', 'info')}
                      className="block w-full text-left text-[#0065FF] hover:underline"
                    >
                      + Add rule
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Configure Button */}
            <button
              onClick={() => showAlert('Configure Issue', 'Customize fields, workflows, and automation settings for this issue', 'info')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-[#2C333A] bg-[#282E33] px-3 py-2 text-sm font-medium text-white hover:bg-[#2C333A] transition-colors"
            >
              <Settings className="h-4 w-4" />
              Configure
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
