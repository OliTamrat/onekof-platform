'use client';

import { GitBranch } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';

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
        baseHref="/dashboard/development"
        currentTab="backlog"
        tabs={DEVELOPMENT_TABS}
      />
    </AppLayout>
  );
}
