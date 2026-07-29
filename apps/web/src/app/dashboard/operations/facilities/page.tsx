'use client';

import { Building2 } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function FacilitiesPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.facilities')}
        description={t('departments.facilitiesDesc')}
        icon={Building2}
        iconColor="#0EA5E9"
        emptyMessage={t('emptyStates.noFacilities')}
        defaultLabels={['operations', 'facility']}
        baseHref="/dashboard/operations"
        currentTab="facilities"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
