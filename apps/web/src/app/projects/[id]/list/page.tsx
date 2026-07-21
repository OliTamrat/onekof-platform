'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, List } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const STATUS_CONFIG = {
  TODO: { labelKey: 'status.todo', icon: List, color: 'text-gray-500' },
  IN_PROGRESS: { labelKey: 'status.inProgress', icon: Clock, color: 'text-blue-500' },
  IN_REVIEW: { labelKey: 'status.inReview', icon: AlertCircle, color: 'text-purple-500' },
  DONE: { labelKey: 'status.done', icon: CheckCircle2, color: 'text-green-500' },
};

export default function ProjectListPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-[#1B1F23] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#1B1F23] px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="col-span-1">{t('common.type')}</div>
            <div className="col-span-2">{t('projects.projectKey')}</div>
            <div className="col-span-4">{t('common.summary')}</div>
            <div className="col-span-2">{t('common.assignee')}</div>
            <div className="col-span-2">{t('common.status')}</div>
            <div className="col-span-1">{t('common.priority')}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {issues.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                {t('emptyStates.noIssuesDesc')}
              </div>
            ) : (
              issues.map(issue => {
                const StatusIcon = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.icon || List;
                const statusColor = STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.color || 'text-gray-500';

                return (
                  <div
                    key={issue.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#1B1F23] cursor-pointer transition-colors"
                  >
                    <div className="col-span-1 flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {issue.type}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {issue.key}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {issue.title}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {issue.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#1C8C7D] flex items-center justify-center text-xs text-white font-medium">
                            {issue.assignee.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {issue.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">{t('common.unassigned')}</span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG]?.labelKey ? t(STATUS_CONFIG[issue.status as keyof typeof STATUS_CONFIG].labelKey) : issue.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        issue.priority === 'HIGHEST' || issue.priority === 'HIGH'
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                          : issue.priority === 'MEDIUM'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
