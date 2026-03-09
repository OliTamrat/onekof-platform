'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layouts/app-layout';
import {
  Kanban,
  List,
  Clock,
  DollarSign,
  Settings,
  FileText,
  Activity,
  Users,
  Target,
  LayoutDashboard,
  Wrench,
  Leaf,
  HardHat,
  Home,
  BarChart3,
  FolderOpen,
  Calendar,
  Zap,
  BookOpen,
} from 'lucide-react';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface Project {
  id: string;
  name: string;
  key: string;
  icon?: string;
  color?: string;
  description?: string;
}

const TAB_ITEMS = [
  { id: 'board', label: 'Summary', icon: LayoutDashboard, href: '/projects/[id]/board' },
  { id: 'list', label: 'List', icon: List, href: '/projects/[id]/list' },
  { id: 'board-view', label: 'Board', icon: Kanban, href: '/projects/[id]/board' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/projects/[id]/calendar' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/projects/[id]/timeline' },
  { id: 'team', label: 'Team', icon: Users, href: '/projects/[id]/team' },
  { id: 'goals', label: 'Goals', icon: Target, href: '/projects/[id]/goals' },
  { id: 'budget', label: 'Budget', icon: DollarSign, href: '/projects/[id]/budget' },
  { id: 'documents', label: 'Documents', icon: FileText, href: '/projects/[id]/documents' },
  { id: 'automation', label: 'Automation', icon: Zap, href: '/projects/[id]/automation' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, href: '/projects/[id]/wiki' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/projects/[id]/settings' },
] as const;

export default function ProjectLayout({ children }: { children: React.Node }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Project Header */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          {/* Project Title */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: project?.color || '#1C8C7D' }}
              >
                {project?.icon ? (
                  <IconRenderer iconName={project.icon} className="h-6 w-6 text-white" fallback="📁" />
                ) : (
                  <FileText className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  {project?.name || 'Project'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-[#9FADBC]">
                  {project?.key || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 overflow-x-auto">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              const href = tab.href.replace('[id]', projectId);
              const isActive = pathname === href || pathname?.startsWith(href + '/');

              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#1C8C7D] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </AppLayout>
  );
}
