'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Filter,
  Folder,
  Plus,
  Search,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectsListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { projects, isLoadingProjects } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const TAB_ITEMS: { id: string; label: string; icon: LucideIcon | null; href: string; active?: boolean }[] = [
    { id: 'summary', label: t('tabs.summary'), icon: BarChart3, href: '/dashboard/projects/summary' },
    { id: 'list', label: t('tabs.list'), icon: null, href: '/dashboard/projects/list', active: true },
    { id: 'board', label: t('tabs.board'), icon: null, href: '/dashboard/projects/board' },
    { id: 'code', label: t('tabs.code'), icon: Code, href: '/dashboard/projects/code' },
    { id: 'forms', label: t('tabs.forms'), icon: FileText, href: '/dashboard/projects/forms' },
    { id: 'timeline', label: t('tabs.timeline'), icon: Clock, href: '/dashboard/projects/timeline' },
    { id: 'pages', label: t('tabs.pages'), icon: Book, href: '/dashboard/projects/pages' },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'AT_RISK':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'OFF_TRACK':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-[#181D23] text-gray-700 dark:text-white/70';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Folder className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('projectList.title')}
              </h1>
            </div>

            <Button
              onClick={() => router.push('/dashboard/projects?create=true')}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t('projectList.createProject')}
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
                      : 'border-transparent text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-white/70" />
              <input
                type="text"
                placeholder={t('projectList.searchProjects')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('projectList.allStatus')}</option>
              <option value="ON_TRACK">{t('projectList.onTrack')}</option>
              <option value="AT_RISK">{t('projectList.atRisk')}</option>
              <option value="OFF_TRACK">{t('projectList.offTrack')}</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoadingProjects ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-white/70">{t("common.loading")}</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Folder className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('projectList.noProjects')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/70">
                  {searchQuery ? t('projectList.noProjectsMatchSearch') : t('projectList.getStarted')}
                </p>
                <Button
                  onClick={() => router.push('/dashboard/projects?create=true')}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4" />
                  {t('projectList.createProject')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08] overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-[#181D23]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.project')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.key')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.lead')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.members')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.tasks')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">
                      {t('projectList.updated')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#12161B] divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-[#181D23] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {project.isFavorite && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded text-white text-sm font-semibold"
                            style={{ backgroundColor: project.color || '#1C8C7D' }}
                          >
                            {project.key.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.name}
                            </div>
                            {project.description && (
                              <div className="text-xs text-gray-500 dark:text-white/70 line-clamp-1">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.key}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-xs font-medium text-white">
                            {project.lead?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {project.lead?.name || t('common.unassigned')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400 dark:text-[#6B7684]" />
                          <span className="text-sm text-gray-600 dark:text-white/70">
                            {project._count?.members || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-white/70">
                          {project._count?.tasks || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status || 'ACTIVE')}`}>
                          {project.status?.replace('_', ' ') || t('common.active')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-white/70">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(project.updatedAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
