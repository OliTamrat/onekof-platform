'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState , type ReactNode } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { CreateProjectModal } from '@/components/create-project-modal';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  MoreHorizontal,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { projects, isLoadingProjects } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0E11]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-white/70">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // If loading timed out, show error message
  if (status === 'loading' && loadingTimeout) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0B0E11]">
        <div className="text-center max-w-md p-6">
          <div className="mb-4 text-yellow-500">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Session Loading Issue</h2>
          <p className="text-sm text-slate-600 dark:text-white/70 mb-4">
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

  // Get favorite projects
  const favoriteProjects = projects.filter(p => p.isFavorite).slice(0, 3);

  return (
    <AppLayout>
      <div className="p-6">
        {/* Dashboard Switcher Banner */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-[#1C8C7D]/30 bg-gradient-to-r from-[#1C8C7D]/10 to-transparent p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#1C8C7D]" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                New Dashboard Experience
              </h3>
              <p className="text-xs text-slate-600 dark:text-white/70">
                You're viewing the redesigned dashboard with modern layouts and dark mode support
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Classic
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value="0"
            label="completed"
            sublabel="in the last 7 days"
            color="text-slate-500 dark:text-white/70"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value="3"
            label="updated"
            sublabel="in the last 7 days"
            color="text-blue-500 dark:text-blue-400"
          />
          <StatCard
            icon={<Plus className="h-5 w-5" />}
            value="3"
            label="created"
            sublabel="in the last 7 days"
            color="text-green-500 dark:text-green-400"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value="1"
            label="due soon"
            sublabel="in the next 7 days"
            color="text-orange-500 dark:text-orange-400"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Overview */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Status overview
                </h2>
                <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                  View all work items
                </a>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-white/70">
                Get a snapshot of the status of your work items.
              </p>

              {/* Donut Chart */}
              <div className="flex items-center gap-8">
                <div className="relative h-48 w-48">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700"
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
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">3</div>
                    <div className="text-sm text-slate-500 dark:text-white/70">Total work items</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">To Do</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t("status.inProgress")}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">1</span>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Priority breakdown</h3>
                  <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                    How to manage priorities for spaces
                  </a>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-white/70">
                  Get a holistic view of how work is being prioritized.
                </p>
                <div className="space-y-2">
                  <PriorityBar label="Highest" value={0} max={3} />
                  <PriorityBar label="High" value={0} max={3} />
                  <PriorityBar label="Medium" value={3} max={3} color="bg-yellow-500" />
                  <PriorityBar label="Low" value={0} max={3} />
                  <PriorityBar label="Lowest" value={0} max={3} />
                  <PriorityBar label="None" value={0} max={3} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent activity
                </h2>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-white/70">
                Stay up to date with what's happening across the space.
              </p>
              <div className="space-y-3">
                <ActivityItem
                  user="oliamrat"
                  action="updated field 'status' on"
                  item="KAN-3: Subtask 2.1"
                  status="TO DO"
                  time="1 minute ago"
                />
                <ActivityItem
                  user="oliamrat"
                  action="updated field 'issueParentAssociation' on"
                  item="KAN-3: Subtask 2.1"
                  status="TO DO"
                  time="1 minute ago"
                />
                <ActivityItem
                  user="oliamrat"
                  action="created"
                  item="KAN-3: Subtask 2.1"
                  status="TO DO"
                  time="1 minute ago"
                />
              </div>
            </div>

            {/* Types of Work */}
            <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Types of work
                </h2>
                <a href="#" className="text-sm text-[#1C8C7D] hover:underline">
                  View all items
                </a>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-white/70">
                Get a breakdown of work items by their types.
              </p>
              <div className="space-y-2">
                <TypeBar label="Task" percentage={33} color="bg-blue-500" />
                <TypeBar label="Story" percentage={33} color="bg-green-500" />
                <TypeBar label="Subtask" percentage={33} color="bg-purple-500" />
                <TypeBar label="Epic" percentage={0} />
                <TypeBar label="Feature" percentage={0} />
              </div>
            </div>

            {/* Favorite Projects */}
            {favoriteProjects.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Favorite Projects
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/projects')}
                  >
                    View all
                  </Button>
                </div>
                <div className="space-y-2">
                  {favoriteProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.key}`)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-[#181D23] cursor-pointer"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded text-sm"
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      >
                        <IconRenderer iconName={project.icon || undefined} className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/70">
                          {project.key}
                        </p>
                      </div>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </AppLayout>
  );
}

// Helper Components
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
    <div className="rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-[#12161B] dark:to-[#0B0E11] border border-slate-200/50 p-3 md:p-6 shadow-sm hover:shadow-md transition-all">
      <div className="mb-2 md:mb-4 flex items-center justify-between">
        <div className={`p-1.5 md:p-2 rounded-lg bg-slate-100 dark:bg-[#181D23]/50 ${color}`}>{icon}</div>
        <Button variant="ghost" size="icon" className="h-6 w-6 hidden md:flex">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="mt-0.5 md:mt-1 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{label}</div>
      <div className="text-[10px] md:text-xs text-slate-500 dark:text-white/70 hidden sm:block">{sublabel}</div>
    </div>
  );
}

function PriorityBar({
  label,
  value,
  max,
  color = 'bg-slate-300 dark:bg-slate-600',
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm text-slate-700 dark:text-slate-300">{label}</div>
      <div className="flex-1 h-6 bg-slate-100 dark:bg-[#181D23] rounded-full overflow-hidden">
        {percentage > 0 && (
          <div
            className={`h-full ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      <div className="w-8 text-right text-sm font-medium text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function TypeBar({
  label,
  percentage,
  color = 'bg-slate-300 dark:bg-slate-600',
}: {
  label: string;
  percentage: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 h-2 bg-slate-100 dark:bg-[#181D23] rounded-full overflow-hidden">
          {percentage > 0 && (
            <div
              className={`h-full ${color}`}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
        <span className="w-10 text-right font-medium text-slate-900 dark:text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function ActivityItem({
  user,
  action,
  item,
  status,
  time,
}: {
  user: string;
  action: string;
  item: string;
  status: string;
  time: string;
}) {
  return (
    <div className="text-sm">
      <p className="text-slate-700 dark:text-slate-300">
        <span className="font-medium text-slate-900 dark:text-white">{user}</span>{' '}
        {action}{' '}
        <span className="font-medium text-[#1C8C7D]">{item}</span>
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="inline-block rounded bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
          {status}
        </span>
        <span className="text-xs text-slate-500 dark:text-white/70">{time}</span>
      </div>
    </div>
  );
}
