'use client';

import { ListChecks } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';

export default function BacklogPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Backlog"
        description="Organize and prioritize work items for upcoming sprints"
        icon={ListChecks}
        iconColor="#22C55E"
        emptyMessage="No backlog items yet. Create one to start organizing work."
        defaultLabels={['development', 'backlog']}
        baseHref="/dashboard/development"
        currentTab="backlog"
        tabs={DEVELOPMENT_TABS}
      />
    </AppLayout>
  );
}
