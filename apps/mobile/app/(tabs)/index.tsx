import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/auth-context';
import { useLanguage } from '../../src/contexts/language-context';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type TaskStatus, type TaskPriority, type TaskType,
} from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Circle } from 'react-native-svg';

/* ─── Helpers ─── */
function getGreetingKey(): string {
  const h = new Date().getHours();
  if (h < 12) return 'dashboard.greeting.morning';
  if (h < 17) return 'dashboard.greeting.afternoon';
  return 'dashboard.greeting.evening';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Types ─── */
interface ActivityEntity {
  id: string;
  key: string;
  title: string;
  project?: { id: string; key: string; name: string; color?: string | null } | null;
}

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  aiSummary?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  user?: { id?: string; name?: string | null; email?: string; avatar?: string | null };
  entity?: ActivityEntity | null;
}

/* ─── Activity filter tabs ─── */
const ACTIVITY_FILTERS: { key: string | undefined; label: string }[] = [
  { key: undefined, label: 'All' },
  { key: 'TASK', label: 'Task' },
  { key: 'PROJECT', label: 'Project' },
  { key: 'GOAL', label: 'Goal' },
  { key: 'COMMENT', label: 'Comment' },
];

/* ─── Entity icon map (FontAwesome 4 names) ─── */
const ENTITY_ICON: Record<string, string> = {
  TASK: 'file-text-o',
  PROJECT: 'folder-open-o',
  GOAL: 'bullseye',
  COMMENT: 'comment-o',
  WATCHER: 'eye',
  TEAM: 'users',
};

/* ─── Action badge styling ─── */
const ACTION_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  CREATED: { icon: 'check-circle', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  UPDATED: { icon: 'pencil', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  DELETED: { icon: 'trash', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  COMPLETED: { icon: 'check-circle', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  ASSIGNED: { icon: 'user-plus', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  COMMENTED: { icon: 'comment', color: '#1C8C7D', bg: 'rgba(28,140,125,0.12)' },
  WATCHED: { icon: 'eye', color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  UNASSIGNED: { icon: 'user-times', color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  MOVED: { icon: 'arrows', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
};

interface Project {
  id: string;
  name: string;
  key: string;
  color?: string;
  isFavorite?: boolean;
}

/* ─── Donut Chart Component ─── */
function DonutChart({ segments, size = 140, strokeWidth = 18 }: {
  segments: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none"
      />
      {total > 0 && segments.map((seg, i) => {
        const segLen = (seg.value / total) * circumference;
        const dashOffset = -offset;
        offset += segLen;
        if (seg.value === 0) return null;
        return (
          <Circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            stroke={seg.color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${segLen} ${circumference - segLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90} origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
}

/* ─── Priority Bar ─── */
function PriorityBar({ label, count, max, color }: {
  label: string; count: number; max: number; color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <View style={s.priorityRow}>
      <View style={s.priorityLabelRow}>
        <View style={[s.priorityDot, { backgroundColor: color }]} />
        <Text style={s.priorityLabel}>{label}</Text>
        <Text style={s.priorityCount}>{count}</Text>
      </View>
      <View style={s.priorityTrack}>
        <View style={[s.priorityFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

/* ════════════════════════════════════════════
   DASHBOARD SCREEN
   ════════════════════════════════════════════ */
export default function DashboardScreen() {
  const { user, currentOrg } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string | undefined>(undefined);
  const [activityPage, setActivityPage] = useState(0);
  const ACTIVITIES_PER_PAGE = 4;

  /* ── Data Queries ── */

  // Fetch ALL issues (same as web) to compute real stats
  const { data: issueData, refetch: r1 } = useQuery({
    queryKey: ['all-issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues')
      .catch(() => ({ issues: [] })),
    enabled: !!currentOrg,
  });

  // Fetch projects
  const { data: projectData, refetch: r2 } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects')
      .catch(() => ({ projects: [] })),
    enabled: !!currentOrg,
  });

  // Fetch unread notification count for bell badge
  const { data: notifData } = useQuery({
    queryKey: ['notif-badge'],
    queryFn: () => apiFetch<{ unreadCount: number }>('/api/notifications?limit=1')
      .catch(() => ({ unreadCount: 0 })),
    enabled: !!currentOrg,
    staleTime: 60 * 1000,
  });
  const unreadCount = notifData?.unreadCount || 0;

  // Fetch activity (uses /api/activities — enriched with entity.key, entity.title, entity.project)
  const { data: activityData, refetch: r3 } = useQuery({
    queryKey: ['recent-activity', activityFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '20' });
      if (activityFilter) params.append('entityType', activityFilter);
      return apiFetch<{ activities: Activity[] }>(`/api/activities?${params.toString()}`)
        .catch(() => ({ activities: [] }));
    },
    enabled: !!currentOrg,
  });

  const issues = issueData?.issues || [];
  const projects = projectData?.projects || [];
  const activities = activityData?.activities || [];

  /* ── Computed Stats (matching web dashboard logic) ── */
  const computed = useMemo(() => {
    const completed = issues.filter(i => i.status === 'DONE').length;
    const inProgress = issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'IN_REVIEW').length;
    const todo = issues.filter(i => i.status === 'TODO' || i.status === 'BACKLOG').length;
    const overdue = issues.filter(i =>
      i.dueDate && new Date(i.dueDate) < new Date() && i.status !== 'DONE'
    ).length;

    const statusCounts = {
      TODO: issues.filter(i => i.status === 'TODO').length,
      IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
      IN_REVIEW: issues.filter(i => i.status === 'IN_REVIEW').length,
      DONE: issues.filter(i => i.status === 'DONE').length,
      BACKLOG: issues.filter(i => i.status === 'BACKLOG').length,
    };

    const priorityCounts = {
      HIGHEST: issues.filter(i => i.priority === 'HIGHEST').length,
      HIGH: issues.filter(i => i.priority === 'HIGH').length,
      MEDIUM: issues.filter(i => i.priority === 'MEDIUM').length,
      LOW: issues.filter(i => i.priority === 'LOW').length,
      LOWEST: issues.filter(i => i.priority === 'LOWEST').length,
    };

    const typeCounts = {
      TASK: issues.filter(i => i.type === 'TASK').length,
      STORY: issues.filter(i => i.type === 'STORY').length,
      BUG: issues.filter(i => i.type === 'BUG').length,
      EPIC: issues.filter(i => i.type === 'EPIC').length,
    };

    const myIssues = issues
      .filter(i => i.assigneeId === user?.id && i.status !== 'DONE')
      .slice(0, 5);

    return {
      completed, inProgress, todo, overdue,
      statusCounts, priorityCounts, typeCounts, myIssues,
      total: issues.length,
    };
  }, [issues, user?.id]);

  const maxPriority = Math.max(
    ...Object.values(computed.priorityCounts), 1
  );
  const completionPct = computed.total > 0
    ? Math.round((computed.completed / computed.total) * 100)
    : 0;

  /* ── Refresh ── */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([r1(), r2(), r3()]);
    setRefreshing(false);
  }, [r1, r2, r3]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  /* ── Stat cards config ── */
  const statCards = [
    { label: t('dashboard.completed'), value: computed.completed, icon: 'check-circle' as const, color: Colors.success, bg: Colors.successBg },
    { label: t('dashboard.inProgress'), value: computed.inProgress, icon: 'play-circle' as const, color: Colors.info, bg: Colors.infoBg },
    { label: t('dashboard.toDo'), value: computed.todo, icon: 'circle-o' as const, color: Colors.primaryLight, bg: 'rgba(28,140,125,0.1)' },
    { label: t('dashboard.overdue'), value: computed.overdue, icon: 'exclamation-circle' as const, color: Colors.error, bg: Colors.errorBg },
  ];

  /* ── Status legend config ── */
  const statusLegend = [
    { key: 'TODO', label: 'To Do', color: '#22C55E', count: computed.statusCounts.TODO },
    { key: 'IN_PROGRESS', label: 'In Progress', color: '#3B82F6', count: computed.statusCounts.IN_PROGRESS },
    { key: 'IN_REVIEW', label: 'In Review', color: '#F59E0B', count: computed.statusCounts.IN_REVIEW },
    { key: 'DONE', label: 'Done', color: '#10B981', count: computed.statusCounts.DONE },
    { key: 'BACKLOG', label: 'Backlog', color: '#6B7280', count: computed.statusCounts.BACKLOG },
  ];

  /* ── Quick Actions ── */
  const quickActions = [
    { label: 'New Issue', icon: 'plus' as const, color: Colors.primary, route: '/create-issue' },
    { label: 'Projects', icon: 'folder-open' as const, color: Colors.violet, route: '/(tabs)/projects' },
    { label: 'Calendar', icon: 'calendar' as const, color: Colors.warning, route: '/calendar' },
    { label: 'Teams', icon: 'users' as const, color: Colors.info, route: '/teams' },
    { label: 'Budget', icon: 'money' as const, color: Colors.success, route: '/budget' },
    { label: 'Goals', icon: 'bullseye' as const, color: '#EF4444', route: '/goals' },
  ];

  /* ── Type config for type breakdown ── */
  const typeDisplay = [
    { key: 'TASK', label: 'Task', icon: 'check-square-o' as const, color: '#3B82F6', count: computed.typeCounts.TASK },
    { key: 'STORY', label: 'Story', icon: 'bookmark' as const, color: '#22C55E', count: computed.typeCounts.STORY },
    { key: 'BUG', label: 'Bug', icon: 'bug' as const, color: '#EF4444', count: computed.typeCounts.BUG },
    { key: 'EPIC', label: 'Epic', icon: 'flash' as const, color: '#8B5CF6', count: computed.typeCounts.EPIC },
  ];
  const maxType = Math.max(...typeDisplay.map(t => t.count), 1);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={s.container}>
      {/* ════ HEADER — fills status bar + nav area ════ */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.md }]}>

        {/* Date chip — top right above avatar row */}
        <View style={s.dateChip}>
          <FontAwesome name="calendar-o" size={10} color={Colors.primaryLight} />
          <Text style={s.dateChipText}>{today}</Text>
        </View>

        {/* Main header row */}
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            {/* Org pill */}
            <View style={s.orgPill}>
              <View style={s.orgDotOuter}>
                <View style={s.orgDot} />
              </View>
              <Text style={s.orgText}>{currentOrg?.name || 'Onekof'}</Text>
            </View>

            {/* Greeting */}
            <Text style={s.greeting}>{t(getGreetingKey())}, {firstName}</Text>
            <Text style={s.subGreeting}>
              {t('dashboard.totalIssues', { count: computed.total, projects: projects.length })}
            </Text>
          </View>

          {/* Right side: bell + avatar */}
          <View style={s.headerRight}>
            {/* Bell with unread badge */}
            <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/notifications' as any)}>
              <FontAwesome name="bell-o" size={17} color={Colors.textSecondary} />
              {unreadCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar with teal ring */}
            <TouchableOpacity onPress={() => router.push('/profile' as any)}>
              <View style={s.avatarRing}>
                <Avatar name={user?.name || ''} size={36} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* ════ STATS ROW — compact single row ════ */}
        <TouchableOpacity
          style={s.statsRow}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/issues')}
        >
          {statCards.map((stat, i) => (
            <View key={stat.label} style={[s.statCell, i < statCards.length - 1 && s.statCellBorder]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* ════ QUICK ACTIONS — horizontal scroll strip ════ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickStrip} contentContainerStyle={s.quickStripContent}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={s.quickChip}
              activeOpacity={0.7}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[s.quickChipIcon, { backgroundColor: a.color + '18' }]}>
                <FontAwesome name={a.icon} size={13} color={a.color} />
              </View>
              <Text style={s.quickChipLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ════ STATUS OVERVIEW (Donut Chart) ════ */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{t('dashboard.statusOverview')}</Text>
            <Text style={s.cardSubtitle}>{t('dashboard.totalIssues', { count: computed.total, projects: projects.length })}</Text>
          </View>

          <View style={s.donutRow}>
            {/* Donut */}
            <View style={s.donutWrap}>
              <DonutChart
                size={130}
                strokeWidth={16}
                segments={statusLegend.map(sl => ({ value: sl.count, color: sl.color }))}
              />
              <View style={s.donutCenter}>
                <Text style={s.donutTotal}>{computed.total}</Text>
                <Text style={s.donutLabel}>Total</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={s.legendCol}>
              {statusLegend.map((sl) => (
                <TouchableOpacity
                  key={sl.key}
                  style={s.legendItem}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(tabs)/issues')}
                >
                  <View style={[s.legendDot, { backgroundColor: sl.color }]} />
                  <Text style={s.legendLabel}>{sl.label}</Text>
                  <Text style={s.legendCount}>{sl.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ════ PRIORITY BREAKDOWN ════ */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{t('dashboard.priorityBreakdown')}</Text>
          </View>
          <PriorityBar label="Highest" count={computed.priorityCounts.HIGHEST} max={maxPriority} color="#EF4444" />
          <PriorityBar label="High" count={computed.priorityCounts.HIGH} max={maxPriority} color="#F97316" />
          <PriorityBar label="Medium" count={computed.priorityCounts.MEDIUM} max={maxPriority} color="#F59E0B" />
          <PriorityBar label="Low" count={computed.priorityCounts.LOW} max={maxPriority} color="#3B82F6" />
          <PriorityBar label="Lowest" count={computed.priorityCounts.LOWEST} max={maxPriority} color="#6B7280" />
        </View>

        {/* ════ TYPES OF WORK ════ */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{t('dashboard.typesOfWork')}</Text>
          </View>
          {typeDisplay.map((td) => (
            <View key={td.key} style={s.typeRow}>
              <View style={[s.typeIconBox, { backgroundColor: td.color + '18' }]}>
                <FontAwesome name={td.icon} size={13} color={td.color} />
              </View>
              <Text style={s.typeLabel}>{td.label}</Text>
              <Text style={s.typeCount}>{td.count}</Text>
              <View style={s.typeTrack}>
                <View style={[s.typeFill, {
                  width: `${maxType > 0 ? (td.count / maxType) * 100 : 0}%`,
                  backgroundColor: td.color,
                }]} />
              </View>
            </View>
          ))}
        </View>

        {/* ════ MY ISSUES ════ */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>{t('dashboard.myIssues')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/issues')}>
            <Text style={s.seeAll}>{t('dashboard.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {computed.myIssues.length > 0 ? (
          <View style={s.issuesList}>
            {computed.myIssues.map((issue) => {
              const typeCfg = TYPE_CONFIG[(issue.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
              const statusCfg = STATUS_CONFIG[(issue.status || 'BACKLOG') as TaskStatus] || STATUS_CONFIG.BACKLOG;
              const priorityCfg = PRIORITY_CONFIG[(issue.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
              const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'DONE';

              return (
                <TouchableOpacity
                  key={issue.id}
                  style={s.issueCard}
                  onPress={() => router.push(`/issue/${issue.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[s.issueTypeStrip, { backgroundColor: typeCfg.color }]} />
                  <View style={s.issueBody}>
                    <View style={s.issueTopRow}>
                      {issue.project && (
                        <Text style={s.issueProjectKey}>{issue.project.key}</Text>
                      )}
                      {isOverdue && (
                        <View style={s.overdueTag}>
                          <FontAwesome name="clock-o" size={9} color={Colors.error} />
                          <Text style={s.overdueText}>Overdue</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.issueTitle} numberOfLines={1}>{issue.title}</Text>
                    <View style={s.issueMeta}>
                      <View style={[s.issueBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[s.issueBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                      </View>
                      <View style={[s.issueBadge, { backgroundColor: priorityCfg.bg }]}>
                        <Text style={[s.issueBadgeText, { color: priorityCfg.color }]}>{priorityCfg.label}</Text>
                      </View>
                    </View>
                  </View>
                  {issue.assignee && (
                    <Avatar name={issue.assignee.name || ''} size={28} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={s.emptyCard}>
            <FontAwesome name="inbox" size={24} color={Colors.textFaint} />
            <Text style={s.emptyTitle}>{t('dashboard.noIssuesAssigned')}</Text>
            <Text style={s.emptyDesc}>{t('dashboard.noIssuesAssigned')}</Text>
          </View>
        )}

        {/* ════ RECENT ACTIVITY (AI-Powered Timeline with drill-down) ════ */}
        <View style={s.activitySection}>
          <View style={s.activityHeaderRow}>
            <Text style={s.cardTitle}>{t('dashboard.recentActivity')}</Text>
            <View style={s.aiPill}>
              <FontAwesome name="magic" size={10} color={Colors.primaryLight} />
              <Text style={s.aiPillText}>AI-Powered</Text>
            </View>
          </View>
          <Text style={s.activitySubtitle}>
            Stay up to date with what's happening across your organization.
          </Text>

          {/* Filter chips */}
          <View style={s.filterRow}>
            <Text style={s.filterLabel}>Filter by:</Text>
            <View style={s.filterChips}>
              {ACTIVITY_FILTERS.map((f) => {
                const active = activityFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key ?? 'all'}
                    style={[s.filterChip, active && s.filterChipActive]}
                    activeOpacity={0.7}
                    onPress={() => { setActivityFilter(f.key); setActivityPage(0); }}
                  >
                    <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Timeline */}
          {activities.length === 0 ? (
            <View style={s.emptyInline}>
              <FontAwesome name="clock-o" size={20} color={Colors.textFaint} />
              <Text style={s.emptyTitleInline}>{t('dashboard.noActivity')}</Text>
              <Text style={s.emptyDescInline}>Activity will appear here as your team works.</Text>
            </View>
          ) : (() => {
            const totalPages = Math.max(1, Math.ceil(activities.length / ACTIVITIES_PER_PAGE));
            const currentPage = Math.min(activityPage, totalPages - 1);
            const pageStart = currentPage * ACTIVITIES_PER_PAGE;
            const pageEnd = pageStart + ACTIVITIES_PER_PAGE;
            const pagedActivities = activities.slice(pageStart, pageEnd);
            return (
            <>
            <View style={s.timeline}>
              {/* Vertical line */}
              <View style={s.timelineLine} />
              {pagedActivities.map((act, i) => {
                const entityIconName = ENTITY_ICON[act.entityType] || 'file-text-o';
                const actionStyle = ACTION_STYLE[act.action] || ACTION_STYLE.UPDATED;
                const timeLabel = timeAgo(act.createdAt);
                const canDrillDown = !!act.entity || act.entityType === 'PROJECT';

                return (
                  <TouchableOpacity
                    key={act.id}
                    style={[s.activityRow, i < pagedActivities.length - 1 && { marginBottom: Spacing.md }]}
                    activeOpacity={canDrillDown ? 0.7 : 1}
                    onPress={() => {
                      if (act.entityType === 'TASK' && act.entityId) {
                        router.push(`/issue/${act.entityId}`);
                      } else if (act.entityType === 'PROJECT' && act.entityId) {
                        router.push(`/project/${act.entityId}`);
                      } else if (act.entityType === 'GOAL') {
                        router.push('/goals' as any);
                      }
                    }}
                    disabled={!canDrillDown}
                  >
                    {/* Timeline icon dot */}
                    <View style={s.timelineDot}>
                      <FontAwesome name={entityIconName as any} size={14} color={Colors.primaryLight} />
                    </View>

                    {/* Card */}
                    <View style={s.activityCardNew}>
                      <View style={s.activityTopRow}>
                        <View style={s.activityUserBlock}>
                          <Avatar name={act.user?.name || act.user?.email || 'U'} size={32} />
                          <View style={s.activityUserText}>
                            <Text style={s.activityUser} numberOfLines={1}>
                              {act.user?.name || act.user?.email || 'Unknown'}
                            </Text>
                            <View style={[s.actionBadge, { backgroundColor: actionStyle.bg }]}>
                              <FontAwesome name={actionStyle.icon as any} size={9} color={actionStyle.color} />
                              <Text style={[s.actionBadgeText, { color: actionStyle.color }]}>
                                {act.action.toLowerCase().replace(/_/g, ' ')}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={s.activityTimeBox}>
                          <FontAwesome name="clock-o" size={9} color={Colors.textFaint} />
                          <Text style={s.activityTimeNew}>{timeLabel}</Text>
                        </View>
                      </View>

                      {/* Entity row — project badge + key + title */}
                      {act.entity ? (
                        <View style={s.entityRow}>
                          {act.entity.project && (
                            <View
                              style={[
                                s.projectSquare,
                                { backgroundColor: act.entity.project.color || '#3B82F6' },
                              ]}
                            >
                              <Text style={s.projectSquareText}>
                                {act.entity.project.key?.slice(0, 2)}
                              </Text>
                            </View>
                          )}
                          <Text style={s.entityKey}>{act.entity.key}</Text>
                          <Text style={s.entityDot}>·</Text>
                          <Text style={s.entityTitle} numberOfLines={1}>
                            {act.entity.title}
                          </Text>
                        </View>
                      ) : act.aiSummary ? (
                        <Text style={s.activitySummary} numberOfLines={2}>{act.aiSummary}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pagination controls — only show if more than one page */}
            {totalPages > 1 && (
              <View style={s.paginationRow}>
                <TouchableOpacity
                  style={[s.pageBtn, currentPage === 0 && s.pageBtnDisabled]}
                  onPress={() => setActivityPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="chevron-left" size={11} color={currentPage === 0 ? Colors.textFaint : Colors.textPrimary} />
                  <Text style={[s.pageBtnText, currentPage === 0 && s.pageBtnTextDisabled]}>Previous</Text>
                </TouchableOpacity>

                <View style={s.pageIndicator}>
                  <Text style={s.pageIndicatorText}>
                    {pageStart + 1}–{Math.min(pageEnd, activities.length)} of {activities.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[s.pageBtn, currentPage >= totalPages - 1 && s.pageBtnDisabled]}
                  onPress={() => setActivityPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  activeOpacity={0.7}
                >
                  <Text style={[s.pageBtnText, currentPage >= totalPages - 1 && s.pageBtnTextDisabled]}>Next</Text>
                  <FontAwesome name="chevron-right" size={11} color={currentPage >= totalPages - 1 ? Colors.textFaint : Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            )}
            </>
            );
          })()}
        </View>

        {/* ════ PROJECTS OVERVIEW ════ */}
        {projects.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>{t('projects.title')}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
                <Text style={s.seeAll}>{t('dashboard.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.projectsScroll}>
              {projects.slice(0, 6).map((proj) => {
                const projIssues = issues.filter(i => i.projectId === proj.id);
                const done = projIssues.filter(i => i.status === 'DONE').length;
                const pct = projIssues.length > 0 ? Math.round((done / projIssues.length) * 100) : 0;
                return (
                  <TouchableOpacity
                    key={proj.id}
                    style={s.projectCard}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/project/${proj.id}`)}
                  >
                    <View style={s.projectTop}>
                      <View style={[s.projectIcon, { backgroundColor: proj.color || '#3B82F6' }]}>
                        <Text style={s.projectIconText}>{proj.key?.slice(0, 2)}</Text>
                      </View>
                      <Text style={s.projectIssueCount}>{projIssues.length}</Text>
                    </View>
                    <Text style={s.projectName} numberOfLines={1}>{proj.name}</Text>
                    <Text style={s.projectKey}>{proj.key}</Text>
                    <View style={s.projectProgress}>
                      <View style={s.projectTrack}>
                        <View style={[s.projectFill, {
                          width: `${pct}%`,
                          backgroundColor: proj.color || '#3B82F6',
                        }]} />
                      </View>
                      <Text style={s.projectPct}>{pct}%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  /* ── Header ── */
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(43,181,162,0.10)',
    borderWidth: 1, borderColor: 'rgba(43,181,162,0.18)',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  dateChipText: { fontSize: 11, fontWeight: '600', color: Colors.primaryLight, letterSpacing: 0.3 },
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  headerLeft: { flex: 1, paddingRight: Spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.error,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: Colors.bgCard,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  avatarRing: {
    padding: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  orgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28,140,125,0.13)',
    borderWidth: 1, borderColor: 'rgba(43,181,162,0.22)',
    paddingHorizontal: 11, paddingVertical: 4,
    borderRadius: BorderRadius.full, marginBottom: 10,
  },
  orgDotOuter: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: 'rgba(43,181,162,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  orgDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primaryLight },
  orgText: { fontSize: 12, fontWeight: '600', color: Colors.primaryLight, letterSpacing: 0.4 },
  greeting: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.textWhite, letterSpacing: -0.3 },
  subGreeting: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

  /* ── Stats Row — compact single row ── */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, marginBottom: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  statCell: {
    flex: 1, alignItems: 'center',
  },
  statCellBorder: {
    borderRightWidth: 1, borderRightColor: Colors.border,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  statLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  /* ── Quick Actions — horizontal strip ── */
  quickStrip: { marginBottom: Spacing.lg },
  quickStripContent: { gap: Spacing.sm },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  quickChipIcon: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  quickChipLabel: { fontSize: 12, color: Colors.textWhite, fontWeight: '500' },

  /* ── Card (shared) ── */
  card: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  cardHeader: { marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  cardSubtitle: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },

  /* ── Donut Chart ── */
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  donutWrap: { position: 'relative', width: 130, height: 130 },
  donutCenter: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  donutTotal: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.textWhite },
  donutLabel: { fontSize: FontSize.xs, color: Colors.textFaint },
  legendCol: { flex: 1, gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  legendCount: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },

  /* ── Priority Breakdown ── */
  priorityRow: { marginBottom: Spacing.md },
  priorityLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  priorityCount: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite, minWidth: 24, textAlign: 'right' },
  priorityTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' },
  priorityFill: { height: 6, borderRadius: 3 },

  /* ── Type Breakdown ── */
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  typeIconBox: { width: 28, height: 28, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 50 },
  typeCount: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite, width: 28, textAlign: 'right' },
  typeTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' },
  typeFill: { height: 6, borderRadius: 3 },

  /* ── Section Header ── */
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  seeAll: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '500' },

  /* ── Issue Cards ── */
  issuesList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  issueCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, overflow: 'hidden',
  },
  issueTypeStrip: { width: 4, alignSelf: 'stretch' },
  issueBody: { flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.sm },
  issueTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 3 },
  issueProjectKey: {
    fontSize: 10, fontWeight: '600', color: Colors.textFaint,
    backgroundColor: Colors.bgElevated, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 4, overflow: 'hidden',
  },
  overdueTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.errorBg, paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  overdueText: { fontSize: 9, fontWeight: '600', color: Colors.error },
  issueTitle: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary, marginBottom: 4 },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  issueBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  issueBadgeText: { fontSize: 9, fontWeight: '600' },

  /* ── Activity Timeline (AI-Powered, card-based with drill-down) ── */
  activitySection: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  activityHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(28,140,125,0.08)',
    paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  aiPillText: { fontSize: 10, fontWeight: '600', color: Colors.primaryLight },
  activitySubtitle: {
    fontSize: FontSize.xs, color: Colors.textFaint,
    marginBottom: Spacing.lg, lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500',
    marginTop: 7,
  },
  filterChips: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary, borderColor: Colors.primary,
  },
  filterChipText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },

  timeline: { position: 'relative' },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 15,
    bottom: 15,
    width: 2,
    backgroundColor: 'rgba(28,140,125,0.2)',
  },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgElevated,
    borderWidth: 2, borderColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
  },
  activityCardNew: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 8,
  },
  activityTopRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm,
  },
  activityUserBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  activityUserText: { flex: 1, gap: 4 },
  activityUser: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  actionBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  activityTimeBox: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingTop: 4,
  },
  activityTimeNew: { fontSize: 10, color: Colors.textFaint },

  entityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 2,
  },
  projectSquare: {
    width: 18, height: 18, borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
  },
  projectSquareText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  entityKey: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight, fontFamily: 'Courier' },
  entityDot: { fontSize: 11, color: Colors.textFaint },
  entityTitle: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },

  activitySummary: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  emptyInline: {
    alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.sm,
  },
  emptyTitleInline: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  emptyDescInline: { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center' },

  /* ── Pagination controls ── */
  paginationRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  pageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  pageBtnDisabled: { opacity: 0.45 },
  pageBtnText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textPrimary },
  pageBtnTextDisabled: { color: Colors.textFaint },
  pageIndicator: { flex: 1, alignItems: 'center' },
  pageIndicatorText: { fontSize: FontSize.xs, color: Colors.textFaint },

  /* ── Empty ── */
  emptyCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing['3xl'],
    alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center' },

  /* ── Projects horizontal scroll ── */
  projectsScroll: { marginBottom: Spacing.lg },
  projectCard: {
    width: 160, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginRight: Spacing.sm,
  },
  projectTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  projectIcon: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  projectIconText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  projectIssueCount: { fontSize: FontSize.xs, color: Colors.textFaint },
  projectName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  projectKey: { fontSize: FontSize.xs, color: Colors.textFaint, marginBottom: Spacing.sm },
  projectProgress: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  projectTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)' },
  projectFill: { height: 4, borderRadius: 2 },
  projectPct: { fontSize: 10, fontWeight: '600', color: Colors.textFaint },
});
