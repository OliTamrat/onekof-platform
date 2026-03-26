'use client';

import { FileText } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { DEVELOPMENT_TABS } from '@/config/department-tabs';
import { useLanguage } from '@/contexts/language-context';

export default function CodeReviewPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Code Review"
        description="Review pull requests, leave comments, and approve changes"
        icon={FileText}
        iconColor="#6366F1"
        emptyMessage="No code reviews yet. Create one to track review requests."
        defaultLabels={['development', 'code-review']}
        baseHref="/dashboard/development"
        currentTab="code"
        tabs={DEVELOPMENT_TABS}
        category="development"
      />
    </AppLayout>
  );
}
