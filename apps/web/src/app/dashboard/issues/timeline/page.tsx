'use client';

/**
 * Project Timeline Page - Strategic View
 * Focus: Project progress, budget, goals, and health over time
 * NOT just another issues view - that's what the Issues tab is for
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { SlideoutPanel, SlideoutPanelContent } from '@/components/ui/slideout-panel';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Users,
  Activity,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  key: string;
  color: string;
  description?: string;
  startDate?: string;
  targetDate?: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
  progress: number;
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  team?: {
    memberCount: number;
  };
}

export default function IssuesTimelinePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y'>('90d');

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  // Fetch project analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics', 'projects'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/projects');
      if (!res.ok) return null;
      return res.json();
    },
  });

  const projects = (projectsData?.projects || []) as Project[];

  // Calculate project health
  const getProjectHealth = (project: Project): { status: string; label: string; color: string; icon: any } => {
    if (project.status === 'COMPLETED') {
      return { status: 'COMPLETED', label: 'Completed', color: '#10B981', icon: CheckCircle2 };
    }
    if (project.status === 'DELAYED') {
      return { status: 'DELAYED', label: 'Delayed', color: '#EF4444', icon: AlertTriangle };
    }
    if (project.status === 'AT_RISK') {
      return { status: 'AT_RISK', label: 'At Risk', color: '#F59E0B', icon: AlertTriangle };
    }
    return { status: 'ON_TRACK', label: 'On Track', color: '#0065FF', icon: TrendingUp };
  };

  const formatCurrency = (amount: number, currency: string = 'ETB') => {
    return `${currency} ${(amount / 1000000).toFixed(1)}M`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Timeline"
        icon={<Clock className="h-6 w-6" />}
        iconColor="#8B5CF6"
        currentTab="timeline"
        baseHref="/dashboard/issues"
        showTabs
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Timelines
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">
                Track project progress, budget, goals, and overall health
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#282E33] rounded-lg p-1">
              {(['30d', '90d', '6m', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '6m' ? '6 Months' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {projectsLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#8B5CF6] dark:border-gray-700"></div>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Loading project timelines...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Projects Yet</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#9FADBC]">
                  Create projects to track their timelines, budget, and progress
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {projects.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#6B7684]">Total Projects</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {projects.filter(p => p.status === 'ON_TRACK').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#6B7684]">On Track</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {projects.filter(p => p.status === 'AT_RISK' || p.status === 'DELAYED').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#6B7684]">At Risk/Delayed</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {projects.filter(p => p.status === 'COMPLETED').length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#6B7684]">Completed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Timeline Cards */}
              <div className="space-y-4">
                {projects.map((project) => {
                  const health = getProjectHealth(project);
                  const HealthIcon = health.icon;
                  const daysRemaining = calculateDaysRemaining(project.targetDate);
                  const budgetUtilization = project.budget
                    ? (project.budget.spent / project.budget.allocated) * 100
                    : 0;

                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] overflow-hidden hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6] transition-all hover:shadow-lg cursor-pointer"
                    >
                      {/* Project Header */}
                      <div className="p-6 border-b border-gray-200 dark:border-[#2C333A]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.key}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {project.name}
                                </h3>
                                <div
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `${health.color}20`,
                                    color: health.color
                                  }}
                                >
                                  <HealthIcon className="h-3.5 w-3.5" />
                                  {health.label}
                                </div>
                              </div>
                              {project.description && (
                                <p className="text-sm text-gray-600 dark:text-[#9FADBC] line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-lg transition-colors">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Project Metrics */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-4 w-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                                Progress
                              </span>
                            </div>
                            <div className="mb-2">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.progress}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-200 dark:bg-[#282E33] overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{
                                  width: `${project.progress}%`,
                                  backgroundColor: health.color,
                                }}
                              />
                            </div>
                          </div>

                          {/* Budget */}
                          {project.budget && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                                  Budget
                                </span>
                              </div>
                              <div className="mb-1">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(project.budget.spent, project.budget.currency)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-[#6B7684]">
                                  {' '}/ {formatCurrency(project.budget.allocated, project.budget.currency)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-[#9FADBC]">
                                {budgetUtilization.toFixed(1)}% utilized
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                                Timeline
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(project.startDate)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-[#9FADBC]">
                              {daysRemaining !== null ? (
                                daysRemaining > 0 ? (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {daysRemaining} days remaining
                                  </span>
                                ) : daysRemaining === 0 ? (
                                  <span className="text-orange-600 dark:text-orange-400">
                                    Due today
                                  </span>
                                ) : (
                                  <span className="text-red-600 dark:text-red-400">
                                    {Math.abs(daysRemaining)} days overdue
                                  </span>
                                )
                              ) : (
                                'Target: ' + formatDate(project.targetDate)
                              )}
                            </div>
                          </div>

                          {/* Team */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-[#9FADBC]">
                                Team
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.team?.memberCount || 0}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-[#9FADBC]">
                              team members
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details Slideout */}
      {selectedProject && (
        <SlideoutPanel
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.name}
          subtitle={`Project Timeline & Details`}
          size="lg"
        >
          <SlideoutPanelContent>
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="rounded-lg border border-gray-200 dark:border-[#2C333A] p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Project Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">Description</span>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedProject.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">Start Date</span>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedProject.startDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">Target Date</span>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedProject.targetDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-lg border border-[#8B5CF6]/20 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Insights
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Project Health Analysis
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">
                        Based on current progress ({selectedProject.progress}%) and timeline, this project is {getProjectHealth(selectedProject).label.toLowerCase()}.
                        {selectedProject.budget && ` Budget utilization is at ${((selectedProject.budget.spent / selectedProject.budget.allocated) * 100).toFixed(1)}%.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors">
                  View Full Report
                </button>
                <button className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-[#2C333A] text-gray-700 dark:text-[#9FADBC] hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors">
                  Export Timeline
                </button>
              </div>
            </div>
          </SlideoutPanelContent>
        </SlideoutPanel>
      )}
    </AppLayout>
  );
}
