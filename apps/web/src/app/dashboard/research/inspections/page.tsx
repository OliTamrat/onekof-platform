'use client';

import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';

export default function InspectionsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Inspections"
        description="Schedule and track site inspections and surveys"
        icon={CheckCircle2}
        iconColor="#EF4444"
        emptyMessage="No inspections scheduled. Create one to start tracking."
        defaultLabels={['research', 'inspection']}
        baseHref="/dashboard/research"
        currentTab="inspections"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
