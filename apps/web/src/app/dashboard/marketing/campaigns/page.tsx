'use client';

import { Map } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';

export default function CampaignsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Campaigns"
        description="Plan, execute, and track marketing campaigns across channels"
        icon={Map}
        iconColor="#EC4899"
        emptyMessage="No campaigns yet. Create one to start planning."
        defaultLabels={['marketing', 'campaign']}
        baseHref="/dashboard/marketing"
        currentTab="campaigns"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
