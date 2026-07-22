'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch } from 'lucide-react';
import { IssueHierarchyTree } from '@/components/issues/issue-hierarchy-tree';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
import { useWorkspace } from '@/contexts/workspace-context';
import { useLanguage } from '@/contexts/language-context';

export default function HierarchyPage() {
  const router = useRouter();
  const { projects } = useWorkspace();
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<string>('');

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('departmentTabs.hierarchy') || 'Hierarchy'}
        icon={<GitBranch className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="hierarchy"
        baseHref="/dashboard/issues"
        showTabs
        customTabs={ISSUES_TABS}
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <GitBranch className="h-3.5 w-3.5" />
            Epic → Story → Task → Subtask
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1B1F23] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">All Projects</option>
            {(projects || []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#1B1F23] p-3">
            <IssueHierarchyTree
              projectId={selectedProject || undefined}
              onSelect={(issue) => {
                router.push(`/projects/${issue.project?.id}/board?issue=${issue.id}`);
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
