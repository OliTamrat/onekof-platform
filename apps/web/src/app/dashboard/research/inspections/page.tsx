'use client';

import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function InspectionsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.inspections')}
        description={t('departments.inspectionsDesc')}
        icon={CheckCircle2}
        iconColor="#EF4444"
        emptyMessage={t('emptyStates.noInspections')}
        defaultLabels={['research', 'inspection']}
        baseHref="/dashboard/research"
        currentTab="inspections"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
