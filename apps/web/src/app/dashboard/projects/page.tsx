'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { CreateProjectModal } from '@/components/create-project-modal';
import { ProjectManagementDialog } from '@/components/project-management-dialog';
import { Button } from '@/components/ui/button';
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
  Clock,
  BarChart3,
  FileText,
  Code,
  Book,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconRenderer } from '@/components/ui/icon-renderer';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages' },
] as const;

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentOrganization, projects, isLoadingProjects } = useWorkspace();

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
      <div className="flex h-screen items-center justify-center bg-[#1B1F23]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0065FF] border-t-transparent"></div>
          <p className="text-sm text-[#9FADBC]">Loading...</p>
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
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Jira-style Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Project Title and Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                {currentOrganization?.name?.substring(0, 2).toUpperCase() || 'PR'}
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                {currentOrganization?.name || 'Projects'}
              </h1>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
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
                      ? 'border-[#0065FF] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-6 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-[#9FADBC]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-gray-300 dark:border-[#2C333A] bg-white dark:bg-[#22272B] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#9FADBC] focus:border-[#0065FF] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#0065FF] text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC] hover:bg-gray-300 dark:hover:bg-[#2C333A]'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#0065FF] text-white'
                    : 'bg-gray-200 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC] hover:bg-gray-300 dark:hover:bg-[#2C333A]'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoadingProjects ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0065FF] border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Loading projects...</p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Folder className="h-16 w-16 text-gray-300 dark:text-[#2C333A] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#9FADBC] mb-6 max-w-sm text-center">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by creating your first project'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Starred Projects */}
              {favoriteProjects.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-[#9FADBC]">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Starred
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
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-[#9FADBC]">
                  {favoriteProjects.length > 0 ? 'All Projects' : `Your Projects (${filteredProjects.length})`}
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
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-5 transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-[#0065FF]"
    >
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {project.isFavorite && (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#2C333A] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-[#9FADBC]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#282E33] border border-gray-200 dark:border-[#2C333A]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2C333A]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Members & Teams
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: project.color || '#0065FF' }}
      >
        <IconRenderer iconName={project.icon} className="h-6 w-6 text-white" fallback="📁" />
      </div>

      <div className="mb-4">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white group-hover:text-[#0065FF] transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-[#9FADBC]">{project.key}</p>
      </div>

      {project.description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-[#9FADBC]">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-[#9FADBC]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{project.taskCount || 0} tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>{project.memberCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

// Project List Item Component - List View
function ProjectListItem({ project, onClick }: { project: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4 transition-all hover:bg-gray-50 dark:hover:bg-[#282E33] hover:border-[#0065FF]"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: project.color || '#0065FF' }}
      >
        <IconRenderer iconName={project.icon} className="h-5 w-5 text-white" fallback="📁" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#0065FF] transition-colors">
            {project.name}
          </h3>
          <span className="text-sm text-gray-600 dark:text-[#9FADBC]">{project.key}</span>
          {project.isFavorite && (
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 dark:text-[#9FADBC] line-clamp-1">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-[#9FADBC]">
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
            <button
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-[#2C333A] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-[#9FADBC]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-[#282E33] border border-gray-200 dark:border-[#2C333A]">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#2C333A]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Members & Teams
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
