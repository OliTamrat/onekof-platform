'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { UpgradeBanner, LimitBadge } from '@/components/upgrade-banner';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { CreateProjectModal } from '@/components/create-project-modal';
import { ProjectManagementDialog } from '@/components/project-management-dialog';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Star,
  MoreHorizontal,
  Folder,
  Users,
  CheckCircle2,
  Settings,
  Trash2,
  Clock,
  BarChart3,
  FileText,
  Code,
  Book
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { useLanguage } from '@/contexts/language-context';



export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentOrganization, projects, isLoadingProjects } = useWorkspace();
  const { t } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/projects');
    }
  }, [status, router]);

  // Filter projects based on search
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProjects = filteredProjects.filter((p) => p.isFavorite);
  const otherProjects = filteredProjects.filter((p) => !p.isFavorite);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0E11]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-sm text-white/70">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          {/* Project Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-3 md:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                {currentOrganization?.name?.substring(0, 2).toUpperCase() || 'PR'}
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {currentOrganization?.name || 'Projects'}
              </h1>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('common.create')}
            </Button>
          </div>

          {/* Navigation Tabs */}
        </div>

        {/* Upgrade Banner */}
        <div className="px-3 md:px-6 pt-3">
          <UpgradeBanner resource="projects" />
        </div>

        {/* Projects Content */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6">
          {isLoadingProjects ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Folder className="h-16 w-16 text-gray-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? t('common.noResults') : t('projects.noProjects')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-white/70 mb-6 max-w-sm text-center">
                {searchQuery
                  ? t('common.noResults')
                  : t('projects.createFirst')}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t('emptyStates.createProject')}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Starred Projects */}
              {favoriteProjects.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/70">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {t('nav.starred')}
                  </h2>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {favoriteProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onClick={() => {
                            setSelectedProject(project);
                            setIsManageDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {favoriteProjects.map((project) => (
                        <ProjectListItem
                          key={project.id}
                          project={project}
                          onClick={() => {
                            setSelectedProject(project);
                            setIsManageDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* All Projects */}
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-white/70">
                  {favoriteProjects.length > 0 ? t('nav.allProjects') : `${t('dashboard.yourProjects')} (${filteredProjects.length})`}
                </h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {otherProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsManageDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherProjects.map((project) => (
                      <ProjectListItem
                        key={project.id}
                        project={project}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsManageDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <ProjectManagementDialog
        project={selectedProject}
        open={isManageDialogOpen}
        onOpenChange={setIsManageDialogOpen}
      />
    </AppLayout>
  );
}

// Project Card Component - Grid View
function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  return (
    <Link
      href={`/dashboard/projects/${project.id}/overview`}
      className="group relative block cursor-pointer rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-5 transition-all hover:bg-gray-50 dark:hover:bg-[#181D23] hover:border-primary-500"
    >
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {project.isFavorite && (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#181D23] border border-gray-200 dark:border-white/[0.08]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
              }}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('dashboard.manageMembers')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/projects/${project.id}/settings`);
              }}
              className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: project.color || '#1C8C7D' }}
      >
        <IconRenderer iconName={project.icon} className="h-6 w-6 text-white" />
      </div>

      <div className="mb-4">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-white/70">{project.key}</p>
      </div>

      {project.description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-white/70">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/70">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{project.taskCount || 0} {t('projects.tasks')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{project.memberCount || 0}</span>
        </div>
      </div>
    </Link>
  );
}

// Project List Item Component - List View
function ProjectListItem({ project, onClick }: { project: any; onClick: () => void }) {
  const { t } = useLanguage();
  const router = useRouter();
  return (
    <Link
      href={`/dashboard/projects/${project.id}/overview`}
      className="group flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-4 transition-all hover:bg-gray-50 dark:hover:bg-[#181D23] hover:border-primary-500"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: project.color || '#1C8C7D' }}
      >
        <IconRenderer iconName={project.icon} className="h-5 w-5 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
            {project.name}
          </h3>
          <span className="text-sm text-gray-600 dark:text-white/70">{project.key}</span>
          {project.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 dark:text-white/70 line-clamp-1">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-white/70">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>{project.taskCount || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{project.memberCount || 0}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-white/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#181D23] border border-gray-200 dark:border-white/[0.08]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
              }}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('dashboard.manageMembers')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/projects/${project.id}/settings`);
              }}
              className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}
