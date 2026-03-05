'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layouts/app-layout';
import { ProjectPageHeader } from '@/components/navigation/project-page-header';
import { CheckSquare } from 'lucide-react';

interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    key: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export default function IssuesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const currentProject = projectsData?.projects?.[0];
  const issues = issuesData?.issues || [];

  // Filter issues based on search
  const filteredIssues = issues.filter((issue: Issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.key.toLowerCase().includes(query) ||
      issue.title.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'IN_REVIEW':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'DONE':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'BLOCKED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-[#282E33] text-gray-700 dark:text-[#9FADBC]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGHEST':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400';
      case 'LOWEST':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Project Page Header with Navigation */}
        <ProjectPageHeader
          project={currentProject}
          onCreateClick={() => setShowCreateModal(true)}
          showSearch
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          showFilter
        />

        {/* Issues Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-600 dark:text-[#9FADBC]">Loading issues...</div>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684]" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No issues</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#9FADBC]">
                  {searchQuery ? 'No issues match your search.' : 'Get started by creating a new issue.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A] overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2C333A]">
                <thead className="bg-gray-50 dark:bg-[#282E33]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#22272B] divide-y divide-gray-200 dark:divide-[#2C333A]">
                  {filteredIssues.map((issue: Issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#282E33] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-[#0065FF]" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {issue.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {issue.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#9FADBC]">
                          {issue.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            {issue.assignee.avatar ? (
                              <img
                                src={issue.assignee.avatar}
                                alt={issue.assignee.name || ''}
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0065FF] text-xs font-medium text-white">
                                {issue.assignee.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {issue.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-[#6B7684]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.dueDate ? (
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-[#9FADBC]">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(issue.dueDate)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-[#6B7684]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
