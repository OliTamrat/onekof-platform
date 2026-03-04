'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUSES = [
  { id: 'TODO', label: 'To Do', color: 'bg-slate-200 dark:bg-slate-700' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-200 dark:bg-blue-900' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-200 dark:bg-purple-900' },
  { id: 'DONE', label: 'Done', color: 'bg-green-200 dark:bg-green-900' },
];

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/issues`);
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIssuesByStatus = (status: string) => {
    return issues.filter(issue => issue.status === status);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden bg-gray-50 dark:bg-[#1B1F23]">
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        {STATUSES.map(status => (
          <div
            key={status.id}
            className="flex w-80 flex-shrink-0 flex-col rounded-lg bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {status.label}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getIssuesByStatus(status.id).length}
                </span>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Issues */}
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {getIssuesByStatus(status.id).map(issue => (
                <div
                  key={issue.id}
                  className="cursor-pointer rounded-lg border border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#1B1F23] p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {issue.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {issue.key}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  {issue.assignee && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#1C8C7D] flex items-center justify-center text-xs text-white font-medium">
                        {issue.assignee.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {issue.assignee.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
