'use client';

import { AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { OPERATIONS_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function IncidentsPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Incidents"
        description="Report, track, and resolve operational issues quickly"
        icon={AlertCircle}
        iconColor="#EF4444"
        emptyMessage="No incidents reported. Create one to track an issue."
        defaultLabels={['operations', 'incident']}
        baseHref="/dashboard/operations"
        currentTab="incidents"
        tabs={OPERATIONS_TABS}
        category="operations"
      />
    </AppLayout>
  );
}
