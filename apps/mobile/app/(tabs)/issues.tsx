import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BACKLOG: { bg: Colors.bgElevated, text: Colors.textFaint },
  TODO: { bg: Colors.warningBg, text: Colors.warning },
  IN_PROGRESS: { bg: Colors.infoBg, text: Colors.info },
  IN_REVIEW: { bg: 'rgba(139,92,246,0.1)', text: Colors.violet },
  DONE: { bg: Colors.successBg, text: Colors.success },
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: Colors.priorityCritical,
  HIGH: Colors.priorityHigh,
  MEDIUM: Colors.priorityMedium,
  LOW: Colors.priorityLow,
};

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  project?: { name: string; key: string };
}

export default function IssuesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues'),
  });

  const issues = data?.issues || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Issues</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <FontAwesome name="plus" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.BACKLOG;
          const priorityColor = PRIORITY_COLORS[item.priority] || Colors.textFaint;

          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <View style={styles.cardContent}>
                <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.cardMeta}>
                  {item.project && (
                    <Text style={styles.projectLabel}>{item.project.key}</Text>
                  )}
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {item.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="check-circle-o" size={32} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>No issues</Text>
            <Text style={styles.emptyDesc}>All caught up</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textWhite },
  addBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  list: { padding: Spacing.xl, gap: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  cardContent: { flex: 1 },
  issueTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  projectLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textFaint,
    backgroundColor: Colors.bgElevated, paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: BorderRadius.sm, overflow: 'hidden',
  },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textWhite },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
