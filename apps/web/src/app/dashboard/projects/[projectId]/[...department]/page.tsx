'use client';

import { useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { DepartmentTaskList } from '@/components/department/department-task-list';
import { getDepartmentForPath, DASHBOARD_DEPARTMENTS } from '@/config/dashboard-template';

/**
 * Dynamic project-scoped department page.
 *
 * Routes like:
 *   /dashboard/projects/[projectId]/development/backlog
 *   /dashboard/projects/[projectId]/marketing/social
 *   /dashboard/projects/[projectId]/operations/incidents
 *   /dashboard/projects/[projectId]/research/data
 *
 * This is the foundational dashboard template — every project automatically
 * gets all department pages with navigation, controls, and AI insights.
 */
export default function ProjectDepartmentPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const departmentPath = (params.department as string[])?.join('/') || '';

  const resolved = useMemo(() => getDepartmentForPath(departmentPath), [departmentPath]);

  if (!resolved) {
    notFound();
  }

  const { department, page } = resolved;
  const activePage = page || department.pages[0];

  if (!activePage) {
    notFound();
  }

  // Build tabs with project-scoped hrefs
  const projectTabs = department.tabs.map((tab) => ({
    ...tab,
    href: tab.href,
  }));

  const baseHref = `/dashboard/projects/${projectId}/${department.id}`;
  const currentTab = page?.id || department.pages[0]?.id || department.id;

  return (
    <AppLayout>
      <DepartmentTaskList
        title={activePage.name}
        description={activePage.description}
        icon={activePage.icon}
        iconColor={activePage.iconColor}
        emptyMessage={activePage.emptyMessage}
        defaultLabels={activePage.defaultLabels}
        baseHref={baseHref}
        currentTab={currentTab}
        tabs={projectTabs}
        category={department.category}
        projectId={projectId}
      />
    </AppLayout>
  );
}
