'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { IssueDetailSlideout } from '@/components/issues/issue-detail-slideout';
import { QuickAddEventModal } from '@/components/calendar/quick-add-event-modal';
import { DualCalendar, type CalendarTask } from '@/components/calendar/dual-calendar';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  key: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string | null;
  startDate?: string | null;
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
  dependencies?: string[];
}

export default function IssuesCalendarPage() {
  const { data: session } = useSession();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);

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
  const { data: issuesData, isLoading } = useQuery<{ issues?: Issue[] }>({
    queryKey: ['issues', 'calendar'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
    enabled: !!session,
  });

  // Transform issues to CalendarTask format
  const calendarTasks: CalendarTask[] = (issuesData?.issues || []).map((issue: Issue) => ({
    id: issue.id,
    title: issue.title,
    key: issue.key,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    dueDate: issue.dueDate ? new Date(issue.dueDate) : null,
    startDate: issue.startDate ? new Date(issue.startDate) : null,
    assignee: issue.assignee,
    project: issue.project,
    tags: issue.tags,
    dependencies: issue.dependencies,
  }));

  // Handlers for calendar interactions
  const handleTaskClick = (task: CalendarTask) => {
    setSelectedTaskId(task.id);
  };

  const handleDateClick = (date: Date) => {
    setCreateTaskDate(date);
  };

  const handleCreateTask = (date: Date) => {
    setCreateTaskDate(date);
  };

  const handleTaskUpdate = (task: CalendarTask) => {
    // Updates are handled by the slideout via mutations
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
      <UnifiedPageHeader
        title="Calendar"
        icon={<CalendarIcon className="h-6 w-6" />}
        iconColor="#EC4899"
        currentTab="calendar"
        baseHref="/dashboard/issues"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0065FF] dark:border-gray-700"></div>
              <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                Loading calendar...
              </p>
            </div>
          </div>
        ) : (
          <DualCalendar
            tasks={calendarTasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
            onDateClick={handleDateClick}
            onCreateTask={handleCreateTask}
            defaultView="month"
            defaultCalendarSystem="gregorian"
            showFilters={true}
            showControls={true}
          />
        )}
      </div>

      {/* Task Detail Slideout - Opens when task is clicked */}
      {selectedTaskId && (
        <IssueDetailSlideout
          issueId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Quick Add Event Modal - Opens when date is clicked */}
      {createTaskDate && (
        <QuickAddEventModal
          date={createTaskDate}
          onClose={() => setCreateTaskDate(null)}
          projectId={currentProject?.id}
        />
      )}
    </AppLayout>
  );
}
