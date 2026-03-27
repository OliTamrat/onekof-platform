'use client';

import { Map } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function PlansPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.plans')}
        description={t('departments.plansDesc')}
        icon={Map}
        iconColor="#10B981"
        emptyMessage={t('emptyStates.noResearchPlans')}
        defaultLabels={['research', 'plan']}
        baseHref="/dashboard/research"
        currentTab="plans"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
