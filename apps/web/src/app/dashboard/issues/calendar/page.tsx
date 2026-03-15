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
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color: string };
  tags?: string[];
  dependencies?: string[];
}

export default function IssuesCalendarPage() {
  const { data: session } = useSession();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);

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

  const { data: issuesData, isLoading } = useQuery<{ issues?: Issue[] }>({
    queryKey: ['issues', 'calendar'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
    enabled: !!session,
  });

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

  if (!session) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-slate-500">Please sign in to view the calendar.</p>
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

      <div className="flex h-full flex-col bg-white dark:bg-[#1B1F23]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500 dark:border-slate-700"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <DualCalendar
            tasks={calendarTasks}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
            onDateClick={(date) => setCreateTaskDate(date)}
            onCreateTask={(date) => setCreateTaskDate(date)}
            defaultView="month"
            defaultCalendarSystem="gregorian"
            showFilters
            showControls
          />
        )}
      </div>

      {selectedTaskId && (
        <IssueDetailSlideout
          issueId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

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
