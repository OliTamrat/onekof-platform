'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { useLanguage } from '@/contexts/language-context';

export default function IssuesPagesPage() {
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const currentProject = projectsData?.projects?.[0];

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Project Page Header with Navigation */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{t("projectPages.title")}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                {t("underConstruction.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
