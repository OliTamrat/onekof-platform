'use client';

import { AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function IncidentsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Incidents"
        description="Report, track, and resolve operational issues quickly"
        icon={AlertCircle}
        iconColor="#EF4444"
        emptyMessage="No incidents reported. Create one to track an issue."
        defaultLabels={['operations', 'incident']}
      />
    </AppLayout>
  );
}
