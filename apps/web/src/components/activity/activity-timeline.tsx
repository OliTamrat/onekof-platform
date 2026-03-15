'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserMinus,
  Edit3,
  Trash2,
  MessageSquare,
  FileText,
  Target,
  Folder,
  Clock,
  TrendingUp,
  GitBranch,
  Eye,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  userId: string;
  activityType: string;
  entityType: string;
  entityId: string;
  action: string;
  before: any;
  after: any;
  metadata: any;
  aiSummary: string | null;
  impactScore: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

interface ActivityTimelineProps {
  entityType?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
  showFilters?: boolean;
}

const entityTypeIcons: Record<string, any> = {
  TASK: FileText,
  PROJECT: Folder,
  GOAL: Target,
  COMMENT: MessageSquare,
  WATCHER: Eye,
  TEAM: UserPlus,
};

const actionColors: Record<string, string> = {
  CREATED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  UPDATED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  DELETED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  COMPLETED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ASSIGNED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  COMMENTED: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  WATCHED: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
};

const actionIcons: Record<string, any> = {
  CREATED: CheckCircle2,
  UPDATED: Edit3,
  DELETED: Trash2,
  COMPLETED: CheckCircle2,
  ASSIGNED: UserPlus,
  COMMENTED: MessageSquare,
  WATCHED: Eye,
  UNASSIGNED: UserMinus,
  MOVED: GitBranch,
};

export function ActivityTimeline({
  entityType,
  entityId,
  userId,
  limit = 50,
  showFilters = true,
}: ActivityTimelineProps) {
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>(entityType);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', { entityType: selectedEntityType, entityId, userId, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEntityType) params.append('entityType', selectedEntityType);
      if (entityId) params.append('entityId', entityId);
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const activities: Activity[] = data?.activities || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading activity timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load activities</span>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
          <Clock className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
        <p className="text-sm text-slate-500">
          Activity will appear here as team members work on tasks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 pb-4 border-b">
          <span className="text-sm font-medium">Filter by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedEntityType(undefined)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !selectedEntityType
                  ? 'bg-[#1C8C7D] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {['TASK', 'PROJECT', 'GOAL', 'COMMENT'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedEntityType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedEntityType === type
                    ? 'bg-[#1C8C7D] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1C8C7D] via-slate-200 dark:via-slate-700 to-transparent"></div>

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const EntityIcon = entityTypeIcons[activity.entityType] || FileText;
            const ActionIcon = actionIcons[activity.action] || Edit3;
            const actionColor = actionColors[activity.action] || actionColors.UPDATED;

            return (
              <div
                key={activity.id}
                className="relative pl-12 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-[#22272B] border-2 border-[#1C8C7D] shadow-md flex items-center justify-center">
                    <EntityIcon className="h-5 w-5 text-[#1C8C7D]" />
                  </div>
                </div>

                {/* Activity Card */}
                <div className="rounded-lg border bg-white dark:bg-[#22272B] p-4 hover:shadow-md transition-all duration-200 hover:border-[#1C8C7D]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      {/* User Avatar */}
                      {activity.user.avatar ? (
                        <img
                          src={activity.user.avatar}
                          alt={activity.user.name || activity.user.email}
                          className="h-8 w-8 rounded-full ring-2 ring-[#1C8C7D]/20"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#1C8C7D]/20">
                          {(activity.user.name || activity.user.email).charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* User Name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {activity.user.name || activity.user.email}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${actionColor}`}
                          >
                            <ActionIcon className="h-3 w-3" />
                            {activity.action.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {activity.aiSummary && (
                    <div className="flex items-start gap-2 mb-3 p-3 rounded-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                      <Sparkles className="h-4 w-4 text-[#1C8C7D] mt-0.5 flex-shrink-0" />
                      <p className="text-sm leading-relaxed">{activity.aiSummary}</p>
                    </div>
                  )}

                  {/* Metadata and Impact Score */}
                  <div className="flex items-center justify-between">
                    {/* Entity Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">
                        {activity.entityType.charAt(0) + activity.entityType.slice(1).toLowerCase()}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{activity.entityId.slice(0, 8)}</span>
                    </div>

                    {/* Impact Score */}
                    {activity.impactScore > 1 && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-[#1C8C7D]" />
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(activity.impactScore, 5) }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-1 rounded-full ${
                                i < activity.impactScore / 2
                                  ? 'bg-[#1C8C7D]'
                                  : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pagination && (pagination.hasMore || offset > 0) && (
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-sm text-slate-500">
            Showing {offset + 1} - {Math.min(offset + activities.length, pagination.total)} of{' '}
            {pagination.total}
          </span>

          <button
            onClick={() => setOffset(offset + limit)}
            disabled={!pagination.hasMore}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
