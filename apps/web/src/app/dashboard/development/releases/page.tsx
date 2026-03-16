'use client';

import { GitBranch } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';

export default function ReleasesPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Releases"
        description="Track versions, deployment status, and release notes"
        icon={GitBranch}
        iconColor="#A855F7"
        emptyMessage="No releases yet. Create one to track deployments."
        defaultLabels={['development', 'release']}
        baseHref="/dashboard/development"
        currentTab="releases"
        tabs={DEVELOPMENT_TABS}
        category="development"
      />
    </AppLayout>
  );
}
