'use client';

import { FileSpreadsheet } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function ResearchPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title={t('researchPage.title')}
        description={t('researchPage.description')}
        icon={FileSpreadsheet}
        iconColor="#3B82F6"
        emptyMessage={t('emptyStates.noResearch')}
        defaultLabels={['research']}
        baseHref="/dashboard/research"
        currentTab="data"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
