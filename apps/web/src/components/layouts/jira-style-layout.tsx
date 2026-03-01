'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/contexts/workspace-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  ListChecks,
  Star,
  LayoutDashboard,
  FolderKanban,
  List,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  Building2,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JiraStyleLayoutProps {
  children: React.ReactNode;
}

export function JiraStyleLayout({ children }: JiraStyleLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { currentOrganization, organizations, projects, currentProject, switchOrganization, setCurrentProject } = useWorkspace();

  const isInProject = pathname?.includes('/project/');
  const isActive = (href: string) => pathname === href;

  // Dashboard navigation (when not in a project)
  const dashboardNav = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My Issues', href: '/dashboard/my-issues', icon: ListChecks },
    { name: 'Starred', href: '/dashboard/starred', icon: Star },
    { name: 'Dashboards', href: '/dashboard/boards', icon: LayoutDashboard },
  ];

  // Project navigation (when in a specific project)
  const projectNav = [
    { name: 'Board', href: '/board', icon: FolderKanban },
    { name: 'Backlog', href: '/backlog', icon: List },
    { name: 'Timeline', href: '/timeline', icon: Calendar },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Project Settings', href: '/settings', icon: SettingsIcon },
  ];

  const navigation = isInProject ? projectNav : dashboardNav;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#1B1F23]">
      {/* TOP BAR - Jira Style */}
      <header className="flex h-14 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1117] px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-white font-bold text-sm">
            O
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">
            Onekof
          </span>
        </Link>

        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">{currentOrganization?.name || 'Select Workspace'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => switchOrganization(org.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-slate-500">{org.memberCount} members</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Project Selector - KEY FEATURE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentProject?.name || 'Projects'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {projects.slice(0, 10).map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    router.push(`/project/${project.key}/board`);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded text-sm shrink-0"
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    >
                      {project.icon || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className="text-xs text-slate-500">{project.key}</p>
                    </div>
                    {project.isFavorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/all-projects')}
              className="cursor-pointer font-medium"
            >
              View all projects →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>

        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-sm font-medium text-white">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-slate-500">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Changes based on context */}
        <aside className="w-56 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1117] overflow-y-auto">
          <nav className="p-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const href = isInProject
                ? `/project/${currentProject?.key}${item.href}`
                : item.href;

              return (
                <Link
                  key={item.name}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(href)
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* If in project, show quick project info */}
          {isInProject && currentProject && (
            <div className="mt-auto border-t border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded text-xs"
                  style={{ backgroundColor: currentProject.color || '#3B82F6' }}
                >
                  {currentProject.icon || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{currentProject.name}</p>
                  <p className="text-xs text-slate-500">{currentProject.key}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#1B1F23]">
          {children}
        </main>
      </div>
    </div>
  );
}
