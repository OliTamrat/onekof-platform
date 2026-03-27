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
        title={t('departmentTabs.analytics')}
        description={t('departments.analyticsDesc')}
        icon={TrendingUp}
        iconColor="#F97316"
        emptyMessage={t('emptyStates.noAnalytics')}
        defaultLabels={['marketing', 'analytics']}
        baseHref="/dashboard/marketing"
        currentTab="analytics"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
