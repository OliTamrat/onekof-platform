'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Shield,
  ChevronLeft,
  Loader2,
  LogOut,
  UsersRound,
  Crown,
  ShieldCheck,
  Eye,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

interface AdminInfo {
  username: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

const ROLE_CONFIG = {
  OWNER: { label: 'Owner', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ADMIN: { label: 'Admin', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  VIEWER: { label: 'Viewer', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
};

export default function AdminLayout({ children }: { children: ReactNode }): ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    fetch('/api/admin/me')
      .then(res => {
        if (!res.ok) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.admin) setAdmin(data.admin);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#1B1F23]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, minRole: 'VIEWER' as const },
    { href: '/admin/organizations', label: 'Organizations', icon: Building2, minRole: 'VIEWER' as const },
    { href: '/admin/users', label: 'Users', icon: Users, minRole: 'VIEWER' as const },
    { href: '/admin/system', label: 'System Health', icon: Activity, minRole: 'VIEWER' as const },
    { href: '/admin/team', label: 'Admin Team', icon: UsersRound, minRole: 'OWNER' as const },
  ];

  const ROLE_LEVEL = { OWNER: 3, ADMIN: 2, VIEWER: 1 };
  const visibleNavItems = navItems.filter(item => ROLE_LEVEL[admin.role] >= ROLE_LEVEL[item.minRole]);
  const roleConfig = ROLE_CONFIG[admin.role];
  const RoleIcon = roleConfig.icon;

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <img src="/logo-wordmark.png" alt="Onekof" className="h-8" />
          <p className="text-[10px] text-slate-400">Platform Management</p>
        </div>
      </div>

      {/* Logged-in admin */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{admin.name}</p>
            <div className="flex items-center gap-1">
              <RoleIcon className={cn('h-3 w-3', roleConfig.color)} />
              <span className={cn('text-[10px] font-bold', roleConfig.color)}>{roleConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
        {visibleNavItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22272B] hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-500' : '')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22272B] hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Site
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
        <div className="flex items-center justify-end px-3 py-1">
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#1B1F23]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] flex-col sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#1B1F23] border-r border-slate-200 dark:border-slate-700 flex flex-col z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#22272B]"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Admin</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
