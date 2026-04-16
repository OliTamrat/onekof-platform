import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types (match /api/notifications response) ─── */
interface NotificationUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

interface NotificationTask {
  id: string;
  key: string;
  title: string;
  project: { id: string; key: string; name: string; color: string | null };
}

interface Notification {
  id: string;
  action: string;
  activityType: string;
  entityType: string;
  entityId: string;
  aiSummary: string | null;
  impactScore: number;
  createdAt: string;
  user: NotificationUser;
  task: NotificationTask | null;
}

/* ─── Action → icon + color + readable verb ─── */
const ACTION_STYLE: Record<string, { icon: string; color: string; bg: string; verb: string }> = {
  CREATED:    { icon: 'plus-circle',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  verb: 'created' },
  UPDATED:    { icon: 'pencil',       color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', verb: 'updated' },
  COMPLETED:  { icon: 'check-circle', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', verb: 'completed' },
  COMMENTED:  { icon: 'comment',      color: '#1C8C7D', bg: 'rgba(28,140,125,0.12)', verb: 'commented on' },
  ASSIGNED:   { icon: 'user-plus',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', verb: 'assigned' },
  UNASSIGNED: { icon: 'user-times',   color: '#F97316', bg: 'rgba(249,115,22,0.12)', verb: 'unassigned' },
  DELETED:    { icon: 'trash',        color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  verb: 'deleted' },
  WATCHED:    { icon: 'eye',          color: '#6366F1', bg: 'rgba(99,102,241,0.12)', verb: 'started watching' },
  MOVED:      { icon: 'arrows',       color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  verb: 'moved' },
  STATUS_CHANGED: { icon: 'exchange', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', verb: 'changed status of' },
};

/* ─── Relative time ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ─── Grouping by relative day ─── */
function groupKey(dateStr: string): 'Today' | 'Yesterday' | 'This week' | 'Older' {
  const now = new Date();
  const then = new Date(dateStr);
  const msPerDay = 86400000;
  const sameDay = now.toDateString() === then.toDateString();
  if (sameDay) return 'Today';
  const diffDays = Math.floor((now.getTime() - then.getTime()) / msPerDay);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This week';
  return 'Older';
}

type GroupedItem =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'notif'; key: string; notif: Notification };

export default function NotificationsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mentions' | 'assigned' | 'watching'>('all');

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiFetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications').catch(
        () => ({ notifications: [], unreadCount: 0 }),
      ),
  });

  const notifications = data?.notifications || [];

  const filtered = useMemo(() => {
    if (filter === 'assigned') return notifications.filter((n) => n.action === 'ASSIGNED');
    if (filter === 'mentions') return notifications.filter((n) => n.action === 'COMMENTED');
    if (filter === 'watching') return notifications;  // everything is already watched-only server-side
    return notifications;
  }, [notifications, filter]);

  // Build grouped list: [header, notif, notif, header, notif, ...]
  const grouped = useMemo<GroupedItem[]>(() => {
    const out: GroupedItem[] = [];
    let lastGroup: string | null = null;
    for (const n of filtered) {
      const g = groupKey(n.createdAt);
      if (g !== lastGroup) {
        out.push({ kind: 'header', key: `hdr-${g}`, label: g });
        lastGroup = g;
      }
      out.push({ kind: 'notif', key: n.id, notif: n });
    }
    return out;
  }, [filtered]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = (n: Notification) => {
    if (n.task?.id) router.push(`/issue/${n.task.id}`);
  };

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'assigned',  label: 'Assigned' },
    { key: 'mentions',  label: 'Comments' },
    { key: 'watching',  label: 'Watching' },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Notifications</Text>
          <Text style={s.headerSub}>
            {notifications.length} {notifications.length === 1 ? 'update' : 'updates'}
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={s.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = f.key === 'all'
            ? notifications.length
            : f.key === 'assigned' ? notifications.filter((n) => n.action === 'ASSIGNED').length
            : f.key === 'mentions' ? notifications.filter((n) => n.action === 'COMMENTED').length
            : notifications.length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[s.filterChip, active && s.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[s.filterBadge, active && s.filterBadgeActive]}>
                  <Text style={[s.filterBadgeText, active && s.filterBadgeTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.key}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return <Text style={s.groupHeader}>{item.label}</Text>;
          }
          const n = item.notif;
          const style = ACTION_STYLE[n.action] || ACTION_STYLE.UPDATED;

          return (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.7}
              onPress={() => handlePress(n)}
              disabled={!n.task}
            >
              {/* Avatar + action badge column */}
              <View style={s.avatarCol}>
                <Avatar name={n.user.name || n.user.email || 'U'} size={38} />
                <View style={[s.actionBadgeOverlay, { backgroundColor: style.bg, borderColor: Colors.bg }]}>
                  <FontAwesome name={style.icon as any} size={9} color={style.color} />
                </View>
              </View>

              {/* Content */}
              <View style={s.cardBody}>
                <Text style={s.cardText} numberOfLines={2}>
                  <Text style={s.userName}>{n.user.name || n.user.email}</Text>
                  <Text style={s.verb}> {style.verb} </Text>
                  {n.task && (
                    <>
                      <Text style={s.taskKey}>{n.task.key}</Text>
                      <Text style={s.verb}> · </Text>
                      <Text style={s.taskTitle}>{n.task.title}</Text>
                    </>
                  )}
                </Text>

                {n.aiSummary && (
                  <Text style={s.aiSummary} numberOfLines={2}>{n.aiSummary}</Text>
                )}

                <View style={s.cardFooter}>
                  {n.task?.project && (
                    <View style={[s.projectTag, { backgroundColor: (n.task.project.color || '#3B82F6') + '20' }]}>
                      <View style={[s.projectDot, { backgroundColor: n.task.project.color || '#3B82F6' }]} />
                      <Text style={[s.projectTagText, { color: n.task.project.color || '#3B82F6' }]}>
                        {n.task.project.key}
                      </Text>
                    </View>
                  )}
                  <Text style={s.timeText}>{timeAgo(n.createdAt)}</Text>
                </View>
              </View>

              {n.task && <FontAwesome name="chevron-right" size={11} color={Colors.textFaint} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <FontAwesome name="bell-slash-o" size={32} color={Colors.textFaint} />
            </View>
            <Text style={s.emptyTitle}>You're all caught up</Text>
            <Text style={s.emptyDesc}>
              {filter === 'all'
                ? 'Updates on tasks you watch, are assigned, or report will appear here.'
                : `No ${filter} notifications right now.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  headerSub: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },

  /* Filter chips */
  filterRow: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  filterBadge: {
    minWidth: 16, height: 16, borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },
  filterBadgeTextActive: { color: '#fff' },

  /* List */
  list: { padding: Spacing.lg, paddingBottom: 120 },
  groupHeader: {
    fontSize: 11, fontWeight: '700', color: Colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 1,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },

  /* Card */
  card: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatarCol: { position: 'relative' },
  actionBadgeOverlay: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardText: { fontSize: FontSize.sm, lineHeight: 20, color: Colors.textSecondary },
  userName: { fontWeight: '600', color: Colors.textWhite },
  verb: { color: Colors.textSecondary },
  taskKey: { fontFamily: 'Courier', fontWeight: '700', color: Colors.primaryLight },
  taskTitle: { color: Colors.textPrimary },
  aiSummary: {
    fontSize: FontSize.xs, color: Colors.textFaint, fontStyle: 'italic',
    lineHeight: 16, marginTop: 2,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
  projectTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  projectDot: { width: 5, height: 5, borderRadius: 3 },
  projectTagText: { fontSize: 9, fontWeight: '700' },
  timeText: { fontSize: 10, color: Colors.textFaint },

  /* Empty */
  empty: {
    alignItems: 'center', paddingVertical: Spacing['5xl'],
    paddingHorizontal: Spacing['3xl'], gap: Spacing.md,
  },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: {
    fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center', lineHeight: 18,
    maxWidth: 260,
  },
});
