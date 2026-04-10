'use client';

/**
 * Project Timeline Page - Strategic View
 * Focus: Project progress, budget, goals, and health over time
 * NOT just another issues view - that's what the Issues tab is for
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { ISSUES_TABS } from '@/config/department-tabs';
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
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

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
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y'>('90d');

  // Read project scope from URL
  const scopedProjectId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('projectId')
    : null;

  // Fetch issues (filtered by project if scoped)
  const issuesUrl = scopedProjectId ? `/api/issues?projectId=${scopedProjectId}` : '/api/issues';
  const { data: issuesData, isLoading: projectsLoading } = useQuery({
    queryKey: ['issues', 'timeline', scopedProjectId],
    queryFn: async () => {
      const res = await fetch(issuesUrl);
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  // Transform issues into PROJECT timeline format
  // Group issues by project and calculate project-level metrics
  const issues = (issuesData?.issues || []) as any[];

  // Group issues by project
  const projectsMap = new Map<string, any>();

  issues.forEach((issue: any) => {
    if (!issue.project) return;

    const projectId = issue.project.id;
    if (!projectsMap.has(projectId)) {
      projectsMap.set(projectId, {
        id: issue.project.id,
        name: issue.project.name,
        key: issue.project.key,
        color: issue.project.color || '#3B82F6',
        issues: [],
      });
    }
    projectsMap.get(projectId)!.issues.push(issue);
  });

  // Transform to Project format with calculated metrics
  const projects: Project[] = Array.from(projectsMap.values()).map((projectGroup) => {
    const projectIssues = projectGroup.issues;
    const totalIssues = projectIssues.length;
    const completedIssues = projectIssues.filter((i: any) => i.status === 'DONE').length;
    const progress = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

    // Determine project status/health based on task completion and blockers
    let status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED';
    const hasBlockedTasks = projectIssues.some((i: any) => i.status === 'BLOCKED');
    const hasOverdueTasks = projectIssues.some((i: any) =>
      i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE'
    );

    if (progress === 100) {
      status = 'COMPLETED';
    } else if (hasBlockedTasks || hasOverdueTasks) {
      status = 'DELAYED';
    } else if (progress >= 50) {
      status = 'ON_TRACK';
    } else {
      status = 'AT_RISK';
    }

    // Get earliest and latest dates
    const dates = projectIssues
      .map((i: any) => i.createdAt)
      .filter(Boolean)
      .sort();
    const startDate = dates[0] || new Date().toISOString();
    const targetDate = projectIssues
      .map((i: any) => i.dueDate)
      .filter(Boolean)
      .sort()
      .pop() || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: projectGroup.id,
      name: projectGroup.name,
      key: projectGroup.key,
      color: projectGroup.color,
      startDate,
      targetDate,
      status,
      progress: Math.round(progress),
      team: {
        memberCount: new Set(projectIssues.map((i: any) => i.assigneeId).filter(Boolean)).size,
      },
    } as Project;
  });

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
    return { status: 'ON_TRACK', label: 'On Track', color: '#1C8C7D', icon: TrendingUp };
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
        customTabs={ISSUES_TABS}
        showSearch
        showFilters
        showGroupBy
        showViewSettings
        showInsights
      />

      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header Section */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Timelines
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Track project progress, budget, goals, and overall health
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#282E33] rounded-lg p-1">
              {(['30d', '90d', '6m', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : range === '6m' ? '6 Months' : '1 Year'}
                </Button>
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
                <p className="text-sm text-gray-600 dark:text-slate-400">Loading project timelines...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Projects Yet</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Create projects to track their timelines, budget, and progress
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Total Projects</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{projects.length}</div>
                </div>
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">On Track</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">{projects.filter(p => p.status === 'ON_TRACK').length}</div>
                </div>
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">At Risk / Delayed</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-0.5">{projects.filter(p => p.status === 'AT_RISK' || p.status === 'DELAYED').length}</div>
                </div>
                <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Completed</div>
                  <div className="text-xl font-bold text-[#1C8C7D] mt-0.5">{projects.filter(p => p.status === 'COMPLETED').length}</div>
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
                      className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6] transition-all hover:shadow-lg cursor-pointer"
                    >
                      {/* Project Header */}
                      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div
                              className="h-12 w-12 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.key?.slice(0, 2).toUpperCase()}
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
                                <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button className="p-2 hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-lg transition-colors">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Project Metrics */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-4 w-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
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
                                <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
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
                              <div className="text-xs text-gray-600 dark:text-slate-400">
                                {budgetUtilization.toFixed(1)}% utilized
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                Timeline
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(project.startDate)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-slate-400">
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
                              <span className="text-xs font-medium text-gray-600 dark:text-slate-400">
                                Team
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {project.team?.memberCount || 0}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-slate-400">
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

      {/* Project Details Slideout - Detailed Timeline View */}
      {selectedProject && (
        <SlideoutPanel
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`${selectedProject.name} — ${selectedProject.key} • Project Timeline Details`}
          size="xl"
        >
          <SlideoutPanelContent>
            <div className="space-y-6">
              {/* Project Status Header */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: selectedProject.color }}
                      >
                        {selectedProject.key?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedProject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {selectedProject.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${getProjectHealth(selectedProject).color}20`,
                      color: getProjectHealth(selectedProject).color
                    }}
                  >
                    {React.createElement(getProjectHealth(selectedProject).icon, { className: "h-4 w-4" })}
                    {getProjectHealth(selectedProject).label}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.progress}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {calculateDaysRemaining(selectedProject.targetDate) || '--'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Days Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.team?.memberCount || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Team Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.budget ? `${formatCurrency(selectedProject.budget.spent, selectedProject.budget.currency)}` : '--'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Budget Spent</div>
                  </div>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Progress
                </h3>

                <div className="space-y-4">
                  {/* Work Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Completion</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedProject.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-[#282E33] overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${selectedProject.progress}%`,
                          backgroundColor: getProjectHealth(selectedProject).color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Elapsed</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(() => {
                          const start = new Date(selectedProject.startDate || Date.now());
                          const end = new Date(selectedProject.targetDate || Date.now());
                          const now = new Date();
                          const total = end.getTime() - start.getTime();
                          const elapsed = now.getTime() - start.getTime();
                          const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
                          return Math.round(percentage);
                        })()}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-[#282E33] overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{
                          width: `${(() => {
                            const start = new Date(selectedProject.startDate || Date.now());
                            const end = new Date(selectedProject.targetDate || Date.now());
                            const now = new Date();
                            const total = end.getTime() - start.getTime();
                            const elapsed = now.getTime() - start.getTime();
                            const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
                            return Math.round(percentage);
                          })()}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs text-gray-600 dark:text-slate-400">Start Date</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatDate(selectedProject.startDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600 dark:text-slate-400">Target Date</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatDate(selectedProject.targetDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Details */}
              {selectedProject.budget && (
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget Utilization
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spent vs Allocated</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {((selectedProject.budget.spent / selectedProject.budget.allocated) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200 dark:bg-[#282E33] overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(100, (selectedProject.budget.spent / selectedProject.budget.allocated) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">Allocated</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {formatCurrency(selectedProject.budget.allocated, selectedProject.budget.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">Spent</span>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {formatCurrency(selectedProject.budget.spent, selectedProject.budget.currency)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">Remaining</span>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                          {formatCurrency(selectedProject.budget.allocated - selectedProject.budget.spent, selectedProject.budget.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Information */}
              <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Overview
                </h3>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProject.team?.memberCount || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Active team members working on this project
                  </p>
                </div>
              </div>

              {/* AI Insights */}
              <div className="rounded-lg border border-[#8B5CF6]/20 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-[#8B5CF6]" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Insights & Recommendations
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#8B5CF6] mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Project Health: {getProjectHealth(selectedProject).label}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        Current progress is at {selectedProject.progress}%.
                        {selectedProject.progress < 50 && ' Consider reviewing task priorities and team allocation.'}
                        {selectedProject.progress >= 50 && selectedProject.progress < 80 && ' Project is progressing well, maintain current pace.'}
                        {selectedProject.progress >= 80 && ' Excellent progress! Focus on quality and final deliverables.'}
                      </p>
                    </div>
                  </div>

                  {selectedProject.budget && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#8B5CF6] mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Budget Status
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {((selectedProject.budget.spent / selectedProject.budget.allocated) * 100).toFixed(1)}% of budget utilized.
                          {((selectedProject.budget.spent / selectedProject.budget.allocated) * 100) > 80 && ' Monitor spending closely.'}
                          {((selectedProject.budget.spent / selectedProject.budget.allocated) * 100) <= 80 && ' Budget tracking is on target.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {calculateDaysRemaining(selectedProject.targetDate) !== null && (
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#8B5CF6] mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Timeline Status
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {calculateDaysRemaining(selectedProject.targetDate)! > 0
                            ? `${calculateDaysRemaining(selectedProject.targetDate)} days remaining until deadline.`
                            : `Project is ${Math.abs(calculateDaysRemaining(selectedProject.targetDate)!)} days overdue.`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    window.location.href = `/dashboard?projectId=${selectedProject.id}`;
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors"
                >
                  View Project Dashboard
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = `/dashboard/issues?projectId=${selectedProject.id}`;
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                >
                  View Issues
                </Button>
              </div>
            </div>
          </SlideoutPanelContent>
        </SlideoutPanel>
      )}
    </AppLayout>
  );
}
