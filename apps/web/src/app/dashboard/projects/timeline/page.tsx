'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { useWorkspace } from '@/contexts/workspace-context';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Calendar,
  Clock,
  Code,
  FileText,
  Folder,
  Plus
} from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline', active: true },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages' },
] as const;

export default function ProjectsTimelinePage() {
  const { projects } = useWorkspace();

  const groupedProjects = projects.reduce((acc: Record<string, any[]>, project) => {
    const date = new Date(project.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(project);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Clock className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Timeline</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab.active ? 'border-[#0065FF] text-gray-900 dark:text-white' : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#2C333A]" />
              <div className="space-y-8">
                {Object.entries(groupedProjects).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).map(([monthYear, monthProjects]) => (
                  <div key={monthYear} className="relative pl-16">
                    <div className="absolute left-0 top-0 flex items-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-[#22272B] border-2 border-[#0065FF]">
                        <Calendar className="h-6 w-6 text-[#0065FF]" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{monthYear}</h3>
                      <p className="text-sm text-gray-600 dark:text-[#9FADBC]">{monthProjects.length} {monthProjects.length === 1 ? 'project' : 'projects'}</p>
                    </div>
                    <div className="space-y-3">
                      {monthProjects.map((project) => (
                        <div key={project.id} className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] hover:border-[#0065FF] cursor-pointer transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded text-white text-sm font-semibold flex-shrink-0" style={{ backgroundColor: project.color || '#0065FF' }}>
                              {project.key.substring(0, 2)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{project.name}</h4>
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-[#9FADBC]">
                                <span>{project.key}</span>
                                <span>•</span>
                                <span>{project._count?.members || 0} members</span>
                                <span>•</span>
                                <span>{project._count?.tasks || 0} tasks</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
