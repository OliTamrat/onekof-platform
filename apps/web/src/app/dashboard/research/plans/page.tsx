'use client';

import { Map } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';

export default function PlansPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Plans"
        description="Develop and track research plans and methodologies"
        icon={Map}
        iconColor="#10B981"
        emptyMessage="No research plans yet. Create one to get started."
        defaultLabels={['research', 'plan']}
        baseHref="/dashboard/research"
        currentTab="plans"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
