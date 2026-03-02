'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading...</p>
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
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Projects</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and organize your projects in {currentOrganization?.name}
            </p>
          </div>
          <Button variant="default" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-slate-900 dark:focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by creating your first project'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setIsManageDialogOpen(true);
                }}
                className="group relative cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-6 transition-all hover:border-slate-900 dark:hover:border-slate-600 hover:shadow-md"
              >
                <div className="absolute right-4 top-4 flex items-center gap-1">
                  {project.isFavorite && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setIsManageDialogOpen(true);
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Members & Teams
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                >
                  {project.icon || '📁'}
                </div>

                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{project.key}</p>
                </div>

                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{project.taskCount || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.memberCount || 0} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setIsManageDialogOpen(true);
                }}
                className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B] p-4 transition-all hover:border-slate-900 dark:hover:border-slate-600 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded text-xl"
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  >
                    {project.icon || '📁'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{project.key}</span>
                      {project.isFavorite && (
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{project.taskCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{project.memberCount || 0}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setIsManageDialogOpen(true);
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Members & Teams
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
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
