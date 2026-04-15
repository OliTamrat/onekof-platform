import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, FilterChips } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CATEGORY_FILTERS = [
  { label: 'Expenses', value: 'EXPENSE' },
  { label: 'Income', value: 'INCOME' },
];

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

  const formatCurrency = (amount: number) => {
    // Support ETB (Ethiopian Birr) as default for Ethiopian orgs, fallback to USD
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount);
  };

  const spentPercent = summary?.totalBudget ? Math.min((summary.totalSpent / summary.totalBudget) * 100, 100) : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Budget" showBack />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Budget</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summary?.totalBudget || 0)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>
                  {formatCurrency(summary?.totalSpent || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  {formatCurrency(summary?.totalIncome || 0)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryValue, { color: Colors.primaryLight }]}>
                  {formatCurrency(summary?.remaining || 0)}
                </Text>
              </View>
            </View>

            {/* Budget progress bar */}
            {(summary?.totalBudget || 0) > 0 && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Budget Usage</Text>
                  <Text style={[styles.progressPercent, spentPercent > 80 && { color: Colors.error }]}>
                    {spentPercent.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${spentPercent}%`,
                        backgroundColor: spentPercent > 80 ? Colors.error : spentPercent > 60 ? Colors.warning : Colors.success,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Filter */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transactions</Text>
            </View>
            <FilterChips options={CATEGORY_FILTERS} selected={typeFilter} onSelect={setTypeFilter} />
          </>
        }
        renderItem={({ item }) => {
          const isExpense = item.type === 'EXPENSE';
          return (
            <View style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: isExpense ? Colors.errorBg : Colors.successBg }]}>
                <FontAwesome
                  name={isExpense ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={isExpense ? Colors.error : Colors.success}
                />
              </View>
              <View style={styles.txBody}>
                <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.txMeta}>
                  {item.category} - {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.txAmount, { color: isExpense ? Colors.error : Colors.success }]}>
                {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing['5xl'] },
  summaryRow: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginBottom: Spacing.xs },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  progressCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginTop: Spacing.sm,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressPercent: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: Colors.bgElevated },
  progressFill: { height: 8, borderRadius: 4 },
  sectionHeader: { marginTop: Spacing.xl },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  txIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  txBody: { flex: 1 },
  txDesc: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  txMeta: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  txAmount: { fontSize: FontSize.base, fontWeight: '600' },
});
