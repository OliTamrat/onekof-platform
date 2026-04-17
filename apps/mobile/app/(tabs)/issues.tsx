import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  ScrollView, Dimensions, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type TaskStatus, type TaskPriority, type TaskType,
} from '../../src/types';
import { SearchBar } from '../../src/components/SearchBar';
import { Avatar } from '../../src/components/Avatar';
import { FAB } from '../../src/components/FAB';
import { CardSkeleton } from '../../src/components/SkeletonLoader';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SCREEN_W = Dimensions.get('window').width;
const COLUMN_W = SCREEN_W * 0.75;
const STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES: TaskPriority[] = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];

export default function IssuesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues'),
  });

  const issues = data?.issues || [];
  const q = search.toLowerCase().trim();

  const filtered = useMemo(() => {
    let result = issues;
    if (q) {
      result = result.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        (i.key && i.key.toLowerCase().includes(q)),
      );
    }
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (priorityFilter) result = result.filter((i) => i.priority === priorityFilter);
    return result;
  }, [issues, q, statusFilter, priorityFilter]);

  const boardColumns = useMemo(() =>
    STATUSES.map((status) => ({
      status,
      cfg: STATUS_CONFIG[status],
      issues: filtered.filter((i) => i.status === status),
    })), [filtered],
  );

  const moveMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: string; status: string }) =>
      apiFetch(`/api/issues/${issueId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    // Optimistic update — card moves immediately, even while offline
    onMutate: async ({ issueId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['issues'] });
      const prev = queryClient.getQueryData<{ issues: Issue[] }>(['issues']);
      if (prev) {
        queryClient.setQueryData(['issues'], {
          ...prev,
          issues: prev.issues.map((i) => (i.id === issueId ? { ...i, status: status as TaskStatus } : i)),
        });
      }
      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (e: Error, _vars, ctx) => {
      // "Saved offline — will sync when reconnected" is actually a success from the
      // user's perspective — the offline queue captured the change. Keep the optimistic
      // update and don't show an error alert.
      if (e.message?.includes('Saved offline')) return;
      // Real error — roll back and notify
      if (ctx?.prev) queryClient.setQueryData(['issues'], ctx.prev);
      Alert.alert('Error', e.message || 'Failed to move issue');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const clearFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setSearch('');
  };

  const hasFilters = !!statusFilter || !!priorityFilter || !!q;

  // ── List Item ──
  const renderIssueCard = useCallback(({ item }: { item: Issue }) => {
    const statusCfg = STATUS_CONFIG[(item.status || 'BACKLOG') as TaskStatus] || STATUS_CONFIG.BACKLOG;
    const priorityCfg = PRIORITY_CONFIG[(item.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
    const typeCfg = TYPE_CONFIG[(item.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'DONE';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/issue/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Top: type icon + key */}
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <FontAwesome name={typeCfg.icon as any} size={11} color={typeCfg.color} />
            {item.key && <Text style={styles.cardKey}>{item.key}</Text>}
          </View>
          {item.assignee && <Avatar name={item.assignee.name || ''} size={22} />}
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

        {/* Bottom: badges + due date */}
        <View style={styles.cardBottom}>
          <View style={[styles.chip, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.chipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: priorityCfg.bg }]}>
            <FontAwesome name={priorityCfg.icon as any} size={8} color={priorityCfg.color} />
            <Text style={[styles.chipText, { color: priorityCfg.color }]}>{priorityCfg.label}</Text>
          </View>
          {item.project && (
            <Text style={styles.cardProject}>{item.project.key}</Text>
          )}
          <View style={{ flex: 1 }} />
          {item.dueDate && (
            <View style={[styles.dueDateChip, isOverdue && styles.overdueChip]}>
              <FontAwesome name="calendar-o" size={9} color={isOverdue ? Colors.error : Colors.textFaint} />
              <Text style={[styles.dueDateText, isOverdue && { color: Colors.error }]}>
                {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  // ── Board Card ──
  const renderBoardCard = useCallback((item: Issue, columnIdx: number) => {
    const priorityCfg = PRIORITY_CONFIG[(item.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
    const typeCfg = TYPE_CONFIG[(item.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
    const prevStatus = columnIdx > 0 ? STATUSES[columnIdx - 1] : null;
    const nextStatus = columnIdx < STATUSES.length - 1 ? STATUSES[columnIdx + 1] : null;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.boardCard}
        onPress={() => router.push(`/issue/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.boardCardTop}>
          <FontAwesome name={typeCfg.icon as any} size={10} color={typeCfg.color} />
          <Text style={styles.boardCardKey}>{item.key || ''}</Text>
          <View style={{ flex: 1 }} />
          <View style={[styles.priorityDot, { backgroundColor: priorityCfg.color }]} />
        </View>
        <Text style={styles.boardCardTitle} numberOfLines={3}>{item.title}</Text>
        {item.assignee && (
          <View style={styles.boardCardAssignee}>
            <Avatar name={item.assignee.name || ''} size={18} />
            <Text style={styles.boardCardAssigneeName} numberOfLines={1}>{item.assignee.name}</Text>
          </View>
        )}
        {/* Quick move buttons */}
        <View style={styles.moveRow}>
          {prevStatus && (
            <TouchableOpacity
              style={styles.moveBtn}
              onPress={() => moveMutation.mutate({ issueId: item.id, status: prevStatus })}
              hitSlop={4}
            >
              <FontAwesome name="arrow-left" size={10} color={Colors.textFaint} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {nextStatus && (
            <TouchableOpacity
              style={styles.moveBtn}
              onPress={() => moveMutation.mutate({ issueId: item.id, status: nextStatus })}
              hitSlop={4}
            >
              <FontAwesome name="arrow-right" size={10} color={Colors.textFaint} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [router, moveMutation]);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Issues</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/search' as any)}>
            <FontAwesome name="search" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}>
            <FontAwesome name={viewMode === 'list' ? 'columns' : 'list'} size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowFilters(!showFilters)}>
            <FontAwesome name="sliders" size={15} color={hasFilters ? Colors.primaryLight : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filters ── */}
      {showFilters && (
        <View style={styles.filterSection}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search issues..." />
          <Text style={styles.filterGroupLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity
              style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
              onPress={() => setStatusFilter(null)}
            >
              <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
                onPress={() => setStatusFilter(statusFilter === s ? null : s)}
              >
                <View style={[styles.filterDot, { backgroundColor: STATUS_CONFIG[s].color }]} />
                <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
                  {STATUS_CONFIG[s].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.filterGroupLabel}>Priority</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity
              style={[styles.filterChip, !priorityFilter && styles.filterChipActive]}
              onPress={() => setPriorityFilter(null)}
            >
              <Text style={[styles.filterChipText, !priorityFilter && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.filterChip, priorityFilter === p && styles.filterChipActive]}
                onPress={() => setPriorityFilter(priorityFilter === p ? null : p)}
              >
                <View style={[styles.filterDot, { backgroundColor: PRIORITY_CONFIG[p].color }]} />
                <Text style={[styles.filterChipText, priorityFilter === p && styles.filterChipTextActive]}>
                  {PRIORITY_CONFIG[p].label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {hasFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.loadingPad}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderIssueCard}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <FontAwesome name="check-circle-o" size={36} color={Colors.textFaint} />
              <Text style={styles.emptyTitle}>{hasFilters ? 'No matching issues' : 'No issues'}</Text>
              <Text style={styles.emptyDesc}>{hasFilters ? 'Try adjusting your filters' : 'Create your first issue to get started'}</Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
        >
          {boardColumns.map((col, colIdx) => (
            <View key={col.status} style={styles.boardColumn}>
              <View style={styles.boardColHeader}>
                <View style={[styles.boardColDot, { backgroundColor: col.cfg.color }]} />
                <Text style={styles.boardColTitle}>{col.cfg.label}</Text>
                <View style={styles.boardColCount}>
                  <Text style={styles.boardColCountText}>{col.issues.length}</Text>
                </View>
              </View>
              <ScrollView
                style={styles.boardColScroll}
                contentContainerStyle={styles.boardColContent}
                showsVerticalScrollIndicator={false}
              >
                {col.issues.map((issue) => renderBoardCard(issue, colIdx))}
                {col.issues.length === 0 && (
                  <View style={styles.boardEmpty}>
                    <Text style={styles.boardEmptyText}>No issues</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

      <FAB icon="plus" onPress={() => router.push('/create-issue')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  headerActions: { flexDirection: 'row', gap: Spacing.xs },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  filterSection: {
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  filterGroupLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase', marginTop: Spacing.xs },
  chipRow: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: BorderRadius.full, backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' },
  filterChipText: { fontSize: FontSize.xs, color: Colors.textFaint, fontWeight: '500' },
  filterChipTextActive: { color: Colors.primaryLight },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  clearBtn: { alignSelf: 'flex-start', marginTop: Spacing.xs },
  clearBtnText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '500' },

  list: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 100 },
  loadingPad: { padding: Spacing.xl, gap: Spacing.md },

  card: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardKey: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint },
  cardTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, lineHeight: 20 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  chipText: { fontSize: 10, fontWeight: '600' },
  cardProject: { fontSize: 10, fontWeight: '600', color: Colors.textFaint },
  dueDateChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  overdueChip: {},
  dueDateText: { fontSize: 10, color: Colors.textFaint },

  boardContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 100 },
  boardColumn: { width: COLUMN_W, marginHorizontal: Spacing.sm },
  boardColHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  boardColDot: { width: 8, height: 8, borderRadius: 4 },
  boardColTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, flex: 1 },
  boardColCount: {
    backgroundColor: Colors.bgElevated, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  boardColCountText: { fontSize: 10, fontWeight: '600', color: Colors.textFaint },
  boardColScroll: { flex: 1 },
  boardColContent: { gap: Spacing.sm, paddingHorizontal: Spacing.xs, paddingBottom: 40 },

  boardCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.sm,
  },
  boardCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  boardCardKey: { fontSize: 10, fontWeight: '600', color: Colors.textFaint },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  boardCardTitle: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 18 },
  boardCardAssignee: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  boardCardAssigneeName: { fontSize: 10, color: Colors.textFaint, maxWidth: 100 },
  moveRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  moveBtn: {
    width: 28, height: 28, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated, justifyContent: 'center', alignItems: 'center',
  },

  boardEmpty: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  boardEmptyText: { fontSize: FontSize.xs, color: Colors.textFaint },

  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing['5xl'] },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textFaint },
});
