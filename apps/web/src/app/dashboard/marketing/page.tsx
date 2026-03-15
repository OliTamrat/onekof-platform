'use client';

import { TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function MarketingPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Marketing"
        description="Manage public relations, stakeholder engagement, and communications"
        icon={TrendingUp}
        iconColor="#F97316"
        emptyMessage="No marketing tasks yet. Create one to get started."
        defaultLabels={['marketing']}
      />
    </AppLayout>
  );
}
