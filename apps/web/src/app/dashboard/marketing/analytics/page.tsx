'use client';

import { TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Marketing Analytics"
        description="Track KPIs, measure ROI, and analyze campaign performance"
        icon={TrendingUp}
        iconColor="#F97316"
        emptyMessage="No analytics tasks yet. Create one to start tracking metrics."
        defaultLabels={['marketing', 'analytics']}
        baseHref="/dashboard/marketing"
        currentTab="analytics"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
