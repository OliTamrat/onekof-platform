'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  key: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string | null;
  assignee?: { id: string; name: string; avatar?: string };
  project: { id: string; name: string; key: string; color: string };
}

type Category = 'development' | 'marketing' | 'operations' | 'research' | 'knowledge' | 'general';

interface AIInsightsPanelProps {
  tasks: Task[];
  category: Category;
  title: string;
  onTaskClick?: (taskId: string) => void;
}

interface Insight {
  type: 'warning' | 'success' | 'info' | 'action';
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
  relatedTasks?: Task[];
  drillDownLabel?: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  text: string;
  relatedTasks?: Task[];
}

const INSIGHT_STYLES = {
  warning: {
    card: 'border-l-4 border-l-amber-500 border-y border-r border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-r from-amber-50/90 to-amber-50/40 dark:from-amber-950/30 dark:to-amber-950/10',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    icon: 'text-amber-600 dark:text-amber-400',
    metric: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  success: {
    card: 'border-l-4 border-l-emerald-500 border-y border-r border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-r from-emerald-50/90 to-emerald-50/40 dark:from-emerald-950/30 dark:to-emerald-950/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
    metric: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  info: {
    card: 'border-l-4 border-l-blue-500 border-y border-r border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-r from-blue-50/90 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    icon: 'text-blue-600 dark:text-blue-400',
    metric: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  action: {
    card: 'border-l-4 border-l-purple-500 border-y border-r border-purple-200/60 dark:border-purple-800/40 bg-gradient-to-r from-purple-50/90 to-purple-50/40 dark:from-purple-950/30 dark:to-purple-950/10',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    icon: 'text-purple-600 dark:text-purple-400',
    metric: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
};

const PRIORITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-blue-400',
};

const STATUS_LABEL: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

const CATEGORY_LABELS: Record<Category, string> = {
  development: 'Development',
  marketing: 'Marketing',
  operations: 'Operations',
  research: 'Research',
  knowledge: 'Knowledge',
  general: 'Project',
};

function analyzeWorkload(tasks: Task[]) {
  const assigneeMap: Record<string, { name: string; count: number; overdue: number; critical: number }> = {};
  const now = new Date();

  tasks.filter(t => t.status !== 'DONE').forEach(task => {
    const key = task.assignee?.id || 'unassigned';
    const name = task.assignee?.name || 'Unassigned';
    if (!assigneeMap[key]) assigneeMap[key] = { name, count: 0, overdue: 0, critical: 0 };
    assigneeMap[key].count++;
    if (task.dueDate && new Date(task.dueDate) < now) assigneeMap[key].overdue++;
    if (task.priority === 'CRITICAL') assigneeMap[key].critical++;
  });

  return Object.values(assigneeMap).sort((a, b) => b.count - a.count);
}

function detectBottleneck(tasks: Task[]) {
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const statusCounts: Record<string, number> = {};
  activeTasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  let bottleneck = '';
  let maxCount = 0;
  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > maxCount) { maxCount = count; bottleneck = status; }
  });

  return { status: bottleneck, count: maxCount, total: activeTasks.length };
}

function getCategoryInsights(tasks: Task[], category: Category): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const notDoneTasks = tasks.filter(t => t.status !== 'DONE');
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
  const inReviewTasks = tasks.filter(t => t.status === 'IN_REVIEW');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE');
  const highTasks = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE');
  const unassignedTasks = tasks.filter(t => !t.assignee && t.status !== 'DONE');
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const bottleneck = detectBottleneck(tasks);

  if (completionRate >= 75) {
    insights.push({
      type: 'success', icon: TrendingUp,
      title: 'Strong progress',
      description: `${completionRate}% completion rate — the team is on track to close out remaining items.`,
      metric: `${done}/${total}`,
      relatedTasks: notDoneTasks,
      drillDownLabel: `${notDoneTasks.length} remaining tasks`,
    });
  } else if (completionRate < 30 && total > 3) {
    insights.push({
      type: 'warning', icon: TrendingDown,
      title: 'Low completion rate',
      description: `Only ${completionRate}% of tasks are done. Consider reviewing scope or reallocating resources.`,
      metric: `${done}/${total}`,
      relatedTasks: notDoneTasks,
      drillDownLabel: `${notDoneTasks.length} incomplete tasks`,
    });
  }

  if (blockedTasks.length > 0) {
    insights.push({
      type: 'warning', icon: ShieldAlert,
      title: `${blockedTasks.length} blocked ${blockedTasks.length === 1 ? 'item' : 'items'}`,
      description: 'Blocked tasks halt downstream work. Review dependencies and reassign if needed.',
      metric: `${blockedTasks.length}`,
      relatedTasks: blockedTasks,
      drillDownLabel: 'View blocked tasks',
    });
  }

  if (overdueTasks.length > 0) {
    insights.push({
      type: 'warning', icon: Clock,
      title: `${overdueTasks.length} overdue ${overdueTasks.length === 1 ? 'task' : 'tasks'}`,
      description: overdueTasks.length > 3
        ? 'Multiple tasks are past due. Prioritize critical items and consider adjusting deadlines for non-critical work.'
        : 'Review overdue items and update timelines or escalate as needed.',
      metric: `${overdueTasks.length}`,
      relatedTasks: overdueTasks,
      drillDownLabel: 'View overdue tasks',
    });
  }

  if (criticalTasks.length > 0) {
    insights.push({
      type: 'action', icon: AlertTriangle,
      title: `${criticalTasks.length} critical ${criticalTasks.length === 1 ? 'task requires' : 'tasks require'} attention`,
      description: 'Critical priority items should be addressed before moving to lower-priority work.',
      metric: `${criticalTasks.length}`,
      relatedTasks: criticalTasks,
      drillDownLabel: 'View critical tasks',
    });
  }

  if (unassignedTasks.length > 0) {
    insights.push({
      type: 'info', icon: Users,
      title: `${unassignedTasks.length} unassigned ${unassignedTasks.length === 1 ? 'task' : 'tasks'}`,
      description: 'Distribute unassigned work across team members to prevent bottlenecks and ensure accountability.',
      metric: `${unassignedTasks.length}`,
      relatedTasks: unassignedTasks,
      drillDownLabel: 'View unassigned tasks',
    });
  }

  if (bottleneck.count > 3 && bottleneck.status) {
    const statusLabel = bottleneck.status.replace('_', ' ').toLowerCase();
    const bottleneckTasks = tasks.filter(t => t.status === bottleneck.status);
    insights.push({
      type: 'info', icon: BarChart3,
      title: `Bottleneck detected: ${statusLabel}`,
      description: `${bottleneck.count} of ${bottleneck.total} active tasks are in "${statusLabel}". Consider moving items forward or adding capacity.`,
      metric: `${bottleneck.count}`,
      relatedTasks: bottleneckTasks,
      drillDownLabel: `View ${statusLabel} tasks`,
    });
  }

  // Category-specific insights
  switch (category) {
    case 'development':
      if (inReviewTasks.length > 2) {
        insights.push({
          type: 'action', icon: Zap,
          title: 'Code review queue growing',
          description: `${inReviewTasks.length} items awaiting review. Schedule a review session to unblock the pipeline and keep velocity up.`,
          metric: `${inReviewTasks.length}`,
          relatedTasks: inReviewTasks,
          drillDownLabel: 'View review queue',
        });
      }
      if (inProgressTasks.length > 5) {
        insights.push({
          type: 'info', icon: Target,
          title: 'High WIP count',
          description: `${inProgressTasks.length} items in progress simultaneously. Consider limiting work-in-progress to improve focus and throughput.`,
          metric: `${inProgressTasks.length}`,
          relatedTasks: inProgressTasks,
          drillDownLabel: 'View in-progress items',
        });
      }
      break;

    case 'marketing':
      {
        const dueSoonTasks = tasks.filter(t => {
          if (!t.dueDate || t.status === 'DONE') return false;
          const days = (new Date(t.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return days >= 0 && days <= 7;
        });
        if (dueSoonTasks.length > 0) {
          insights.push({
            type: 'action', icon: Clock,
            title: `${dueSoonTasks.length} items due this week`,
            description: 'Upcoming deadlines for campaigns or content. Ensure assets are ready and approvals are in place.',
            metric: `${dueSoonTasks.length}`,
            relatedTasks: dueSoonTasks,
            drillDownLabel: 'View upcoming items',
          });
        }
        if (highTasks.length + criticalTasks.length > total * 0.4 && total > 3) {
          const highPriorityTasks = [...criticalTasks, ...highTasks];
          insights.push({
            type: 'info', icon: Target,
            title: 'Heavy high-priority load',
            description: 'Over 40% of marketing tasks are high or critical priority. Consider staggering launches to manage quality.',
            relatedTasks: highPriorityTasks,
            drillDownLabel: 'View high-priority tasks',
          });
        }
      }
      break;

    case 'operations':
      if (criticalTasks.length > 0 && blockedTasks.length > 0) {
        const criticalBlocked = tasks.filter(t => t.priority === 'CRITICAL' && t.status === 'BLOCKED');
        insights.push({
          type: 'warning', icon: ShieldAlert,
          title: 'Critical incidents blocked',
          description: 'Critical operational items are blocked. This may indicate a dependency on external teams or resources that needs escalation.',
          relatedTasks: criticalBlocked.length > 0 ? criticalBlocked : blockedTasks,
          drillDownLabel: 'View blocked items',
        });
      }
      {
        const resolvedRate = total > 0 ? Math.round((done / total) * 100) : 0;
        if (resolvedRate > 60) {
          insights.push({
            type: 'success', icon: CheckCircle2,
            title: `${resolvedRate}% resolution rate`,
            description: 'Most operational items are resolved. Continue monitoring for recurring patterns.',
            metric: `${resolvedRate}%`,
            relatedTasks: doneTasks,
            drillDownLabel: 'View resolved items',
          });
        }
      }
      break;

    case 'research':
      if (total > 0 && done === 0) {
        insights.push({
          type: 'info', icon: Lightbulb,
          title: 'Research in early stages',
          description: 'No items completed yet. Focus on defining clear deliverables and milestones to track progress effectively.',
          relatedTasks: notDoneTasks,
          drillDownLabel: 'View all research items',
        });
      }
      {
        const pendingKickoff = tasks.filter(t => t.status === 'TODO' && t.priority !== 'LOW');
        if (pendingKickoff.length > 3) {
          insights.push({
            type: 'action', icon: Target,
            title: `${pendingKickoff.length} items pending kickoff`,
            description: 'Multiple research items are waiting to start. Prioritize by impact and resource availability.',
            metric: `${pendingKickoff.length}`,
            relatedTasks: pendingKickoff,
            drillDownLabel: 'View pending items',
          });
        }
      }
      break;
  }

  return insights.slice(0, 6);
}

function getRecommendations(tasks: Task[], category: Category): Recommendation[] {
  const recs: Recommendation[] = [];
  const now = new Date();
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE');
  const unassignedTasks = tasks.filter(t => !t.assignee && t.status !== 'DONE');
  const inReviewTasks = tasks.filter(t => t.status === 'IN_REVIEW');
  const workload = analyzeWorkload(tasks);
  const overloaded = workload.filter(w => w.count > 5);

  if (criticalTasks.length > 0) {
    recs.push({ priority: 'high', text: `Address ${criticalTasks.length} critical-priority ${criticalTasks.length === 1 ? 'item' : 'items'} before moving to lower-priority work`, relatedTasks: criticalTasks });
  }
  if (blockedTasks.length > 0) {
    recs.push({ priority: 'high', text: `Unblock ${blockedTasks.length} ${blockedTasks.length === 1 ? 'task' : 'tasks'} — review dependencies and escalate where needed`, relatedTasks: blockedTasks });
  }
  if (overdueTasks.length > 2) {
    recs.push({ priority: 'high', text: `Triage ${overdueTasks.length} overdue items — close, reschedule, or escalate each one`, relatedTasks: overdueTasks });
  }
  if (inReviewTasks.length > 3) {
    recs.push({ priority: 'medium', text: `Clear the review queue (${inReviewTasks.length} items waiting) to maintain delivery flow`, relatedTasks: inReviewTasks });
  }
  if (unassignedTasks.length > 0) {
    recs.push({ priority: 'medium', text: `Assign ${unassignedTasks.length} unowned ${unassignedTasks.length === 1 ? 'task' : 'tasks'} to prevent them from falling through the cracks`, relatedTasks: unassignedTasks });
  }
  if (overloaded.length > 0) {
    recs.push({ priority: 'medium', text: `Redistribute work — ${overloaded.map(w => w.name).join(', ')} ${overloaded.length === 1 ? 'has' : 'have'} 5+ active tasks` });
  }

  if (category === 'development' && inReviewTasks.length > 2) {
    recs.push({ priority: 'medium', text: 'Schedule a focused code review session to clear the review backlog', relatedTasks: inReviewTasks });
  }
  if (category === 'operations' && criticalTasks.length > 0) {
    recs.push({ priority: 'high', text: 'Ensure incident response runbooks are up to date for critical items', relatedTasks: criticalTasks });
  }
  if (category === 'research' && unassignedTasks.length > 0) {
    recs.push({ priority: 'medium', text: 'Assign research owners early to maintain data collection timelines', relatedTasks: unassignedTasks });
  }
  if (category === 'marketing') {
    const dueSoonTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) > now && (new Date(t.dueDate).getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000 && t.status !== 'DONE');
    if (dueSoonTasks.length > 0) {
      recs.push({ priority: 'high', text: `Finalize ${dueSoonTasks.length} items due this week — ensure creative assets and approvals are ready`, relatedTasks: dueSoonTasks });
    }
  }

  return recs.slice(0, 5);
}

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
};

function TaskDrillDown({ tasks, maxShow = 5, onTaskClick }: { tasks: Task[]; maxShow?: number; onTaskClick?: (taskId: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? tasks : tasks.slice(0, maxShow);
  const remaining = tasks.length - maxShow;

  return (
    <div className="mt-2.5 space-y-1">
      {displayed.map(task => (
        <button
          key={task.id}
          type="button"
          onClick={() => onTaskClick?.(task.id)}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-md bg-white/70 dark:bg-[#1B1F23]/70 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1.5 group text-left transition-colors',
            onTaskClick && 'cursor-pointer hover:bg-primary-50/60 dark:hover:bg-primary-900/10 hover:border-primary-300 dark:hover:border-primary-700'
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
          <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 shrink-0 w-14 truncate">{task.key}</span>
          <span className={cn('text-xs text-slate-800 dark:text-slate-200 truncate flex-1', onTaskClick && 'group-hover:text-primary-600 dark:group-hover:text-primary-400')}>{task.title}</span>
          <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 shrink-0">{STATUS_LABEL[task.status] || task.status}</span>
          {task.assignee ? (
            <div className="h-4.5 w-4.5 rounded-full bg-primary-500 flex items-center justify-center text-[8px] text-white font-medium shrink-0" title={task.assignee.name}>
              {task.assignee.name.charAt(0)}
            </div>
          ) : (
            <span title="Unassigned"><UserCircle className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" /></span>
          )}
        </button>
      ))}
      {!showAll && remaining > 0 && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(true)}
          className="h-auto text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-1"
        >
          + {remaining} more {remaining === 1 ? 'task' : 'tasks'}
        </Button>
      )}
      {showAll && tasks.length > maxShow && (
        <Button
          variant="ghost"
          onClick={() => setShowAll(false)}
          className="h-auto text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-3 py-1"
        >
          Show less
        </Button>
      )}
    </div>
  );
}

function InsightCard({ insight, onTaskClick }: { insight: Insight; onTaskClick?: (taskId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const styles = INSIGHT_STYLES[insight.type];
  const InsightIcon = insight.icon;
  const hasDetails = insight.relatedTasks && insight.relatedTasks.length > 0;

  return (
    <div className={cn('rounded-lg overflow-hidden transition-all', styles.card)}>
      <Button
        variant="ghost"
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn('w-full h-auto whitespace-normal text-left p-3.5 flex items-start gap-3 rounded-none', hasDetails && 'cursor-pointer')}
      >
        <div className={cn('rounded-lg p-1.5 shrink-0', styles.iconBg)}>
          <InsightIcon className={cn('h-4 w-4', styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{insight.title}</p>
            {insight.metric && (
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md border', styles.metric)}>
                {insight.metric}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
          {hasDetails && !expanded && (
            <p className="text-[11px] font-medium text-primary-600 dark:text-primary-400 mt-1.5 flex items-center gap-1">
              {insight.drillDownLabel || 'View details'}
              <ChevronDown className="h-3 w-3" />
            </p>
          )}
        </div>
      </Button>
      {expanded && insight.relatedTasks && (
        <div className="px-3.5 pb-3.5 border-t border-slate-200/40 dark:border-slate-700/40 pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Affected Tasks ({insight.relatedTasks.length})
            </span>
            <Button
              variant="ghost"
              onClick={() => setExpanded(false)}
              className="h-auto px-1 py-0.5 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5"
            >
              Collapse <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
          <TaskDrillDown tasks={insight.relatedTasks} onTaskClick={onTaskClick} />
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, onTaskClick }: { rec: Recommendation; onTaskClick?: (taskId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = rec.relatedTasks && rec.relatedTasks.length > 0;

  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn('flex h-auto w-full whitespace-normal items-start gap-2.5 p-3 rounded-none text-left', hasDetails && 'cursor-pointer')}
      >
        <ArrowRight className="h-3.5 w-3.5 text-primary-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec.text}</p>
          {hasDetails && !expanded && (
            <p className="text-[10px] font-medium text-primary-600 dark:text-primary-400 mt-1 flex items-center gap-0.5">
              View {rec.relatedTasks!.length} {rec.relatedTasks!.length === 1 ? 'task' : 'tasks'}
              <ChevronDown className="h-2.5 w-2.5" />
            </p>
          )}
        </div>
        <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0', PRIORITY_BADGE[rec.priority])}>
          {rec.priority}
        </span>
      </Button>
      {expanded && rec.relatedTasks && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <TaskDrillDown tasks={rec.relatedTasks} maxShow={3} onTaskClick={onTaskClick} />
          <Button
            variant="ghost"
            onClick={() => setExpanded(false)}
            className="h-auto text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5 mt-1.5 px-3 py-0.5"
          >
            Collapse <ChevronUp className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function AIInsightsPanel({ tasks, category, title, onTaskClick }: AIInsightsPanelProps) {
  const insights = useMemo(() => getCategoryInsights(tasks, category), [tasks, category]);
  const recommendations = useMemo(() => getRecommendations(tasks, category), [tasks, category]);
  const workload = useMemo(() => analyzeWorkload(tasks), [tasks]);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const active = total - done;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const overdueCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length;
  const criticalCount = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length;

  if (total === 0) {
    return (
      <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-50/50 dark:from-[#22272B] dark:to-[#1B1F23] px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-1.5">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insights</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create tasks to see AI-powered analysis and recommendations for your {CATEGORY_LABELS[category].toLowerCase()} workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 dark:from-[#22272B] dark:via-[#1B1F23] dark:to-[#22272B]/50 px-4 py-5 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-1.5 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          AI Insights — {CATEGORY_LABELS[category]}
        </h3>
        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
          {total} items analyzed
        </span>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress</span>
            <div className="rounded-md bg-slate-100 dark:bg-slate-700 p-1">
              <BarChart3 className="h-3 w-3 text-slate-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completionRate}%</p>
          <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', completionRate >= 70 ? 'bg-emerald-500' : completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</span>
            <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-1">
              <TrendingUp className="h-3 w-3 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{active}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{done} completed</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overdue</span>
            <div className={cn('rounded-md p-1', overdueCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700')}>
              <Clock className={cn('h-3 w-3', overdueCount > 0 ? 'text-amber-500' : 'text-slate-400')} />
            </div>
          </div>
          <p className={cn('text-2xl font-bold', overdueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white')}>
            {overdueCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">need attention</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical</span>
            <div className={cn('rounded-md p-1', criticalCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-700')}>
              <AlertTriangle className={cn('h-3 w-3', criticalCount > 0 ? 'text-red-500' : 'text-slate-400')} />
            </div>
          </div>
          <p className={cn('text-2xl font-bold', criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white')}>
            {criticalCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">high urgency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Analysis column */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary-500" />
            Analysis
          </h4>
          <div className="space-y-2.5">
            {insights.length > 0 ? insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} onTaskClick={onTaskClick} />
            )) : (
              <div className={cn('rounded-lg overflow-hidden', INSIGHT_STYLES.success.card)}>
                <div className="p-3.5 flex items-center gap-3">
                  <div className={cn('rounded-lg p-1.5', INSIGHT_STYLES.success.iconBg)}>
                    <CheckCircle2 className={cn('h-4 w-4', INSIGHT_STYLES.success.icon)} />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">All clear — no issues detected in your {CATEGORY_LABELS[category].toLowerCase()} tasks.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations + Workload column */}
        <div className="space-y-5">
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary-500" />
                Recommendations
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} onTaskClick={onTaskClick} />
                ))}
              </div>
            </div>
          )}

          {workload.length > 0 && workload[0].name !== 'Unassigned' && (
            <div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary-500" />
                Team Workload
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-3.5 shadow-sm">
                <div className="space-y-3">
                  {workload.slice(0, 5).map((member, i) => {
                    const maxTasks = workload[0].count;
                    const pct = maxTasks > 0 ? Math.round((member.count / maxTasks) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-[11px] text-white font-semibold shrink-0 shadow-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{member.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-500">{member.count} tasks</span>
                              {member.overdue > 0 && (
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">{member.overdue} late</span>
                              )}
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', member.count > 5 ? 'bg-amber-500' : 'bg-primary-500')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
