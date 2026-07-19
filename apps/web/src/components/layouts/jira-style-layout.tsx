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
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/contexts/language-context';
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
  ChevronLeft,
  LogOut,
  Building2,
  BookOpen,
  FileText,
  Folders,
  Users,
  UserPlus,
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
  Globe,
  ExternalLink,
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
  const { t, locale, setLocale } = useLanguage();
  useKeyboardShortcuts();

  const [isProjectsExpanded, setIsProjectsExpanded] = React.useState(true);
  const [isDocsExpanded, setIsDocsExpanded] = React.useState(true);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Mock trial end date - in production, this would come from the organization data
  const trialEndDate = 'March 30, 2026';

  const isInProject = pathname?.includes('/project/');
  const isActive = (href: string) => pathname === href;

  // Detect project scope from dashboard URL
  const scopedProjectId = typeof window !== 'undefined' && pathname === '/dashboard'
    ? new URLSearchParams(window.location.search).get('projectId')
    : null;
  const scopedProject = scopedProjectId ? projects.find(p => p.id === scopedProjectId) : null;

  // Dashboard navigation (when not in a project)
  // When a project is scoped, append ?projectId to keep the filter active across pages
  const addScope = (href: string) => {
    if (!scopedProjectId || !href.startsWith('/dashboard')) return href;
    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}projectId=${scopedProjectId}`;
  };

  const dashboardNav = [
    { name: t('nav.home'), href: addScope('/dashboard'), icon: Home },
    { name: t('nav.projects'), href: '/dashboard/projects', icon: FolderKanban },
    { name: t('nav.issues'), href: addScope('/dashboard/issues'), icon: ListChecks },
    { name: t('nav.budget'), href: addScope('/dashboard/budget'), icon: BarChart3 },
    { name: t('nav.aiDocuments'), href: addScope('/dashboard/documents'), icon: Sparkles },
    { name: t('nav.teams'), href: addScope('/dashboard/teams'), icon: Users },
    { name: t('nav.goals'), href: addScope('/dashboard/goals'), icon: Target },
    { name: t('nav.automation'), href: addScope('/dashboard/automations'), icon: Zap },
    { name: t('nav.docs'), href: addScope('/dashboard/docs'), icon: BookOpen },
    { name: t('nav.starred'), href: '/dashboard/starred', icon: Star },
  ];

  // Project navigation (when in a specific project)
  const projectNav = [
    { name: t('nav.board'), href: '/board', icon: FolderKanban },
    { name: t('nav.backlog'), href: '/backlog', icon: List },
    { name: t('nav.timeline'), href: '/timeline', icon: Calendar },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
    { name: t('projectSettings.title'), href: '/settings', icon: SettingsIcon },
  ];

  const navigation = isInProject ? projectNav : dashboardNav;

  // Get recent and favorite projects for sidebar
  const recentProjects = projects.filter(p => !p.isFavorite).slice(0, 5);
  const favoriteProjects = projects.filter(p => p.isFavorite);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0E11]">
      {/* Global overlays */}
      <CommandPalette />
      <KeyboardShortcutsModal />
      {/* TOP BAR - Jira Style with Centered Search */}
      <header className="flex h-14 items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-3">
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
        <Link href="/dashboard" className="flex items-center mr-2 shrink-0">
          <img src="/logo-icon.png" alt="Onekof" className="h-8 w-8 lg:hidden" />
          <img src="/logo-wordmark.png" alt="Onekof" className="h-8 hidden lg:block" />
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
            <DropdownMenuLabel>{t('nav.workspaces')}</DropdownMenuLabel>
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
          <Button
            variant="outline"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
              document.dispatchEvent(event);
            }}
            className="flex w-full h-9 items-center gap-2 border-slate-300 dark:border-white/[0.08] bg-slate-100 dark:bg-[#12161B] px-3 text-sm text-slate-500 dark:text-white/70 shadow-sm hover:border-slate-400 dark:hover:border-white/[0.12] hover:bg-slate-200/50 dark:hover:bg-[#181D23] justify-start font-normal"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left truncate hidden sm:block">{t('nav.searchPlaceholder')}</span>
            <span className="flex-1 text-left truncate sm:hidden">{t('common.search')}</span>
            <kbd className="hidden rounded border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-1.5 py-0.5 text-[10px] font-medium lg:inline-block">
              Ctrl K
            </kbd>
          </Button>
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
                <span className="hidden lg:inline">{t('common.create')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('nav.createNew')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/issues?create=issue")}>
                <ListChecks className="mr-2 h-4 w-4" />
                {t('nav.issue')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/projects?create=project")}>
                <FolderKanban className="mr-2 h-4 w-4" />
                {t('nav.createProject')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/docs?create=page")}>
                <FileText className="mr-2 h-4 w-4" />
                {t('nav.wikiPage')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/teams?create=team")}>
                <Users className="mr-2 h-4 w-4" />
                {t('teams.newTeam')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/members?invite=true")}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('membersPage.inviteMember')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop: Language Switcher */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

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
              <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateMenuOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('common.create')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
                <div className="flex items-center w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  {t('nav.notifications')}
                  <span className="ml-auto h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPricingModalOpen(true)}>
                <Zap className="mr-2 h-4 w-4 fill-purple-500 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400 font-medium">{t('nav.seePlans')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Language Switcher - Mobile */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t('settings.language')}</span>
                  <span className="ml-auto text-xs text-white/30">{LOCALE_FLAGS[locale]}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {(['en', 'am', 'om', 'ti', 'so'] as Locale[]).map((l) => (
                    <DropdownMenuItem
                      key={l}
                      onClick={() => setLocale(l)}
                      className={locale === l ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium' : ''}
                    >
                      <span className="mr-2 w-6 text-xs font-semibold">{LOCALE_FLAGS[l]}</span>
                      <span className={(l === 'am' || l === 'ti') ? 'font-ethiopic' : ''}>
                        {LOCALE_NAMES[l]}
                      </span>
                      {locale === l && <span className="ml-auto text-[#1C8C7D]">&#10003;</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* Theme Switcher */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="ml-4">{t('settings.theme')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>{t('nav.light')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>{t('nav.dark')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>{t('nav.system')}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('nav.help')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Return to Homepage */}
              <DropdownMenuItem onClick={() => router.push("/")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('nav.backToHomepage')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-sm font-medium text-white shadow-sm">
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
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t('nav.help')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsPricingModalOpen(true)}>
                <Zap className="mr-2 h-4 w-4 fill-purple-500 text-purple-500" />
                <span className="text-purple-600 dark:text-purple-400 font-medium">{t('nav.seePlans')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('common.signOut')}
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

        {/* LEFT SIDEBAR */}
        <aside className={cn(
          // Base styles
          "border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0",
          // Desktop width: collapsed = w-16, expanded = w-56
          sidebarCollapsed ? "md:w-16" : "md:w-56",
          // Desktop: static in flow
          "md:relative md:top-auto md:bottom-auto md:left-auto md:translate-x-0 md:z-auto md:h-full",
          // Mobile: fixed slide-in, always full width when open
          isMobileSidebarOpen ? "fixed top-14 bottom-0 left-0 translate-x-0 z-50 w-56" : "fixed top-14 bottom-0 left-0 -translate-x-full z-50 w-56"
        )}>
          {/* Mobile Sidebar Header with Close Button */}
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-white/[0.08] md:hidden shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <img src="/logo-wordmark.png" alt="Onekof" className="h-8" />
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

          {/* Scrollable nav area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* Collapsible Sidebar Navigation */}
            <CollapsibleSidebar collapsed={sidebarCollapsed} />

            {/* Project Scope Indicator — hidden when collapsed */}
            {!sidebarCollapsed && scopedProject && !isInProject && (
              <div className="mx-3 mt-2 mb-1 rounded-lg border border-[#1C8C7D]/30 bg-[#1C8C7D]/10 p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: scopedProject.color || '#3B82F6' }}
                  >
                    {scopedProject.key?.slice(0, 2)}
                  </div>
                  <span className="text-xs font-semibold text-[#1C8C7D] truncate flex-1">{scopedProject.name}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 text-[10px] text-white/70 hover:text-[#1C8C7D] transition-colors"
                >
                  <X className="h-3 w-3" />
                  {t('nav.viewAllProjects')}
                </Link>
              </div>
            )}

            {/* Collapsible Projects Section — hidden when collapsed */}
            {!sidebarCollapsed && !isInProject && (
              <div className="mt-2 border-t border-slate-200 dark:border-white/[0.08] pt-2 px-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  className="flex items-center justify-between w-full h-auto px-3 py-2 text-xs font-semibold text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
                >
                  <span>{t('nav.projects').toUpperCase()}</span>
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 transition-transform',
                      isProjectsExpanded && 'rotate-90'
                    )}
                  />
                </Button>

                {isProjectsExpanded && (
                  <div className="space-y-0.5 mt-1">
                    {favoriteProjects.length > 0 && (
                      <>
                        {favoriteProjects.map((project) => (
                          <Link
                            key={project.id}
                            href={`/dashboard?projectId=${project.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#181D23] text-slate-700 dark:text-white group"
                          >
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                              style={{ backgroundColor: project.color || '#3B82F6' }}
                            >
                              <IconRenderer iconName={project.icon ?? undefined} className="h-3 w-3 text-white" fallback="📁" />
                            </div>
                            <span className="truncate flex-1">{project.name}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-0 group-hover:opacity-100" />
                          </Link>
                        ))}
                        <div className="h-px bg-slate-200 dark:bg-white/[0.08] my-2" />
                      </>
                    )}
                    {recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/dashboard?projectId=${project.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#181D23] text-slate-700 dark:text-white"
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        >
                          <IconRenderer iconName={project.icon ?? undefined} className="h-3 w-3 text-white" fallback="📁" />
                        </div>
                        <span className="truncate">{project.name}</span>
                      </Link>
                    ))}
                    <Link
                      href="/dashboard/projects"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181D23] mt-2"
                    >
                      {t('nav.viewAllProjects')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Docs & Spaces Section — hidden when collapsed */}
            {!sidebarCollapsed && !isInProject && (
              <div className="mt-2 border-t border-slate-200 dark:border-white/[0.08] pt-2 px-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsDocsExpanded(!isDocsExpanded)}
                  className="flex items-center justify-between w-full h-auto px-3 py-2 text-xs font-semibold text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
                >
                  <span>{t('nav.docs').toUpperCase()}</span>
                  <ChevronRight
                    className={cn(
                      'h-3 w-3 transition-transform',
                      isDocsExpanded && 'rotate-90'
                    )}
                  />
                </Button>

                {isDocsExpanded && (
                  <div className="space-y-0.5 mt-1">
                    <Link
                      href="/dashboard/docs"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#181D23] text-slate-700 dark:text-white"
                    >
                      <Folders className="h-4 w-4" />
                      <span>{t('nav.allSpaces')}</span>
                    </Link>
                    <Link
                      href="/dashboard/docs/recent"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-[#181D23] text-slate-700 dark:text-white"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{t('nav.recentPages')}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* If in project, show quick project info — hidden when collapsed */}
            {!sidebarCollapsed && isInProject && currentProject && (
              <div className="mt-auto border-t border-slate-200 dark:border-white/[0.08] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded text-xs"
                    style={{ backgroundColor: currentProject.color || '#3B82F6' }}
                  >
                    {currentProject.icon || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{currentProject.name}</p>
                    <p className="text-xs text-white/30">{currentProject.key}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapse / Expand toggle — desktop only */}
          <div className="hidden md:flex shrink-0 border-t border-slate-200 dark:border-white/[0.08] p-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0E11]">
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
