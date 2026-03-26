'use client';

import { TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { MARKETING_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function MarketingPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Marketing"
        description="Manage public relations, stakeholder engagement, and communications"
        icon={TrendingUp}
        iconColor="#F97316"
        emptyMessage="No marketing tasks yet. Create one to get started."
        defaultLabels={['marketing']}
        baseHref="/dashboard/marketing"
        currentTab="social"
        tabs={MARKETING_TABS}
        category="marketing"
      />
    </AppLayout>
  );
}
