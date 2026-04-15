import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/auth-context';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type TaskStatus, type TaskPriority, type TaskType,
} from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

/* ─── Helpers ─── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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
interface Activity {
  id: string;
  action: string;
  entityType: string;
  description: string;
  createdAt?: string;
  timestamp?: string;
  user?: { name: string; avatar?: string | null };
  timeAgo?: string;
}

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  /* ── Data Queries ── */

  // Fetch ALL issues (same as web) to compute real stats
  const { data: issueData, refetch: r1 } = useQuery({
    queryKey: ['all-issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues'),
    enabled: !!currentOrg,
  });

  // Fetch projects
  const { data: projectData, refetch: r2 } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects'),
    enabled: !!currentOrg,
  });

  // Fetch activity
  const { data: activityData, refetch: r3 } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => apiFetch<{ activities: Activity[] }>('/api/analytics/activity?limit=8')
      .catch(() => ({ activities: [] })),
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
    { label: 'Completed', value: computed.completed, icon: 'check-circle' as const, color: Colors.success, bg: Colors.successBg },
    { label: 'In Progress', value: computed.inProgress, icon: 'play-circle' as const, color: Colors.info, bg: Colors.infoBg },
    { label: 'To Do', value: computed.todo, icon: 'circle-o' as const, color: Colors.primaryLight, bg: 'rgba(28,140,125,0.1)' },
    { label: 'Overdue', value: computed.overdue, icon: 'exclamation-circle' as const, color: Colors.error, bg: Colors.errorBg },
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

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* ════ HEADER ════ */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.orgPill}>
            <View style={s.orgDot} />
            <Text style={s.orgText}>{currentOrg?.name || 'Onekof'}</Text>
          </View>
          <Text style={s.greeting}>{getGreeting()}, {firstName}</Text>
          <Text style={s.subGreeting}>{computed.total} total issues across {projects.length} projects</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn} onPress={() => router.push('/notifications' as any)}>
            <FontAwesome name="bell-o" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile' as any)}>
            <Avatar name={user?.name || ''} size={38} />
          </TouchableOpacity>
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
        {/* ════ STATS GRID ════ */}
        <View style={s.statsGrid}>
          {statCards.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={s.statCard}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/issues')}
            >
              <View style={[s.statIconBox, { backgroundColor: stat.bg }]}>
                <FontAwesome name={stat.icon} size={15} color={stat.color} />
              </View>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ════ QUICK ACTIONS ════ */}
        <View style={s.quickGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={s.quickItem}
              activeOpacity={0.7}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[s.quickIcon, { backgroundColor: a.color + '18' }]}>
                <FontAwesome name={a.icon} size={17} color={a.color} />
              </View>
              <Text style={s.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ════ STATUS OVERVIEW (Donut Chart) ════ */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Status Overview</Text>
            <Text style={s.cardSubtitle}>Distribution of all issues</Text>
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
            <Text style={s.cardTitle}>Priority Breakdown</Text>
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
            <Text style={s.cardTitle}>Types of Work</Text>
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
          <Text style={s.sectionTitle}>My Issues</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/issues')}>
            <Text style={s.seeAll}>See all</Text>
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
            <Text style={s.emptyTitle}>No issues assigned to you</Text>
            <Text style={s.emptyDesc}>Issues assigned to you will appear here</Text>
          </View>
        )}

        {/* ════ RECENT ACTIVITY ════ */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
            <Text style={s.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        {activities.length > 0 ? (
          <View style={s.activityCard}>
            {activities.map((act, i) => (
              <View key={act.id} style={[s.activityItem, i < activities.length - 1 && s.activityBorder]}>
                <View style={s.activityLeft}>
                  <View style={[s.activityDot, {
                    backgroundColor:
                      act.action === 'COMPLETED' ? Colors.success :
                      act.action === 'CREATED' ? Colors.info :
                      act.action === 'UPDATED' ? Colors.warning :
                      Colors.primary,
                  }]} />
                  {i < activities.length - 1 && <View style={s.activityLine} />}
                </View>
                <View style={s.activityContent}>
                  <Text style={s.activityText} numberOfLines={2}>
                    {act.user?.name && <Text style={s.activityBold}>{act.user.name} </Text>}
                    {act.description}
                  </Text>
                  <Text style={s.activityTime}>
                    {act.timeAgo || (act.timestamp ? timeAgo(act.timestamp) : act.createdAt ? timeAgo(act.createdAt) : '')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyCard}>
            <FontAwesome name="clock-o" size={24} color={Colors.textFaint} />
            <Text style={s.emptyTitle}>No recent activity</Text>
            <Text style={s.emptyDesc}>Activity from your workspace appears here</Text>
          </View>
        )}

        {/* ════ PROJECTS OVERVIEW ════ */}
        {projects.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Projects</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
                <Text style={s.seeAll}>See all</Text>
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
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerBtn: {
    width: 38, height: 38, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  orgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28,140,125,0.12)',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: BorderRadius.full, marginBottom: 6,
  },
  orgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryLight },
  orgText: { fontSize: 11, fontWeight: '600', color: Colors.primaryLight, letterSpacing: 0.5 },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  subGreeting: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

  /* ── Stats Grid ── */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  statCard: {
    width: (SCREEN_W - Spacing.lg * 2 - Spacing.sm) / 2 - 1,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
  },
  statIconBox: {
    width: 34, height: 34, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  statValue: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.textWhite },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  /* ── Quick Actions ── */
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickItem: {
    width: (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3 - 1,
    alignItems: 'center', paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickIcon: {
    width: 42, height: 42, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  quickLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

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

  /* ── Activity ── */
  activityCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg,
  },
  activityItem: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  activityLeft: { alignItems: 'center', width: 12 },
  activityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  activityLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 4 },
  activityContent: { flex: 1 },
  activityText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  activityBold: { fontWeight: '600', color: Colors.textPrimary },
  activityTime: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },

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
