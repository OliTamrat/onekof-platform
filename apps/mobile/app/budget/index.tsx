import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, TextInput, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

interface BudgetItem {
  id: string;
  totalBudget: number;
  project?: { id: string; name: string };
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
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');

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

  // Fetch budgets list to get a budget ID for expense creation
  const { data: budgetsData } = useQuery({
    queryKey: ['budgets-list'],
    queryFn: () => apiFetch<{ budgets: BudgetItem[] }>('/api/budgets').catch(() => ({ budgets: [] })),
  });

  const budgets = budgetsData?.budgets || [];

  const createMutation = useMutation({
    mutationFn: (data: { budgetId: string; description: string; amount: number; vendor?: string }) =>
      apiFetch(`/api/budgets/${data.budgetId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          description: data.description,
          amount: data.amount,
          transactionDate: new Date().toISOString(),
          vendor: data.vendor || undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-transactions'] });
      setShowCreate(false);
      setDesc('');
      setAmount('');
      setVendor('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not create expense');
    },
  });

  const transactions = (txData?.transactions || []).filter(
    (t) => !typeFilter || t.type === typeFilter
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchTx()]);
    setRefreshing(false);
  }, [refetchSummary, refetchTx]);

  const fmt = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val);

  const spentPct = summary?.totalBudget ? Math.min((summary.totalSpent / summary.totalBudget) * 100, 100) : 0;

  const statValues: Record<string, number> = {
    budget: summary?.totalBudget || 0,
    spent: summary?.totalSpent || 0,
    income: summary?.totalIncome || 0,
    remaining: summary?.remaining || 0,
  };

  const handleCreate = () => {
    const parsedAmount = parseFloat(amount);
    if (!desc.trim()) { Alert.alert('Missing', 'Enter a description'); return; }
    if (!parsedAmount || parsedAmount <= 0) { Alert.alert('Missing', 'Enter a valid amount'); return; }
    if (budgets.length === 0) { Alert.alert('No budgets', 'Create a budget on the web app first'); return; }
    createMutation.mutate({ budgetId: budgets[0].id, description: desc.trim(), amount: parsedAmount, vendor: vendor.trim() });
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
            {/* ═══ Stat Cards — 2x2 grid with icon boxes (matches Dashboard) ═══ */}
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

            {/* ═══ Transactions header + filter + add button ═══ */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionLabel}>TRANSACTIONS</Text>
              <View style={s.sectionRight}>
                <Text style={s.sectionCount}>{transactions.length}</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => setShowCreate(true)}>
                  <FontAwesome name="plus" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.filterRow}>
              {TX_FILTERS.map((f) => {
                const active = typeFilter === f.key;
                return (
                  <TouchableOpacity key={f.key ?? 'all'} style={[s.filterChip, active && s.filterChipActive]} onPress={() => setTypeFilter(f.key)}>
                    <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
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

      {/* ═══ Create Expense Modal ═══ */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowCreate(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={s.dragHandle} />
              <Text style={s.modalTitle}>Add Expense</Text>

              {/* Budget selector (show which budget) */}
              {budgets.length > 0 && (
                <View style={s.budgetTag}>
                  <FontAwesome name="folder-o" size={11} color={Colors.primaryLight} />
                  <Text style={s.budgetTagText}>{budgets[0].project?.name || 'Budget'}</Text>
                </View>
              )}

              <Text style={s.inputLabel}>Description</Text>
              <TextInput
                style={s.input}
                placeholder="What was this expense for?"
                placeholderTextColor={Colors.textFaint}
                value={desc}
                onChangeText={setDesc}
              />

              <Text style={s.inputLabel}>Amount (ETB)</Text>
              <TextInput
                style={s.input}
                placeholder="0.00"
                placeholderTextColor={Colors.textFaint}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={s.inputLabel}>Vendor (optional)</Text>
              <TextInput
                style={s.input}
                placeholder="Company or person paid"
                placeholderTextColor={Colors.textFaint}
                value={vendor}
                onChangeText={setVendor}
              />

              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowCreate(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.saveBtn, createMutation.isPending && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={createMutation.isPending}
                >
                  <Text style={s.saveBtnText}>
                    {createMutation.isPending ? 'Saving...' : 'Add Expense'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  /* ── Stat cards — 2x2 grid with icon boxes ── */
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
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionCount: { fontSize: FontSize.xs, color: Colors.textFaint },
  addBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

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

  /* ═══ Modal ═══ */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  dragHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.textFaint, alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite,
    marginBottom: Spacing.md,
  },
  budgetTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full, backgroundColor: 'rgba(28,140,125,0.1)',
    alignSelf: 'flex-start', marginBottom: Spacing.lg,
  },
  budgetTagText: { fontSize: 11, fontWeight: '600', color: Colors.primaryLight },
  inputLabel: {
    fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary,
    marginBottom: 4, marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite,
  },
  modalActions: {
    flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
