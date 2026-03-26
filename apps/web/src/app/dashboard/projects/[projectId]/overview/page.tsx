'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import {
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Loader2,
} from 'lucide-react';
import { DASHBOARD_DEPARTMENTS } from '@/config/dashboard-template';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectOverviewPage() {
  const { t } = useLanguage();
  const params = useParams();
  const projectId = params.projectId as string;

  // Fetch project details
  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
  });

  // Fetch project tasks summary
  const { data: tasksData } = useQuery({
    queryKey: ['project-tasks-summary', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?projectId=${projectId}&limit=1000`);
      if (!res.ok) return { tasks: [] };
      return res.json();
    },
  });

  const project = projectData?.project || projectData;
  const tasks = tasksData?.tasks || [];

  const stats = {
    total: tasks.length,
    done: tasks.filter((t: any) => t.status === 'DONE').length,
    inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
    overdue: tasks.filter((t: any) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'DONE';
    }).length,
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: project?.color || '#1C8C7D' }}
            >
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {project?.name || 'Project'} Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {project?.description || 'Foundational dashboard with all department tools'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Completed</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.done}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">of {stats.total} tasks</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">In Progress</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Overdue</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.overdue}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Members</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{project?.memberCount || project?._count?.members || 0}</p>
            </div>
          </div>

          {/* Department Cards */}
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Department Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {DASHBOARD_DEPARTMENTS.map((dept) => {
              const DeptIcon = dept.icon;
              return (
                <Link
                  key={dept.id}
                  href={`/dashboard/projects/${projectId}/${dept.id}/${dept.pages[0]?.path || ''}`}
                  className="group rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 transition-all hover:border-primary-500 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: dept.iconColor + '20' }}
                    >
                      <DeptIcon className="h-5 w-5" style={{ color: dept.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {dept.name}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-1">
                        {dept.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {dept.pages.slice(0, 3).map((page) => (
                          <span
                            key={page.id}
                            className="rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-gray-600 dark:text-slate-300"
                          >
                            {page.name}
                          </span>
                        ))}
                        {dept.pages.length > 3 && (
                          <span className="rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-gray-600 dark:text-slate-300">
                            +{dept.pages.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
