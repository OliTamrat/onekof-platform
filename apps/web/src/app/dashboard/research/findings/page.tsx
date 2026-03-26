'use client';

import { FileText } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { RESEARCH_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function FindingsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Findings"
        description="Document research findings and insights"
        icon={FileText}
        iconColor="#3B82F6"
        emptyMessage="No findings yet. Create one to document insights."
        defaultLabels={['research', 'findings']}
        baseHref="/dashboard/research"
        currentTab="findings"
        tabs={RESEARCH_TABS}
        category="research"
      />
    </AppLayout>
  );
}
