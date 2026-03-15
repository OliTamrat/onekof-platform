'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function ResearchPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Research"
        description="Manage research projects, data collection, and findings"
        icon={FileSpreadsheet}
        iconColor="#3B82F6"
        emptyMessage="No research tasks yet. Create one to get started."
        defaultLabels={['research']}
      />
    </AppLayout>
  );
}
