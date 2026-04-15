import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, FilterChips } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const GOAL_STATUS_FILTERS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'At Risk', value: 'AT_RISK' },
];

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  targetDate: string | null;
  owner?: { name: string };
}

const STATUS_STYLES: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }> = {
  ACTIVE: { color: Colors.info, bg: Colors.infoBg, icon: 'bullseye' },
  COMPLETED: { color: Colors.success, bg: Colors.successBg, icon: 'check-circle' },
  AT_RISK: { color: Colors.warning, bg: Colors.warningBg, icon: 'exclamation-triangle' },
  ON_TRACK: { color: Colors.success, bg: Colors.successBg, icon: 'bullseye' },
  BEHIND: { color: Colors.error, bg: Colors.errorBg, icon: 'exclamation-circle' },
};

export default function GoalsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: () => apiFetch<{ goals: Goal[] }>('/api/goals').catch(() => ({ goals: [] })),
  });

  const goals = (data?.goals || []).filter((g) => !statusFilter || g.status === statusFilter);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Goals" showBack />
      <FilterChips options={GOAL_STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          renderItem={({ item }) => {
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.ACTIVE;
            return (
              <View style={styles.card}>
                <View style={[styles.goalIcon, { backgroundColor: st.bg }]}>
                  <FontAwesome name={st.icon} size={16} color={st.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.goalTitle} numberOfLines={2}>{item.title}</Text>
                  {item.owner && (
                    <Text style={styles.goalOwner}>{item.owner.name}</Text>
                  )}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${item.progress || 0}%`, backgroundColor: st.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: st.color }]}>{item.progress || 0}%</Text>
                  </View>
                  {item.targetDate && (
                    <Text style={styles.targetDate}>
                      Target: {new Date(item.targetDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="bullseye" title="No goals" description="Set goals to track your team's progress" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.xl, gap: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  goalIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  cardBody: { flex: 1 },
  goalTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  goalOwner: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBar: {
    flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.bgElevated,
  },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: FontSize.xs, fontWeight: '600', width: 32 },
  targetDate: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: Spacing.sm },
});
