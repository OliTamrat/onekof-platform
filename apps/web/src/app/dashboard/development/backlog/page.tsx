'use client';

import { ListChecks } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

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
      />
    </AppLayout>
  );
}
