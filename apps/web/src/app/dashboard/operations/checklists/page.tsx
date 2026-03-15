'use client';

import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

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
      />
    </AppLayout>
  );
}
