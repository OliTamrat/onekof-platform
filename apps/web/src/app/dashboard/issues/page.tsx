'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, CheckSquare, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import type { ProjectType } from '@/lib/project-navigation';

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

  // Get current project
  const currentProject = projectsData?.projects?.[0];

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
        {/* Project Page Header */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
          showSearch
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showFilter
        />

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 md:px-6 py-4">
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
