'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { CreateIssueModal } from '@/components/issues/create-issue-modal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

interface Task {
  id: string;
  title: string;
  key: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
  };
}

export default function IssuesCalendarPage() {
  const { data: session } = useSession();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current project
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    enabled: !!session,
  });

  const currentProject = projectsData?.projects?.[0];

  // Fetch issues/tasks
  const { data: issuesData, isLoading } = useQuery<{ tasks: Task[] }>({
    queryKey: ['issues', 'calendar'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
    enabled: !!session,
  });

  const tasks = issuesData?.tasks || [];

  // Get calendar data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'TODO':
        return 'text-gray-600 dark:text-gray-400';
      case 'IN_PROGRESS':
        return 'text-blue-600 dark:text-blue-400';
      case 'IN_REVIEW':
        return 'text-purple-600 dark:text-purple-400';
      case 'DONE':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Please sign in to view the calendar.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Project Page Header with Navigation */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <div className="flex-1 overflow-auto p-6">
          {/* Calendar Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatMonthYear()}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={goToToday}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="rounded-lg border border-gray-300 bg-white p-2 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => setViewMode('month')}
                className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`rounded px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && (
            <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="border-r border-gray-200 p-4 text-center text-sm font-medium text-gray-700 last:border-r-0 dark:border-gray-700 dark:text-gray-300"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {getCalendarDays().map((date, index) => {
                  const dayTasks = getTasksForDate(date);
                  const today = isToday(date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] border-b border-r border-gray-200 p-2 last:border-r-0 dark:border-gray-700 ${
                        !date ? 'bg-gray-50 dark:bg-gray-900' : ''
                      }`}
                    >
                      {date && (
                        <>
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                                today
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {date.getDate()}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>

                          {/* Tasks for this day */}
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className="group relative cursor-pointer rounded border border-gray-200 bg-white p-1.5 text-xs hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500"
                              >
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`h-2 w-2 flex-shrink-0 rounded-full ${getPriorityColor(
                                      task.priority
                                    )}`}
                                  />
                                  <span className="truncate font-medium text-gray-900 dark:text-white">
                                    {task.key}
                                  </span>
                                </div>
                                <div className="mt-0.5 truncate text-gray-600 dark:text-gray-400">
                                  {task.title}
                                </div>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <button className="w-full rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                                +{dayTasks.length - 3} more
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View Placeholder */}
          {viewMode === 'week' && (
            <div className="flex h-[600px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Week View
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Week view coming soon
                </p>
              </div>
            </div>
          )}

          {/* Day View Placeholder */}
          {viewMode === 'day' && (
            <div className="flex h-[600px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="text-center">
                <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Day View
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Day view coming soon
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex h-[600px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 dark:border-gray-700"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading calendar...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
    </AppLayout>
  );
}
