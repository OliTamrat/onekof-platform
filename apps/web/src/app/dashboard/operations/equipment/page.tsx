'use client';

import { Wrench } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function EquipmentPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('departmentTabs.equipment')}
        description={t('departments.equipmentDesc')}
        icon={Wrench}
        iconColor="#F59E0B"
        emptyMessage={t('emptyStates.noEquipment')}
        defaultLabels={['operations', 'equipment']}
        baseHref="/dashboard/operations"
        currentTab="equipment"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
