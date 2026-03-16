'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Shield,
  ChevronLeft,
  Loader2,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/system', label: 'System Health', icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      setAuthorized(true);
      return;
    }

    fetch('/api/admin/stats')
      .then(res => {
        if (res.status === 403 || res.status === 401) {
          router.push('/admin/login');
          return;
        }
        setAuthorized(true);
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  // Login page renders without the admin chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#1B1F23]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#1B1F23]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1B1F23] flex flex-col">
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Onekof Admin</p>
            <p className="text-[10px] text-slate-400">Platform Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#22272B] hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-primary-500' : '')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#22272B] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <div className="flex items-center justify-end px-3 py-1">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
