'use client';

import { TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Marketing Analytics"
        description="Track KPIs, measure ROI, and analyze campaign performance"
        icon={TrendingUp}
        iconColor="#F97316"
        emptyMessage="No analytics tasks yet. Create one to start tracking metrics."
        defaultLabels={['marketing', 'analytics']}
      />
    </AppLayout>
  );
}
