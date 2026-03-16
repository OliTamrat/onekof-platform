'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';

export default function DataPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Data"
        description="Collect and manage research data for feasibility studies"
        icon={FileSpreadsheet}
        iconColor="#8B5CF6"
        emptyMessage="No data tasks yet. Create one to start collecting."
        defaultLabels={['research', 'data']}
        baseHref="/dashboard/research"
        currentTab="data"
        tabs={RESEARCH_TABS}
      />
    </AppLayout>
  );
}
