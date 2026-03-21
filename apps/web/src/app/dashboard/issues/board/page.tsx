'use client';

/**
 * Production-Ready Kanban Board Page
 * Features:
 * - Drag & drop tasks between status columns
 * - Beautiful task cards with all details
 * - Real-time updates
 * - Status-based swim lanes
 * - Priority indicators
 * - Project colors
 * - Assignee avatars
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import {
  LayoutDashboard,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  PauseCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
  };
  tags?: string[];
}

interface Column {
  id: TaskStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'TODO', title: 'To Do', icon: Circle, color: 'bg-gray-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'bg-blue-500' },
  { id: 'IN_REVIEW', title: 'In Review', icon: AlertCircle, color: 'bg-purple-500' },
  { id: 'DONE', title: 'Done', icon: CheckCircle2, color: 'bg-green-500' },
  { id: 'BLOCKED', title: 'Blocked', icon: XCircle, color: 'bg-red-500' },
];

export default function IssuesBoardPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Record<TaskStatus, Task[]>>({
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
    BLOCKED: [],
  });

  // Fetch issues/tasks
  const { data: issuesData, isLoading } = useQuery<{ issues?: Task[] }>({
    queryKey: ['issues', 'board'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
    enabled: !!session,
  });

  const issues = issuesData?.issues || [];

  // Group tasks by status
  useEffect(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
      BLOCKED: [],
    };

    issues.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    setOptimisticTasks(grouped);
  }, [issues]);

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      const res = await fetch(`/api/issues/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  // Handle drag end
  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // No change
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // Optimistic update
    setOptimisticTasks((prev) => {
      const newTasks = { ...prev };
      const sourceColumn = [...newTasks[sourceStatus]];
      const destColumn = sourceStatus === destStatus ? sourceColumn : [...newTasks[destStatus]];

      const [movedTask] = sourceColumn.splice(source.index, 1);
      movedTask.status = destStatus;
      destColumn.splice(destination.index, 0, movedTask);

      newTasks[sourceStatus] = sourceColumn;
      newTasks[destStatus] = destColumn;

      return newTasks;
    });

    // Server update
    updateTaskMutation.mutate({ taskId: draggableId, newStatus: destStatus });
  }, [updateTaskMutation]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const isOverdue = date < today;
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { formatted, isOverdue };
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Please sign in to view the board.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Board"
        icon={<LayoutDashboard className="h-6 w-6" />}
        iconColor="#3B82F6"
        currentTab="board"
        baseHref="/dashboard/issues"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700"></div>
                <p className="text-sm text-gray-600 dark:text-slate-400">Loading board...</p>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex h-full gap-4">
                {COLUMNS.map((column) => {
                  const columnTasks = optimisticTasks[column.id] || [];
                  const Icon = column.icon;

                  return (
                    <div
                      key={column.id}
                      className="flex w-80 shrink-0 flex-col rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] shadow-sm"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {column.title}
                          </h3>
                          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 dark:bg-[#282E33] px-2 text-xs font-medium text-gray-600 dark:text-slate-400">
                            {columnTasks.length}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon"
                          onClick={() => setShowCreateModal(true)}
                          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#282E33] transition-colors"
                          title="Add task"
                        >
                          <Plus className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                        </Button>
                      </div>

                      {/* Droppable Column */}
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 overflow-y-auto p-3 space-y-3 ${
                              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            {columnTasks.map((task, index) => {
                              const dueDate = formatDueDate(task.dueDate);

                              return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedTaskId(task.id)}
                                      className={`group cursor-grab rounded-lg border-l-4 bg-white dark:bg-[#22272B] p-3 shadow-sm transition-shadow hover:shadow-md ${
                                        snapshot.isDragging ? 'shadow-lg' : ''
                                      }`}
                                      style={{
                                        borderLeftColor: task.project.color,
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      {/* Task Header */}
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                          <span className="text-xs font-semibold text-primary-500">{task.key}</span>
                                        </div>
                                        {dueDate && (
                                          <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                            dueDate.isOverdue
                                              ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                              : 'bg-gray-100 text-gray-600 dark:bg-[#282E33] dark:text-slate-400'
                                          }`}>
                                            <Clock className="h-3 w-3" />
                                            {dueDate.formatted}
                                          </div>
                                        )}
                                      </div>

                                      {/* Task Title */}
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {task.title}
                                      </h4>

                                      {/* Task Description */}
                                      {task.description && (
                                        <p className="text-xs text-gray-600 dark:text-slate-400 mb-3 line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}

                                      {/* Task Footer */}
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: task.project.color }}
                                          />
                                          <span className="text-xs text-gray-500 dark:text-[#6B7684]">
                                            {task.project.key}
                                          </span>
                                        </div>

                                        {task.assignee && (
                                          <div className="flex items-center gap-1.5">
                                            {task.assignee.avatar ? (
                                              <img
                                                src={task.assignee.avatar}
                                                alt={task.assignee.name}
                                                className="h-5 w-5 rounded-full"
                                              />
                                            ) : (
                                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[9px] font-medium text-white">
                                                {task.assignee.name.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Tags */}
                                      {task.tags && task.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {task.tags.slice(0, 2).map((tag, idx) => (
                                            <span
                                              key={idx}
                                              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#282E33] text-gray-600 dark:text-slate-400"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                          {task.tags.length > 2 && (
                                            <span className="text-[10px] text-gray-500 dark:text-[#6B7684]">
                                              +{task.tags.length - 2}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}

                            {/* Empty State */}
                            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className={`mb-2 h-2 w-2 rounded-full ${column.color} opacity-30`} />
                                <p className="text-xs text-gray-500 dark:text-[#6B7684]">No tasks</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Issue Detail Slideout - drill-down on card click */}
      {selectedTaskId && (
        <IssueDetailSlideout
          issueId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </AppLayout>
  );
}
