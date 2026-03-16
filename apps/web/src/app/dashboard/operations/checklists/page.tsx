'use client';

import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';

export default function ChecklistsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Checklists"
        description="Create, assign, and track routine maintenance tasks"
        icon={CheckCircle2}
        iconColor="#10B981"
        emptyMessage="No checklists yet. Create one to track routine tasks."
        defaultLabels={['operations', 'checklist']}
        baseHref="/dashboard/operations"
        currentTab="checklists"
        tabs={OPERATIONS_TABS}
      />
    </AppLayout>
  );
}
