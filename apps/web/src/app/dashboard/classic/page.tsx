'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState , type ReactNode } from 'react';
import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Circle,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Add timeout for loading state to prevent infinite buffering
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000); // 3 second timeout
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // Show loading while checking session (with timeout to prevent infinite loading)
  if (status === 'loading' && !loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0E11]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If loading timed out, show error message
  if (status === 'loading' && loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0E11]">
        <div className="text-center max-w-md p-6">
          <div className="mb-4 text-yellow-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Session Loading Issue</h2>
          <p className="text-sm text-gray-400 mb-4">
            The session is taking longer than expected to load. This might be a configuration issue.
          </p>
          <Button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-[#1C8C7D] text-white rounded-md hover:bg-[#156B60]"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!session) {
    return null;
  }
  return (
    <div className="flex h-screen bg-[#0B0E11]">
      {/* Sidebar - Jira-inspired */}
      <aside className="w-64 border-r border-gray-800 bg-[#12161B]">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-800 px-4">
          <img src="/logo-wordmark.png" alt="Onekof" className="h-7" />
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <div className="mb-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              For you
            </p>
            <NavItem icon={<Home className="h-5 w-5" />} label="Home" active />
            <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          </div>

          <div className="mb-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Spaces
            </p>
            <NavItem icon={<Users className="h-5 w-5" />} label="My Software Team" active />
          </div>

          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Quick Links
            </p>
            <NavItem icon={<FileText className="h-5 w-5" />} label="Documents" />
            <NavItem icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
            <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-[#12161B] px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">My Software Team</h1>
            <div className="flex items-center gap-2 rounded-md bg-[#0B0E11] px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-64 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dashboard Switcher */}
            <Button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 rounded-md border border-[#1C8C7D] px-4 py-2 text-sm font-semibold text-[#1C8C7D] hover:bg-[#1C8C7D] hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Switch to Modern Dashboard
            </Button>
            <Button className="flex items-center gap-2 rounded-md bg-[#1C8C7D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#156B60]">
              <Plus className="h-4 w-4" />
              Create
            </Button>
            <Button variant="ghost" size="icon" className="rounded-md p-2 hover:bg-[#0B0E11]">
              <Bell className="h-5 w-5 text-gray-400" />
            </Button>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <Button className="flex items-center gap-2 rounded-md p-2 hover:bg-[#0B0E11]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C8C7D] text-sm font-semibold text-white">
                  {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-sm font-medium text-white">{session.user?.name || 'User'}</span>
                  <span className="text-xs text-gray-400">{session.user?.email}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 hidden w-56 rounded-lg border border-gray-800 bg-[#12161B] py-2 shadow-xl group-hover:block">
                <div className="border-b border-gray-800 px-4 py-3">
                  <p className="text-sm font-medium text-white">{session.user?.name}</p>
                  <p className="text-xs text-gray-400">{session.user?.email}</p>
                </div>
                <Button
                  onClick={() => router.push('/settings/profile')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#0B0E11]"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#0B0E11]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto bg-[#0B0E11] p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              value="0"
              label="completed"
              sublabel="in the last 7 days"
              color="text-gray-400"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              value="3"
              label="updated"
              sublabel="in the last 7 days"
              color="text-blue-400"
            />
            <StatCard
              icon={<Plus className="h-5 w-5" />}
              value="3"
              label="created"
              sublabel="in the last 7 days"
              color="text-green-400"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              value="1"
              label="due soon"
              sublabel="in the next 7 days"
              color="text-orange-400"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Status Overview */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-800 bg-[#12161B] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Status overview</h2>
                  <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                    View all work items
                  </a>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                  Get a snapshot of the status of your work items.
                </p>

                {/* Donut Chart */}
                <div className="flex items-center gap-8">
                  <div className="relative h-48 w-48">
                    {/* SVG Donut Chart */}
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#2D3338"
                        strokeWidth="15"
                      />
                      {/* Green segment (To Do - 67%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="15"
                        strokeDasharray="147 220"
                        strokeDashoffset="0"
                        className="transition-all duration-300"
                      />
                      {/* Blue segment (In Progress - 33%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="15"
                        strokeDasharray="73 220"
                        strokeDashoffset="-147"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">3</div>
                      <div className="text-sm text-gray-400">Total work items</div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    <LegendItem color="bg-green-500" label="To Do" value="2" />
                    <LegendItem color="bg-blue-500" label="In Progress" value="1" />
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="mt-6 rounded-lg border border-gray-800 bg-[#12161B] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Priority breakdown</h2>
                  <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                    How to manage priorities for spaces
                  </a>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                  Get a holistic view of how work is being prioritized.
                </p>

                {/* Bar Chart */}
                <div className="space-y-3">
                  <PriorityBar label="Highest" value={0} max={3} color="bg-red-500" />
                  <PriorityBar label="High" value={0} max={3} color="bg-orange-500" />
                  <PriorityBar label="Medium" value={3} max={3} color="bg-yellow-500" />
                  <PriorityBar label="Low" value={0} max={3} color="bg-blue-500" />
                  <PriorityBar label="Lowest" value={0} max={3} color="bg-gray-500" />
                  <PriorityBar label="None" value={0} max={3} color="bg-gray-600" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="rounded-lg border border-gray-800 bg-[#12161B] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Recent activity</h2>
                  <Button variant="ghost" size="icon" className="rounded p-1 hover:bg-[#0B0E11]">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                  Stay up to date with what's happening across the space.
                </p>

                <div className="space-y-4">
                  <ActivityItem
                    user="olitamrat"
                    action='updated field "status" on'
                    item="KAN-3: Subtask 2.1"
                    badge="TO DO"
                    time="1 minute ago"
                  />
                  <ActivityItem
                    user="olitamrat"
                    action='updated field "IssueParentAssociation" on'
                    item="KAN-3: Subtask 2.1"
                    badge="TO DO"
                    time="1 minute ago"
                  />
                  <ActivityItem
                    user="olitamrat"
                    action="created"
                    item="KAN-3: Subtask 2.1"
                    badge="TO DO"
                    time="1 minute ago"
                  />
                </div>
              </div>

              {/* Types of Work */}
              <div className="rounded-lg border border-gray-800 bg-[#12161B] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Types of work</h2>
                  <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                    View all items
                  </a>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                  Get a breakdown of work items by their types.
                </p>

                <div className="space-y-3">
                  <TypeBar label="Task" value={33} color="bg-blue-500" />
                  <TypeBar label="Story" value={33} color="bg-green-500" />
                  <TypeBar label="Subtask" value={33} color="bg-purple-500" />
                  <TypeBar label="Epic" value={0} color="bg-indigo-500" />
                  <TypeBar label="Feature" value={0} color="bg-pink-500" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <Button
      className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-[#1C8C7D]/20 text-[#1C8C7D]'
          : 'text-gray-400 hover:bg-[#0B0E11] hover:text-white'
      }`}
    >
      {icon}
      {label}
    </Button>
  );
}

function StatCard({
  icon,
  value,
  label,
  sublabel,
  color,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#12161B] p-6">
      <div className="flex items-start justify-between">
        <div className={color}>{icon}</div>
        <Button variant="ghost" size="icon" className="rounded p-1 hover:bg-[#0B0E11]">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="mt-1 text-sm font-medium text-gray-300">{label}</div>
        <div className="mt-1 text-xs text-gray-500">{sublabel}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-3 w-3 rounded-sm ${color}`} />
      <div className="text-sm text-gray-300">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function PriorityBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-4">
      <div className="w-20 text-sm text-gray-400">{label}</div>
      <div className="flex-1">
        <div className="h-6 overflow-hidden rounded bg-[#0B0E11]">
          {value > 0 && (
            <div
              className={`h-full ${color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
      <div className="w-8 text-right text-sm text-white">{value}</div>
    </div>
  );
}

function TypeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Circle className={`h-3 w-3 ${color.replace('bg-', 'text-')}`} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#0B0E11]">
          {value > 0 && (
            <div
              className={`h-full ${color}`}
              style={{ width: `${value}%` }}
            />
          )}
        </div>
        <span className="w-12 text-right text-sm text-white">{value}%</span>
      </div>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  item,
  badge,
  time,
}: {
  user: string;
  action: string;
  item: string;
  badge: string;
  time: string;
}) {
  return (
    <div className="border-l-2 border-gray-700 pl-4">
      <div className="text-sm text-gray-300">
        <span className="font-medium text-white">{user}</span> {action}{' '}
        <a href="#" className="text-[#1C8C7D] hover:underline">
          {item}
        </a>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
          {badge}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
}
