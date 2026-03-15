'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function MaterialsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Materials"
        description="Manage research materials and resources"
        icon={FileSpreadsheet}
        iconColor="#F59E0B"
        emptyMessage="No materials tracked yet. Create one to manage resources."
        defaultLabels={['research', 'materials']}
      />
    </AppLayout>
  );
}
