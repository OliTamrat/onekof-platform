'use client';

import { GitBranch } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function DevelopmentPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Development"
        description="Manage technical development, releases, and code reviews"
        icon={GitBranch}
        iconColor="#22C55E"
        emptyMessage="No development tasks yet. Create one to track your work."
        defaultLabels={['development']}
      />
    </AppLayout>
  );
}
