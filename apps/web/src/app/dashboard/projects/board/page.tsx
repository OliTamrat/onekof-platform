'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { useWorkspace } from '@/contexts/workspace-context';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  Folder,
  Plus,
  Search,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board', active: true },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages' },
];

const STATUS_COLUMNS = [
  { id: 'PLANNING', label: 'PLANNING', color: 'border-gray-300 dark:border-slate-700' },
  { id: 'ACTIVE', label: 'ACTIVE', color: 'border-blue-300 dark:border-blue-900' },
  { id: 'ON_HOLD', label: 'ON HOLD', color: 'border-yellow-300 dark:border-yellow-900' },
  { id: 'COMPLETED', label: 'COMPLETED', color: 'border-green-300 dark:border-green-900' },
];

export default function ProjectsBoardPage() {
  const router = useRouter();
  const { projects, isLoadingProjects } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group projects by status
  const projectsByStatus = filteredProjects.reduce((acc: Record<string, any[]>, project) => {
    const status = project.status || 'ACTIVE';
    if (!acc[status]) acc[status] = [];
    acc[status].push(project);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Folder className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                Projects Board
              </h1>
            </div>

            <Button
              onClick={() => router.push('/dashboard/projects?create=true')}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    tab.active
                      ? 'border-primary-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-4">
          {isLoadingProjects ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-slate-400">Loading projects...</div>
            </div>
          ) : (
            <div className="flex h-full gap-4">
              {STATUS_COLUMNS.map((column) => (
                <div key={column.id} className="flex w-80 flex-shrink-0 flex-col">
                  {/* Column Header */}
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-slate-400">
                      {column.label}
                    </h3>
                    <span className="rounded-sm bg-gray-200 dark:bg-slate-700 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:text-slate-400">
                      {projectsByStatus[column.id]?.length || 0}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {projectsByStatus[column.id]?.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        className={`cursor-pointer rounded-lg border-l-4 ${column.color} border-t border-r border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:shadow-md`}
                      >
                        <div className="space-y-3">
                          {/* Project Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded text-white text-sm font-semibold flex-shrink-0"
                                style={{ backgroundColor: project.color || '#1C8C7D' }}
                              >
                                {project.key.substring(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {project.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {project.key}
                                </p>
                              </div>
                            </div>
                            {project.isFavorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Description */}
                          {project.description && (
                            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              <span>{project._count?.members || 0} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Folder className="h-3.5 w-3.5" />
                              <span>{project._count?.tasks || 0} tasks</span>
                            </div>
                          </div>

                          {/* Lead */}
                          {project.lead && (
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                                {project.lead.name?.charAt(0) || 'U'}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-slate-400">
                                {project.lead.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Project Button */}
                    <Button
                      onClick={() => router.push('/dashboard/projects?create=true')}
                      className="flex w-full items-center gap-2 rounded-md p-3 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#282E33] hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
