'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/contexts/workspace-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { PricingModal } from '@/components/pricing-modal';
import { CollapsibleSidebar } from './collapsible-sidebar';
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
  ChevronRight,
  LogOut,
  Building2,
  Layers,
  BookOpen,
  FileText,
  Folders,
  Users,
  Target,
  HelpCircle,
  Menu,
  X,
  Zap,
  Sparkles,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface JiraStyleLayoutProps {
  children: React.ReactNode;
}

export function JiraStyleLayout({ children }: JiraStyleLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { currentOrganization, organizations, projects, currentProject, switchOrganization, setCurrentProject } = useWorkspace();

  const [isProjectsExpanded, setIsProjectsExpanded] = React.useState(true);
  const [isDocsExpanded, setIsDocsExpanded] = React.useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = React.useState(false);

  // Mock trial end date - in production, this would come from the organization data
  const trialEndDate = 'March 30, 2026';

  const isInProject = pathname?.includes('/project/');
  const isActive = (href: string) => pathname === href;

  // Dashboard navigation (when not in a project)
  const dashboardNav = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Issues', href: '/dashboard/issues', icon: ListChecks },
    { name: 'Budget', href: '/dashboard/budget', icon: BarChart3 },
    { name: 'AI Documents', href: '/dashboard/documents', icon: Sparkles },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'Automation', href: '/dashboard/automations', icon: Zap },
    { name: 'Docs & Wiki', href: '/dashboard/docs', icon: BookOpen },
    { name: 'Starred', href: '/dashboard/starred', icon: Star },
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

  // Get recent and favorite projects for sidebar
  const recentProjects = projects.filter(p => !p.isFavorite).slice(0, 5);
  const favoriteProjects = projects.filter(p => p.isFavorite);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-jira-gray-50 dark:bg-jira-dark-bg">
      {/* TOP BAR - Jira Style with Centered Search */}
      <header className="flex h-14 items-center gap-2 border-b border-jira-gray-200 dark:border-jira-dark-border bg-white dark:bg-jira-dark-navbar px-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:hidden shrink-0"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mr-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-white font-bold text-sm shadow-md">
            O
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white hidden lg:block">
            Onekof
          </span>
        </Link>

        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 hidden sm:flex">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline max-w-[120px] truncate">{currentOrganization?.name || 'Workspace'}</span>
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

        {/* Project Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 hidden sm:flex">
              <Layers className="h-4 w-4" />
              <span className="hidden md:inline max-w-[120px] truncate">
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
                    router.push(`/dashboard/projects?projectId=${project.id}`);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded shrink-0"
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    >
                      <IconRenderer iconName={project.icon} className="h-4 w-4 text-white" fallback="📁" />
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

        {/* Spacer to push search slightly right on desktop */}
        <div className="hidden lg:block w-8"></div>

        {/* SEARCH BAR - Beautiful responsive design */}
        <div className="flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-jira-gray-500 dark:text-jira-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full h-9 pl-10 pr-4 text-sm bg-jira-gray-100 dark:bg-jira-dark-surface border border-jira-gray-300 dark:border-jira-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent transition-all text-jira-gray-900 dark:text-jira-gray-200 placeholder:text-jira-gray-500 dark:placeholder:text-jira-gray-500 shadow-sm"
            />
            {/* Search Results Dropdown - Shows when focused and has query */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-full mt-2 w-full md:w-96 bg-white dark:bg-jira-dark-surface border border-jira-gray-200 dark:border-jira-dark-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-jira-gray-600 dark:text-jira-gray-400 px-2 py-1">Search results for "{searchQuery}"</p>
                  <div className="mt-1 text-sm text-jira-gray-700 dark:text-jira-gray-300 px-2 py-3">
                    Search functionality will be implemented here
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacer - pushes action buttons to the far right on desktop */}
        <div className="flex-1 hidden md:block"></div>

        {/* Right side actions - Clean mobile design */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Desktop: Create Button */}
          <DropdownMenu open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 h-9 bg-jira-blue-500 hover:bg-jira-blue-600 text-white hidden md:flex">
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create new...</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/issues?create=issue")}>
                <ListChecks className="mr-2 h-4 w-4" />
                Issue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/projects?create=project")}>
                <FolderKanban className="mr-2 h-4 w-4" />
                Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/docs?create=page")}>
                <FileText className="mr-2 h-4 w-4" />
                Wiki Page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop: See Plans Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 font-semibold hidden md:flex"
            onClick={() => setIsPricingModalOpen(true)}
          >
            <Zap className="h-4 w-4 fill-purple-500" />
            <span>See plans</span>
          </Button>

          {/* Desktop: Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative hidden md:flex"
            onClick={() => router.push("/dashboard/notifications")}
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          {/* Desktop: Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden md:flex"
            onClick={() => router.push("/settings")}
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>

          {/* Desktop: Help */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden lg:flex"
            onClick={() => router.push("/help")}
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Desktop: Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Mobile: "More" Menu - Contains all actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateMenuOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
                <div className="flex items-center w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPricingModalOpen(true)}>
                <Zap className="mr-2 h-4 w-4 fill-purple-500 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400 font-medium">See plans</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">Dark mode</span>
                  <ThemeToggle />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-sm font-medium text-white shadow-sm">
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
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR - Changes based on context */}
        <aside className={cn(
          "w-56 border-r border-jira-gray-200 dark:border-jira-dark-border bg-white dark:bg-jira-dark-sidebar overflow-y-auto transition-transform duration-300 ease-in-out",
          // Mobile: Fixed position with slide-in animation, positioned below header
          "md:relative md:translate-x-0 md:z-auto",
          isMobileSidebarOpen ? "fixed top-14 bottom-0 left-0 translate-x-0 z-50" : "fixed top-14 bottom-0 left-0 -translate-x-full z-50"
        )}>
          {/* Mobile Sidebar Header with Close Button */}
          <div className="flex items-center justify-between p-3 border-b border-jira-gray-200 dark:border-jira-dark-border md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-white font-bold text-sm">
                O
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Onekof
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Collapsible Sidebar Navigation - 7 Core Categories */}
          <CollapsibleSidebar />

          {/* Collapsible Projects Section - Only in Dashboard */}
          {!isInProject && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 px-3">
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>PROJECTS</span>
                <ChevronRight
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isProjectsExpanded && 'rotate-90'
                  )}
                />
              </button>

              {isProjectsExpanded && (
                <div className="space-y-0.5 mt-1">
                  {favoriteProjects.length > 0 && (
                    <>
                      {favoriteProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/dashboard/projects?projectId=${project.id}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 group"
                        >
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                            style={{ backgroundColor: project.color || '#3B82F6' }}
                          >
                            <IconRenderer iconName={project.icon} className="h-3 w-3 text-white" fallback="📁" />
                          </div>
                          <span className="truncate flex-1">{project.name}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-0 group-hover:opacity-100" />
                        </Link>
                      ))}
                      <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                    </>
                  )}
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects?projectId=${project.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      >
                        <IconRenderer iconName={project.icon} className="h-3 w-3 text-white" fallback="📁" />
                      </div>
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/projects"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 mt-2"
                  >
                    View all projects →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Docs & Spaces Section - Only in Dashboard */}
          {!isInProject && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 px-3">
              <button
                onClick={() => setIsDocsExpanded(!isDocsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>DOCS & SPACES</span>
                <ChevronRight
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isDocsExpanded && 'rotate-90'
                  )}
                />
              </button>

              {isDocsExpanded && (
                <div className="space-y-0.5 mt-1">
                  <Link
                    href="/dashboard/docs"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Folders className="h-4 w-4" />
                    <span>All Spaces</span>
                  </Link>
                  <Link
                    href="/dashboard/docs/recent"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Recent Pages</span>
                  </Link>
                </div>
              )}
            </div>
          )}

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
        <main className="flex-1 overflow-y-auto bg-jira-gray-50 dark:bg-jira-dark-bg">
          {children}
        </main>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        trialEndsDate={trialEndDate}
      />
    </div>
  );
}
