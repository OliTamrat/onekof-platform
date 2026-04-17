import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton } from '../../src/components';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  targetDate: string | null;
  owner?: { id?: string; name?: string; email?: string; avatar?: string | null };
}

/* ─── Status config with Nocturne colors ─── */
const STATUS_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  ACTIVE:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: 'bullseye',              label: 'Active' },
  ON_TRACK:  { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  icon: 'check-circle',          label: 'On Track' },
  AT_RISK:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'exclamation-triangle',  label: 'At Risk' },
  BEHIND:    { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   icon: 'exclamation-circle',    label: 'Behind' },
  COMPLETED: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: 'check-circle',          label: 'Completed' },
};

const FILTERS: Array<{ key: string | null; label: string }> = [
  { key: null,        label: 'All' },
  { key: 'ACTIVE',    label: 'Active' },
  { key: 'ON_TRACK',  label: 'On Track' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'AT_RISK',   label: 'At Risk' },
];

export default function GoalsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: () => apiFetch<{ goals: Goal[] }>('/api/goals').catch(() => ({ goals: [] })),
  });

  const allGoals = data?.goals || [];
  const goals = allGoals.filter((g) => !statusFilter || g.status === statusFilter);

  // Summary stats
  const stats = useMemo(() => ({
    total: allGoals.length,
    active: allGoals.filter((g) => g.status === 'ACTIVE' || g.status === 'ON_TRACK').length,
    completed: allGoals.filter((g) => g.status === 'COMPLETED').length,
    atRisk: allGoals.filter((g) => g.status === 'AT_RISK' || g.status === 'BEHIND').length,
    avgProgress: allGoals.length > 0
      ? Math.round(allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / allGoals.length)
      : 0,
  }), [allGoals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={s.container}>
      <ScreenHeader title="Goals" showBack />

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* ═══ Summary stat row ═══ */}
            {allGoals.length > 0 && (
              <View style={s.summaryRow}>
                <View style={s.summaryCard}>
                  <View style={[s.summaryIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                    <FontAwesome name="bullseye" size={13} color="#3B82F6" />
                  </View>
                  <Text style={s.summaryValue}>{stats.active}</Text>
                  <Text style={s.summaryLabel}>Active</Text>
                </View>
                <View style={s.summaryCard}>
                  <View style={[s.summaryIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                    <FontAwesome name="check-circle" size={13} color="#22C55E" />
                  </View>
                  <Text style={s.summaryValue}>{stats.completed}</Text>
                  <Text style={s.summaryLabel}>Completed</Text>
                </View>
                <View style={s.summaryCard}>
                  <View style={[s.summaryIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                    <FontAwesome name="exclamation-triangle" size={13} color="#F59E0B" />
                  </View>
                  <Text style={s.summaryValue}>{stats.atRisk}</Text>
                  <Text style={s.summaryLabel}>At Risk</Text>
                </View>
                <View style={s.summaryCard}>
                  <View style={[s.summaryIcon, { backgroundColor: 'rgba(28,140,125,0.1)' }]}>
                    <FontAwesome name="line-chart" size={13} color={Colors.primaryLight} />
                  </View>
                  <Text style={s.summaryValue}>{stats.avgProgress}%</Text>
                  <Text style={s.summaryLabel}>Avg</Text>
                </View>
              </View>
            )}

            {/* ═══ Filter chips ═══ */}
            <View style={s.filterRow}>
              {FILTERS.map((f) => {
                const active = statusFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key ?? 'all'}
                    style={[s.filterChip, active && s.filterChipActive]}
                    onPress={() => setStatusFilter(f.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CFG[item.status] || STATUS_CFG.ACTIVE;
          const progress = item.progress || 0;
          const targetStr = item.targetDate
            ? new Date(item.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            : null;

          return (
            <View style={s.card}>
              {/* Top row: icon + title + status badge */}
              <View style={s.cardTop}>
                <View style={[s.goalIcon, { backgroundColor: cfg.bg }]}>
                  <FontAwesome name={cfg.icon as any} size={16} color={cfg.color} />
                </View>
                <View style={s.cardTitleBlock}>
                  <Text style={s.goalTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={[s.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '30' }]}>
                    <Text style={[s.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              {item.description && (
                <Text style={s.goalDesc} numberOfLines={2}>{item.description}</Text>
              )}

              {/* Progress bar — prominent */}
              <View style={s.progressSection}>
                <View style={s.progressHeader}>
                  <Text style={s.progressLabel}>Progress</Text>
                  <Text style={[s.progressPct, { color: cfg.color }]}>{progress}%</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: cfg.color }]} />
                </View>
              </View>

              {/* Footer: owner + target date */}
              <View style={s.cardFooter}>
                {item.owner && (
                  <View style={s.ownerRow}>
                    <Avatar name={item.owner.name || item.owner.email || 'U'} size={20} />
                    <Text style={s.ownerName} numberOfLines={1}>{item.owner.name || 'Unassigned'}</Text>
                  </View>
                )}
                {targetStr && (
                  <View style={s.dateRow}>
                    <FontAwesome name="calendar-o" size={10} color={Colors.textFaint} />
                    <Text style={s.dateText}>{targetStr}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={4} /> :
          <EmptyState
            icon="bullseye"
            title={statusFilter ? `No ${statusFilter.toLowerCase().replace('_', ' ')} goals` : 'No goals yet'}
            description="Set goals to track your team's progress toward key outcomes"
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  /* ── Summary stats — 4-column row ── */
  summaryRow: {
    flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xs,
  },
  summaryIcon: {
    width: 28, height: 28, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  summaryValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite },
  summaryLabel: { fontSize: 9, color: Colors.textFaint, marginTop: 1 },

  /* ── Filter chips ── */
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },

  /* ── Goal card — Nocturne premium ── */
  card: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  goalIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  cardTitleBlock: { flex: 1, gap: 6 },
  goalTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite, lineHeight: 20 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  statusBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  goalDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  /* ── Progress bar ── */
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textFaint },
  progressPct: { fontSize: FontSize.sm, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.bgElevated },
  progressFill: { height: 6, borderRadius: 3 },

  /* ── Footer ── */
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerName: { fontSize: FontSize.xs, color: Colors.textSecondary, maxWidth: 120 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: FontSize.xs, color: Colors.textFaint },
});
