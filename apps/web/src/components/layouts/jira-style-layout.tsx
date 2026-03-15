'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useWorkspace } from '@/contexts/workspace-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { PricingModal } from '@/components/pricing-modal';
import { CommandPalette } from '@/components/command-palette';
import { NotificationCenter } from '@/components/notification-center';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { CollapsibleSidebar } from './collapsible-sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  ListChecks,
  Star,
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
  Moon,
  Sun,
  Monitor,
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
  const { theme, setTheme } = useTheme();
  const { currentOrganization, organizations, projects, currentProject, switchOrganization, setCurrentProject } = useWorkspace();
  useKeyboardShortcuts();

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
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#1B1F23]">
      {/* Global overlays */}
      <CommandPalette />
      <KeyboardShortcutsModal />
      {/* TOP BAR - Jira Style with Centered Search */}
      <header className="flex h-14 items-center gap-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3">
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

        {/* SEARCH BAR - Opens Command Palette */}
        <div className="flex flex-1 min-w-0 max-w-md">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
              document.dispatchEvent(event);
            }}
            className="flex w-full h-9 items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#22272B] px-3 text-sm text-slate-500 dark:text-slate-400 shadow-sm transition-colors hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200/50 dark:hover:bg-[#22272B]/80"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate hidden sm:block">Search or jump to...</span>
            <span className="flex-1 text-left truncate sm:hidden">Search...</span>
            <kbd className="hidden rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-1.5 py-0.5 text-[10px] font-medium lg:inline-block">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Spacer - pushes action buttons to the far right on desktop */}
        <div className="flex-1 hidden lg:block"></div>

        {/* Right side actions - Clean mobile design */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Desktop: Create Button */}
          <DropdownMenu open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 h-9 bg-primary-500 hover:bg-primary-600 text-white hidden md:flex">
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

          {/* Desktop: Notifications */}
          <div className="hidden md:block">
            <NotificationCenter />
          </div>

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
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="ml-4">Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
              <DropdownMenuItem onClick={() => router.push('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPricingModalOpen(true)}>
                <Zap className="mr-2 h-4 w-4 fill-purple-500 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400 font-medium">See plans</span>
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
          "w-56 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] overflow-y-auto transition-transform duration-300 ease-in-out",
          // Desktop: Reset mobile fixed positioning (top-14/bottom-0/left-0 must be cleared)
          "md:relative md:top-auto md:bottom-auto md:left-auto md:translate-x-0 md:z-auto md:h-full",
          // Mobile: Fixed position with slide-in animation, positioned below header
          isMobileSidebarOpen ? "fixed top-14 bottom-0 left-0 translate-x-0 z-50" : "fixed top-14 bottom-0 left-0 -translate-x-full z-50"
        )}>
          {/* Mobile Sidebar Header with Close Button */}
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 md:hidden">
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
            <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-2 px-3">
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
            <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-2 px-3">
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
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#1B1F23]">
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
