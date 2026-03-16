'use client';

import { FileText } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';

export default function FindingsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Findings"
        description="Document research findings and insights"
        icon={FileText}
        iconColor="#3B82F6"
        emptyMessage="No findings yet. Create one to document insights."
        defaultLabels={['research', 'findings']}
        baseHref="/dashboard/research"
        currentTab="findings"
        tabs={RESEARCH_TABS}
      />
    </AppLayout>
  );
}
