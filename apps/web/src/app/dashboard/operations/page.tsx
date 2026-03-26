'use client';

import { Activity } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function OperationsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Operations"
        description="Monitor operations, manage incidents, and track maintenance checklists"
        icon={Activity}
        iconColor="#EF4444"
        emptyMessage="No operations tasks yet. Create one to get started."
        defaultLabels={['operations']}
        baseHref="/dashboard/operations"
        currentTab="incidents"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
