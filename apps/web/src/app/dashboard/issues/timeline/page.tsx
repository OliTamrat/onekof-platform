'use client';

/**
 * Enhanced Timeline Page - Multi-Project Support
 * Features:
 * - Group by Project or by Time Period
 * - Horizontal Gantt-style view option
 * - Better visualization for multiple projects
 * - Collapsible project sections
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import {
  Clock,
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronRight,
  List,
  LayoutGrid,
} from 'lucide-react';

interface Issue {
  id: string;
  key: string;
  title: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
  };
}

type GroupByMode = 'project' | 'time';
type ViewMode = 'list' | 'grid';

export default function IssuesTimelinePage() {
  const [groupBy, setGroupBy] = useState<GroupByMode>('project');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  // Fetch issues
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const res = await fetch('/api/issues');
      if (!res.ok) throw new Error('Failed to fetch issues');
      return res.json();
    },
  });

  const projects = projectsData?.projects || [];
  const issues = (issuesData?.issues || []) as Issue[];

  // Group issues by project
  const groupedByProject = issues.reduce((acc: Record<string, Issue[]>, issue: Issue) => {
    const projectId = issue.project?.id || 'no-project';
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(issue);
    return acc;
  }, {});

  // Group issues by month
  const groupedByTime = issues.reduce((acc: Record<string, Issue[]>, issue: Issue) => {
    const date = new Date(issue.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(issue);
    return acc;
  }, {});

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'IN_REVIEW':
        return 'bg-purple-500';
      case 'BLOCKED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Timeline"
        icon={<Clock className="h-6 w-6" />}
        iconColor="#06B6D4"
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
        {/* Timeline View Controls */}
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Timeline View
              </h2>
              <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">
                Visualize your issues across projects and time
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Group By */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#282E33] rounded-lg p-1">
                <button
                  onClick={() => setGroupBy('project')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    groupBy === 'project'
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  By Project
                </button>
                <button
                  onClick={() => setGroupBy('time')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    groupBy === 'time'
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  By Time
                </button>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#282E33] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#22272B] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#06B6D4] dark:border-gray-700"></div>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Loading timeline...</p>
              </div>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No timeline data</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#9FADBC]">
                  Create some issues to see them on the timeline.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* GROUP BY PROJECT */}
              {groupBy === 'project' && (
                <div className="space-y-6">
                  {Object.entries(groupedByProject)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .map(([projectId, projectIssues]) => {
                      const project = projects.find((p: any) => p.id === projectId) || {
                        id: 'no-project',
                        name: 'No Project',
                        key: 'NONE',
                        color: '#6B7684',
                      };
                      const isExpanded = expandedProjects.has(projectId);

                      return (
                        <div
                          key={projectId}
                          className="rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B] overflow-hidden"
                        >
                          {/* Project Header */}
                          <button
                            onClick={() => toggleProject(projectId)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#282E33] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {project.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                                  {projectIssues.length} {projectIssues.length === 1 ? 'issue' : 'issues'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-600 dark:text-[#9FADBC]">
                                {project.key}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Project Issues */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 dark:border-[#2C333A] p-6">
                              {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {projectIssues.map((issue) => (
                                    <IssueCard
                                      key={issue.id}
                                      issue={issue}
                                      formatDate={formatDate}
                                      getStatusColor={getStatusColor}
                                      getStatusLabel={getStatusLabel}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {projectIssues.map((issue) => (
                                    <IssueCard
                                      key={issue.id}
                                      issue={issue}
                                      formatDate={formatDate}
                                      getStatusColor={getStatusColor}
                                      getStatusLabel={getStatusLabel}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* GROUP BY TIME */}
              {groupBy === 'time' && (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-[#2C333A]" />

                  {/* Timeline items */}
                  <div className="space-y-8">
                    {Object.entries(groupedByTime)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([monthYear, monthIssues]) => (
                        <div key={monthYear} className="relative pl-20">
                          {/* Month marker */}
                          <div className="absolute left-0 top-0 flex items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-[#22272B] border-2 border-[#06B6D4] shadow-sm">
                              <Calendar className="h-6 w-6 text-[#06B6D4]" />
                            </div>
                          </div>

                          {/* Month header */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {monthYear}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-[#9FADBC] mt-1">
                              {monthIssues.length} {monthIssues.length === 1 ? 'issue' : 'issues'}
                            </p>
                          </div>

                          {/* Issues in this month */}
                          {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {monthIssues.map((issue) => (
                                <IssueCard
                                  key={issue.id}
                                  issue={issue}
                                  formatDate={formatDate}
                                  getStatusColor={getStatusColor}
                                  getStatusLabel={getStatusLabel}
                                  showProject
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {monthIssues.map((issue) => (
                                <IssueCard
                                  key={issue.id}
                                  issue={issue}
                                  formatDate={formatDate}
                                  getStatusColor={getStatusColor}
                                  getStatusLabel={getStatusLabel}
                                  showProject
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// Issue Card Component
function IssueCard({
  issue,
  formatDate,
  getStatusColor,
  getStatusLabel,
  showProject = false,
}: {
  issue: Issue;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  showProject?: boolean;
}) {
  return (
    <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] hover:border-[#06B6D4] dark:hover:border-[#06B6D4] cursor-pointer transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[#06B6D4]" />
          <span className="text-sm font-semibold text-[#06B6D4]">
            {issue.key}
          </span>
          <span className={`h-2 w-2 rounded-full ${getStatusColor(issue.status)}`} />
        </div>
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]">
          {issue.type}
        </span>
      </div>

      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {issue.title}
      </h4>

      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-600 dark:text-[#9FADBC]">
        {showProject && issue.project && (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: issue.project.color }}
            />
            <span>{issue.project.name}</span>
          </div>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(issue.createdAt)}
        </span>
        {issue.dueDate && (
          <span className="flex items-center gap-1">
            Due: {formatDate(issue.dueDate)}
          </span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2C333A]">
        <span className="text-xs font-medium text-gray-700 dark:text-[#9FADBC]">
          {getStatusLabel(issue.status)}
        </span>
      </div>
    </div>
  );
}
