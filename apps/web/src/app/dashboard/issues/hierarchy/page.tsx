'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Filter } from 'lucide-react';
import { IssueHierarchyTree } from '@/components/issues/issue-hierarchy-tree';
import { useWorkspace } from '@/contexts/workspace-context';
import { useLanguage } from '@/contexts/language-context';

export default function HierarchyPage() {
  const router = useRouter();
  const { projects } = useWorkspace();
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<string>('');

  return (
    <div className="min-h-full bg-gray-50 dark:bg-[#1B1F23]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#282E33] px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <GitBranch className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Hierarchy</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Epic → Story → Task → Subtask tree view
              </p>
            </div>
          </div>

          {/* Project filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1B1F23] px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Projects</option>
              {(projects || []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="p-4 md:p-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#282E33] p-2">
          <IssueHierarchyTree
            projectId={selectedProject || undefined}
            onSelect={(issue) => {
              router.push(`/projects/${issue.project?.id}/board?issue=${issue.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
