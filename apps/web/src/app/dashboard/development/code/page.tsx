'use client';

import { FileText } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';

export default function CodeReviewPage() {
  return (
    <AppLayout>
      <DepartmentTaskList
        title="Code Review"
        description="Review pull requests, leave comments, and approve changes"
        icon={FileText}
        iconColor="#6366F1"
        emptyMessage="No code reviews yet. Create one to track review requests."
        defaultLabels={['development', 'code-review']}
      />
    </AppLayout>
  );
}
