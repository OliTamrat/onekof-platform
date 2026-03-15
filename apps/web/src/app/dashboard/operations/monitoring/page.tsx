'use client';

import { Activity } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function MonitoringPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Monitoring"
        description="Track system metrics, uptime, and performance indicators"
        icon={Activity}
        iconColor="#06B6D4"
        emptyMessage="No monitoring tasks yet. Create one to start tracking."
        defaultLabels={['operations', 'monitoring']}
      />
    </AppLayout>
  );
}
