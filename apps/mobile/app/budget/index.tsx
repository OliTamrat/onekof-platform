import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remaining: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  createdBy?: { name: string };
}

/* ─── Stat card config (matches Dashboard pattern with icon boxes) ─── */
const STAT_CARDS = [
  { key: 'budget', label: 'Budget', icon: 'briefcase' as const, color: Colors.textWhite, bg: 'rgba(255,255,255,0.06)' },
  { key: 'spent', label: 'Spent', icon: 'arrow-circle-down' as const, color: Colors.error, bg: Colors.errorBg },
  { key: 'income', label: 'Income', icon: 'arrow-circle-up' as const, color: Colors.success, bg: Colors.successBg },
  { key: 'remaining', label: 'Remaining', icon: 'check-circle' as const, color: Colors.primaryLight, bg: 'rgba(28,140,125,0.1)' },
];

const TX_FILTERS: Array<{ key: string | null; label: string }> = [
  { key: null, label: 'All' },
  { key: 'EXPENSE', label: 'Expenses' },
  { key: 'INCOME', label: 'Income' },
];

export default function BudgetScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: summary, refetch: refetchSummary } = useQuery({
    queryKey: ['budget-summary'],
    queryFn: () => apiFetch<BudgetSummary>('/api/budgets/summary').catch(() => ({
      totalBudget: 0, totalSpent: 0, totalIncome: 0, remaining: 0,
    })),
  });

  const { data: txData, isLoading, refetch: refetchTx } = useQuery({
    queryKey: ['budget-transactions'],
    queryFn: () => apiFetch<{ transactions: Transaction[] }>('/api/budgets/transactions').catch(() => ({ transactions: [] })),
  });

  const transactions = (txData?.transactions || []).filter(
    (t) => !typeFilter || t.type === typeFilter
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchTx()]);
    setRefreshing(false);
  }, [refetchSummary, refetchTx]);

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);

  const spentPct = summary?.totalBudget ? Math.min((summary.totalSpent / summary.totalBudget) * 100, 100) : 0;

  const statValues: Record<string, number> = {
    budget: summary?.totalBudget || 0,
    spent: summary?.totalSpent || 0,
    income: summary?.totalIncome || 0,
    remaining: summary?.remaining || 0,
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Budget" showBack />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* ═══ Stat Cards — 2×2 grid with icon boxes (matches Dashboard) ═══ */}
            <View style={s.statsGrid}>
              {STAT_CARDS.map((stat) => (
                <View key={stat.key} style={s.statCard}>
                  <View style={[s.statIconBox, { backgroundColor: stat.bg }]}>
                    <FontAwesome name={stat.icon} size={15} color={stat.color} />
                  </View>
                  <Text style={s.statLabel}>{stat.label}</Text>
                  <Text style={[s.statValue, { color: stat.color }]}>
                    {fmt(statValues[stat.key])}
                  </Text>
                </View>
              ))}
            </View>

            {/* ═══ Budget Usage Progress ═══ */}
            {(summary?.totalBudget || 0) > 0 && (
              <View style={s.progressCard}>
                <View style={s.progressHeader}>
                  <View>
                    <Text style={s.progressTitle}>Budget Usage</Text>
                    <Text style={s.progressSub}>{fmt(summary?.totalSpent || 0)} of {fmt(summary?.totalBudget || 0)}</Text>
                  </View>
                  <View style={[
                    s.progressPctBadge,
                    { backgroundColor: spentPct > 80 ? Colors.errorBg : spentPct > 60 ? Colors.warningBg : Colors.successBg },
                  ]}>
                    <Text style={[
                      s.progressPctText,
                      { color: spentPct > 80 ? Colors.error : spentPct > 60 ? Colors.warning : Colors.success },
                    ]}>
                      {spentPct.toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, {
                    width: `${spentPct}%`,
                    backgroundColor: spentPct > 80 ? Colors.error : spentPct > 60 ? Colors.warning : Colors.success,
                  }]} />
                </View>
              </View>
            )}

            {/* ═══ Transactions header + filter ═══ */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>TRANSACTIONS</Text>
              <Text style={s.sectionCount}>{transactions.length}</Text>
            </View>
            <View style={s.filterRow}>
              {TX_FILTERS.map((f) => {
                const active = typeFilter === f.key;
                return (
                  <View key={f.key ?? 'all'} style={[s.filterChip, active && s.filterChipActive]}>
                    <Text
                      style={[s.filterChipText, active && s.filterChipTextActive]}
                      onPress={() => setTypeFilter(f.key)}
                    >
                      {f.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isExp = item.type === 'EXPENSE';
          const dateStr = item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
          return (
            <View style={s.txCard}>
              <View style={[s.txIcon, { backgroundColor: isExp ? '#3B141415' : '#0F3A1E15' }]}>
                <FontAwesome name={isExp ? 'arrow-down' : 'arrow-up'} size={13} color={isExp ? Colors.error : Colors.success} />
              </View>
              <View style={s.txBody}>
                <Text style={s.txDesc} numberOfLines={1}>{item.description}</Text>
                <View style={s.txMetaRow}>
                  <View style={s.txCategoryBadge}>
                    <Text style={s.txCategoryText}>{item.category}</Text>
                  </View>
                  {dateStr ? <Text style={s.txDate}>{dateStr}</Text> : null}
                  {item.createdBy?.name ? (
                    <Text style={s.txAuthor}>{item.createdBy.name}</Text>
                  ) : null}
                </View>
              </View>
              <Text style={[s.txAmount, { color: isExp ? Colors.error : Colors.success }]}>
                {isExp ? '-' : '+'}{fmt(item.amount)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={4} /> :
          <EmptyState icon="money" title="No transactions" description="Budget entries will appear here" />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  /* ── Stat cards — 2×2 grid with icon boxes ── */
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    width: '48.5%' as any,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
  },
  statIconBox: {
    width: 34, height: 34, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginBottom: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },

  /* ── Progress card ── */
  progressCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md,
  },
  progressTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  progressSub: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  progressPctBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  progressPctText: { fontSize: FontSize.sm, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: Colors.bgElevated },
  progressFill: { height: 8, borderRadius: 4 },

  /* ── Section header ── */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textFaint,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  sectionCount: { fontSize: FontSize.xs, color: Colors.textFaint },

  /* ── Filter chips ── */
  filterRow: {
    flexDirection: 'row', gap: 6, marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },

  /* ── Transaction card ── */
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.md,
  },
  txIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  txBody: { flex: 1, gap: 4 },
  txDesc: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txCategoryBadge: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: BorderRadius.full, backgroundColor: Colors.bgElevated,
  },
  txCategoryText: { fontSize: 9, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase' },
  txDate: { fontSize: FontSize.xs, color: Colors.textFaint },
  txAuthor: { fontSize: FontSize.xs, color: Colors.textFaint },
  txAmount: { fontSize: FontSize.sm, fontWeight: '700' },
});
