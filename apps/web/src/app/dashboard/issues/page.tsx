'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search, Filter, Calendar, CheckSquare, Clock, MessageSquare, Paperclip, BarChart3, Code, FileText, Book } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import Link from 'next/link';

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
  { id: 'TODO', label: 'TO DO' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { id: 'IN_REVIEW', label: 'IN REVIEW' },
  { id: 'DONE', label: 'DONE' },
] as const;

// Tab navigation items
const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/issues/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/issues/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/issues', active: true },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/issues/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/issues/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/issues/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/issues/pages' },
] as const;

export default function IssuesPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Fetch issues with filters
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', selectedProject, selectedTeam, selectedGoal],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProject) {
        params.append('projectId', selectedProject);
      }
      if (selectedTeam) {
        params.append('teamId', selectedTeam);
      }
      if (selectedGoal) {
        params.append('goalId', selectedGoal);
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
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Project Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                {projectsData?.projects?.[0]?.key?.substring(0, 2) || 'MS'}
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {projectsData?.projects?.[0]?.name || 'My Software Team'}
              </h1>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#9FADBC]" />
              <input
                type="text"
                placeholder="Search board"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none"
              />
            </div>

            <button className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-[#2C333A] bg-gray-100 dark:bg-[#282E33] px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2C333A]">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-[#9FADBC]">Loading issues...</div>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex h-full gap-4">
                {STATUS_COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className="flex w-72 flex-shrink-0 flex-col"
                  >
                    {/* Column Header */}
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-[#9FADBC]">
                        {column.label}
                      </h3>
                      <span className="rounded-sm bg-gray-200 dark:bg-[#2C333A] px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                        {issuesByStatus[column.id]?.length || 0}
                      </span>
                    </div>

                    {/* Column Content */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 space-y-2 overflow-y-auto"
                        >
                          {issuesByStatus[column.id]?.map((issue, index) => (
                            <Draggable key={issue.id} draggableId={issue.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedIssue(issue)}
                                  className={`cursor-pointer rounded-md border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-3 transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-[#0065FF]' : ''
                                  }`}
                                >
                                  <IssueCard issue={issue} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {/* Add Issue Button */}
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 dark:text-[#9FADBC] hover:bg-gray-100 dark:hover:bg-[#282E33] hover:text-gray-900 dark:hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                            Create
                          </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Issue Detail Slide-Out */}
      {selectedIssue && (
        <IssueDetailSlideout
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          defaultProjectId={selectedProject || undefined}
        />
      )}
    </div>
    </AppLayout>
  );
}

// Issue Card Component - Clean Jira-style design
function IssueCard({ issue }: { issue: Issue }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <div className="space-y-2.5">
      {/* Title */}
      <h4 className="line-clamp-2 text-sm font-normal text-gray-900 dark:text-white leading-snug">
        {issue.title}
      </h4>

      {/* Due Date */}
      {issue.dueDate && (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-[#9FADBC]">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(issue.dueDate)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {/* Issue Key */}
        <div className="flex items-center gap-2">
          <CheckSquare className="h-3.5 w-3.5 text-[#0065FF]" />
          <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
            {issue.key}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          {issue.assignee ? (
            issue.assignee.avatar ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name || ''}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-[#2C333A]" />
          )}
        </div>
      </div>
    </div>
  );
}
