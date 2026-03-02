'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search, Filter, MoreHorizontal, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';

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

// Status columns configuration
const STATUS_COLUMNS = [
  { id: 'TODO', label: 'To Do', color: '#94A3B8' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6' },
  { id: 'IN_REVIEW', label: 'In Review', color: '#F59E0B' },
  { id: 'DONE', label: 'Done', color: '#10B981' },
] as const;

export default function IssuesPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingInColumn, setCreatingInColumn] = useState<string | null>(null);
  const [newIssueTitle, setNewIssueTitle] = useState('');
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

  // Fetch issues
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', selectedProject],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProject) {
        params.append('projectId', selectedProject);
      }
      const res = await fetch(`/api/issues?${params}`);
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  // Update issue status mutation
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: string }) => {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async ({ title, status, projectId }: { title: string; status: string; projectId: string }) => {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, status, projectId }),
      });
      if (!res.ok) throw new Error('Failed to create issue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setCreatingInColumn(null);
      setNewIssueTitle('');
    },
  });

  // Filter and organize issues by status
  const filteredIssues = issuesData?.issues?.filter((issue: Issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.key.toLowerCase().includes(query) ||
      issue.title.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  }) || [];

  const issuesByStatus = filteredIssues.reduce((acc: Record<string, Issue[]>, issue: Issue) => {
    const status = issue.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(issue);
    return acc;
  }, {});

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update issue status
    const newStatus = destination.droppableId;
    updateIssueMutation.mutate({ issueId: draggableId, status: newStatus });
  };

  const handleCreateIssue = (status: string) => {
    if (!newIssueTitle.trim()) return;

    // Get project ID from selected project or first available project
    let projectId = selectedProject;

    if (!projectId && projectsData?.projects?.length > 0) {
      projectId = projectsData.projects[0].id;
    }

    if (!projectId) {
      alert('No projects found. Please create a project first from the Projects page.');
      return;
    }

    createIssueMutation.mutate({
      title: newIssueTitle,
      status,
      projectId,
    });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-slate-50 dark:bg-[#1B1F23]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-[#22272B]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kanban Board
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and track your team's work
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-lg border border-gray-300 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-[#2D3748] dark:text-white"
              />
            </div>

            {/* Filter */}
            <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-[#2D3748] dark:text-gray-200 dark:hover:bg-gray-600">
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {/* Settings */}
            <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-[#2D3748] dark:text-gray-200 dark:hover:bg-gray-600">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-500">Loading issues...</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4">
              {STATUS_COLUMNS.map((column) => (
                <div
                  key={column.id}
                  className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-slate-100 dark:bg-[#22272B]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.label}
                      </h3>
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-[#2D3748] dark:text-gray-300">
                        {issuesByStatus[column.id]?.length || 0}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 overflow-y-auto p-3 ${
                          snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-[#2D3748]' : ''
                        }`}
                      >
                        {issuesByStatus[column.id]?.map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedIssue(issue)}
                                className={`cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-600 dark:bg-[#1B1F23] ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <IssueCard issue={issue} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add Issue Button/Form */}
                        {creatingInColumn === column.id ? (
                          <div className="space-y-2 rounded-lg border-2 border-teal-500 bg-white p-3 dark:bg-[#1B1F23]">
                            <input
                              type="text"
                              placeholder="Issue title..."
                              value={newIssueTitle}
                              onChange={(e) => setNewIssueTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCreateIssue(column.id);
                                } else if (e.key === 'Escape') {
                                  setCreatingInColumn(null);
                                  setNewIssueTitle('');
                                }
                              }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none dark:border-slate-600 dark:bg-[#22272B] dark:text-white"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCreateIssue(column.id)}
                                disabled={createIssueMutation.isPending}
                                className="rounded bg-teal-600 px-3 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                              >
                                {createIssueMutation.isPending ? 'Creating...' : 'Add'}
                              </button>
                              <button
                                onClick={() => {
                                  setCreatingInColumn(null);
                                  setNewIssueTitle('');
                                }}
                                className="rounded px-3 py-1 text-xs text-gray-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCreatingInColumn(column.id)}
                            className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-slate-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                            Add issue
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
    </AppLayout>
  );
}

// Issue Card Component
function IssueCard({ issue }: { issue: Issue }) {
  // Type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return '🐛';
      case 'STORY':
        return '📖';
      case 'EPIC':
        return '⚡';
      case 'SUBTASK':
        return '📋';
      default:
        return '✓';
    }
  };

  // Priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGHEST':
        return 'text-red-600';
      case 'HIGH':
        return 'text-orange-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      case 'LOWEST':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-2">
      {/* Issue Key & Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getTypeIcon(issue.type)}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {issue.key}
          </span>
        </div>
        <div className={`text-lg ${getPriorityColor(issue.priority)}`}>
          {issue.priority === 'HIGHEST' && '⬆️'}
          {issue.priority === 'HIGH' && '🔺'}
          {issue.priority === 'MEDIUM' && '➡️'}
          {issue.priority === 'LOW' && '🔻'}
          {issue.priority === 'LOWEST' && '⬇️'}
        </div>
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
        {issue.title}
      </h4>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {issue.labels.map((label) => (
            <span
              key={label}
              className="rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-200"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          {issue.assignee ? (
            <>
              {issue.assignee.avatar ? (
                <img
                  src={issue.assignee.avatar}
                  alt={issue.assignee.name || ''}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                  {issue.assignee.name?.charAt(0) || '?'}
                </div>
              )}
            </>
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600" />
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {issue.commentCount > 0 && (
            <span className="flex items-center gap-1">
              💬 {issue.commentCount}
            </span>
          )}
          {issue.attachmentCount > 0 && (
            <span className="flex items-center gap-1">
              📎 {issue.attachmentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
