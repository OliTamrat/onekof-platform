'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function MaterialsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Materials"
        description="Manage research materials and resources"
        icon={FileSpreadsheet}
        iconColor="#F59E0B"
        emptyMessage="No materials tracked yet. Create one to manage resources."
        defaultLabels={['research', 'materials']}
        baseHref="/dashboard/research"
        currentTab="materials"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
