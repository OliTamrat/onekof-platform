'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/contexts/workspace-context';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Home,
  FolderKanban,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { currentOrganization } = useWorkspace();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B0E11]">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'flex flex-col border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] transition-all duration-300',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Workspace */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/[0.08] px-4">
          {!isSidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-white font-bold">
                O
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Onekof
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="h-8 w-8"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isSidebarCollapsed}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Workspace Switcher */}
        {!isSidebarCollapsed && (
          <div className="border-b border-slate-200 dark:border-white/[0.08] p-3">
            <WorkspaceSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-slate-100 dark:bg-[#181D23] text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-[#181D23] hover:text-slate-900 dark:hover:text-white'
                )}
                aria-current={isActive(item.href) ? 'page' : undefined}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 dark:border-white/[0.08] p-3">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-sm font-medium text-white">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-white/30 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="h-8 w-8 shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="w-full"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentOrganization?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0B0E11]" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
