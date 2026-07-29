'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

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
  entity?: {
    id: string;
    key: string;
    title: string;
    project: { id: string; key: string; name: string; color: string };
  } | null;
}

/**
 * What actually changed, from data the API has been returning all along.
 *
 * The card showed `aiSummary` and nothing else, and `aiSummary` is always
 * null: there are two activity loggers in this codebase, and the one the
 * issue routes call (lib/activity-logger) writes only `metadata` — never
 * `before`, `after`, `aiSummary` or `impactScore`. The richer ActivityLogger
 * class in packages/database populates those, and nothing routes through it.
 *
 * Meanwhile every field edit records `metadata: { field, from, to }`, the API
 * returns it, and the Activity interface below declares it. It was simply
 * never read. So "it doesn't show what was edited" was a missing render, not
 * missing data.
 */
export function activityHref(
  activity: Pick<Activity, 'entityType' | 'entityId' | 'entity'>,
  scopedToOneEntity: boolean
): string | null {
  // Scoped timeline: the reader is already looking at this entity.
  if (scopedToOneEntity) return null;

  if (activity.entityType === 'TASK') {
    // Without the enriched entity there is no project to land in, and the
    // issues page would open on some other project's board.
    if (!activity.entity) return null;
    const projectId = activity.entity.project?.id;
    return projectId
      ? `/dashboard/issues?projectId=${projectId}&taskId=${activity.entityId}`
      : `/dashboard/issues?taskId=${activity.entityId}`;
  }

  if (activity.entityType === 'PROJECT') {
    return `/dashboard?projectId=${activity.entityId}`;
  }

  // GOAL, TEAM, BUDGET, EXPENSE, DOCUMENT, SPRINT: no destination exists yet.
  // Returning null makes that visible as a non-interactive card rather than
  // as a click that quietly fails.
  return null;
}

export interface ChangeDescription {
  /** What changed — "status", "sprint", "classification", "comment". */
  field: string;
  from?: string;
  to?: string;
  /** Free text rather than a transition — a comment body. */
  text?: string;
}

/**
 * The first version of this required `metadata.field` and rendered nothing
 * without it. That covered **two** of the seven shapes the routes actually
 * write, so most of the feed still said only "X updated" with the substance
 * withheld — including comments, which is what the founder reported.
 *
 * The shapes, from the logTaskActivity call sites:
 *
 *   COMMENTED          { commentId, preview }              no `field`
 *   UPDATED status     { field: 'status', from, to }       has `field`
 *   UPDATED priority   { field: 'priority', from, to }     has `field`
 *   ASSIGNED           { assigneeId }                      no transition
 *   SPRINT_CHANGED     { from, to }                        no `field`
 *   SPRINT bulk        { from, to, bulk }                  no `field`
 *   DEPARTMENT_CHANGED { from: {…}, to: {…} }              nested objects
 *
 * I built against the first shape I read and wrote the tests from the same
 * assumption, so they passed while five shapes rendered blank. Enumerating
 * the call sites is what should have come first.
 */
export function describeChange(
  activity: Pick<Activity, 'action' | 'metadata'>
): ChangeDescription | null {
  const m = activity.metadata;
  if (!m || typeof m !== 'object') return null;

  const fmt = (v: unknown): string | undefined => {
    if (v === null) return 'none';
    if (v === undefined) return undefined;
    if (typeof v === 'string') return v.replace(/_/g, ' ').toLowerCase();
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return undefined;
  };

  // A comment carries its own text, not a transition.
  if (typeof m.preview === 'string' && m.preview.trim().length > 0) {
    return { field: 'comment', text: m.preview };
  }

  // Classification records nested {department, workstream} objects.
  if (m.from && typeof m.from === 'object') {
    const pair = (o: any) =>
      [o?.department, o?.workstream].filter(Boolean).join(' / ') || 'none';
    return { field: 'classification', from: pair(m.from), to: pair(m.to) };
  }

  // A scalar transition. `field` is present on status and priority and
  // ABSENT on sprint changes, so the label falls back to the action verb
  // rather than the row rendering blank.
  if (m.from !== undefined || m.to !== undefined) {
    const label =
      typeof m.field === 'string'
        ? m.field.replace(/_/g, ' ')
        : activity.action.replace(/_CHANGED$/i, '').replace(/_/g, ' ').toLowerCase();
    return { field: label, from: fmt(m.from), to: fmt(m.to) };
  }

  return null;
}

interface ActivityTimelineProps {
  entityType?: string;
  entityId?: string;
  userId?: string;
  projectId?: string;
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
  COMMENTED: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
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

const FILTER_TAB_KEYS = [
  { key: undefined as string | undefined, labelKey: 'filter.all' },
  { key: 'TASK', labelKey: 'filter.task' },
  { key: 'PROJECT', labelKey: 'filter.project' },
  { key: 'GOAL', labelKey: 'filter.goal' },
  { key: 'COMMENT', labelKey: 'filter.comment' },
];

export function ActivityTimeline({
  entityType,
  entityId,
  userId,
  projectId,
  limit = 50,
  showFilters = true,
}: ActivityTimelineProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedEntityType, setSelectedEntityType] = useState<string | undefined>(entityType);
  const [offset, setOffset] = useState(0);

  /**
   * Where does clicking this card go — or does it go nowhere?
   *
   * This used to be implicit, and that was the bug. Every card rendered with
   * role="button", cursor-pointer and a hover highlight, while the handler
   * returned silently for anything that was not a TASK-with-entity or a
   * PROJECT. Clicking a GOAL, TEAM, BUDGET, EXPENSE or SPRINT activity did
   * nothing and said nothing.
   *
   * Worse, and the case actually reported: inside the issue slideout this
   * timeline is scoped to one task (`entityId` is set), so every card there
   * pointed at the task already open behind it. On /dashboard/issues that is
   * a push to the route you are already on — React does not remount, the URL
   * initialisers do not re-read, and nothing happens at all.
   *
   * So the destination is computed once and drives BOTH the click and the
   * styling. A card that cannot go anywhere no longer claims it can.
   */
  const drillDownHref = (activity: Activity) => activityHref(activity, Boolean(entityId));

  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', { entityType: selectedEntityType, entityId, userId, projectId, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEntityType) params.append('entityType', selectedEntityType);
      if (entityId) params.append('entityId', entityId);
      if (userId) params.append('userId', userId);
      if (projectId) params.append('projectId', projectId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/activities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const activities: Activity[] = data?.activities || [];
  const pagination = data?.pagination;

  const handleFilterChange = (type: string | undefined) => {
    setSelectedEntityType(type);
    setOffset(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-slate-500">{t('activity.loadingTimeline')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{t('activity.failedToLoad')}</span>
        </div>
        {selectedEntityType && (
          <Button
            variant="link"
            onClick={() => handleFilterChange(undefined)}
            className="flex items-center gap-1.5 text-sm text-primary-500"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('activity.showAll')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('filter.filterBy')}</span>
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_TAB_KEYS.map((tab) => (
              <Button
                key={tab.key ?? 'all'}
                variant={selectedEntityType === tab.key ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange(tab.key)}
                className="h-auto px-3 py-1.5 text-xs"
              >
                {t(tab.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
            {selectedEntityType ? (
              (() => {
                const Icon = entityTypeIcons[selectedEntityType] || Clock;
                return <Icon className="h-8 w-8 text-slate-400" />;
              })()
            ) : (
              <Clock className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {selectedEntityType
              ? t('activity.noActivity')
              : t('activity.noActivity')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px]">
            {selectedEntityType
              ? t('activity.noFilteredActivityDesc').replace('{type}', selectedEntityType.toLowerCase())
              : t('activity.activityWillAppear')}
          </p>
          {selectedEntityType && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange(undefined)}
              className="mt-3 text-xs text-primary-500 hover:bg-primary-500/5"
            >
              <ArrowLeft className="h-3 w-3" />
              {t('activity.showAll')}
            </Button>
          )}
        </div>
      ) : (
        <>
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
                const href = drillDownHref(activity);
                const change = describeChange(activity);

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

                    {/* Activity Card — interactive only when it can actually navigate */}
                    <div
                      {...(href
                        ? {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => router.push(href),
                            onKeyDown: (e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                router.push(href);
                              }
                            },
                          }
                        : {})}
                      className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-4 transition-all duration-200 ${
                        href
                          ? 'hover:shadow-md hover:border-[#1C8C7D] cursor-pointer'
                          : ''
                      }`}
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* User Avatar */}
                          {activity.user?.avatar ? (
                            <img
                              src={activity.user.avatar}
                              alt={activity.user.name || activity.user.email}
                              className="h-8 w-8 rounded-full ring-2 ring-[#1C8C7D]/20"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#1C8C7D]/20">
                              {(activity.user?.name || activity.user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* User Name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {activity.user?.name || activity.user?.email || 'Unknown'}
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
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap ml-auto">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      {/* A comment: show the text, not a transition. */}
                      {change?.text && (
                        <div className="mb-3 pl-3 border-l-2 border-[#1C8C7D]/40 text-sm text-slate-700 dark:text-slate-300 italic">
                          &ldquo;{change.text}
                          {change.text.length >= 100 ? '…' : ''}&rdquo;
                        </div>
                      )}

                      {/* What changed — from metadata.field/from/to */}
                      {change && !change.text && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{change.field}</span>
                          {change.from !== undefined && change.to !== undefined ? (
                            <>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 line-through decoration-slate-400">
                                {change.from}
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium">
                                {change.to}
                              </span>
                            </>
                          ) : change.to !== undefined ? (
                            <span className="px-1.5 py-0.5 rounded bg-[#1C8C7D]/10 text-[#1C8C7D] font-medium">
                              {change.to}
                            </span>
                          ) : null}
                        </div>
                      )}

                      {/* AI Summary */}
                      {activity.aiSummary && (
                        <div className="flex items-start gap-2 mb-3 p-3 rounded-md bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                          <Sparkles className="h-4 w-4 text-[#1C8C7D] mt-0.5 flex-shrink-0" />
                          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{activity.aiSummary}</p>
                        </div>
                      )}

                      {/* Metadata and Impact Score */}
                      <div className="flex items-center justify-between gap-2">
                        {/*
                          Entity Info — task key + title.

                          Suppressed in a scoped timeline. Inside the issue
                          slideout every row named the very issue the reader
                          had open, repeated once per activity: on
                          CUSONBANDS-6 you saw "CUSONBANDS-6 · CSO-E2: …"
                          twice under CUSONBANDS-6's own heading.

                          That is not merely redundant. A key-and-title chip
                          is the platform's standard way of pointing AT
                          something, so it reads as a link to somewhere else
                          — which is why the card looked broken when clicking
                          it did nothing. Removing the chip removes the
                          promise, rather than leaving a promise unkept.
                        */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0 flex-1">
                          {entityId ? null : activity.entity ? (
                            <>
                              {activity.entity.project && (
                                <span
                                  className="h-4 w-4 rounded flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: activity.entity.project.color || '#3B82F6' }}
                                >
                                  {activity.entity.project.key?.slice(0, 2)}
                                </span>
                              )}
                              <span className="font-mono text-[#1C8C7D] font-semibold shrink-0">{activity.entity.key}</span>
                              <span className="text-slate-400">&#183;</span>
                              <span className="truncate">{activity.entity.title}</span>
                            </>
                          ) : (
                            <span className="font-medium">
                              {activity.entityType.charAt(0) + activity.entityType.slice(1).toLowerCase()}
                            </span>
                          )}
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                {t('common.previous')}
              </Button>

              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t('common.showing')} {offset + 1} - {Math.min(offset + activities.length, pagination.total)} {t('common.of')}{' '}
                {pagination.total}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={!pagination.hasMore}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
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
