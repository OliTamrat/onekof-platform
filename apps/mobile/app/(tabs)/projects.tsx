import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Project {
  id: string;
  name: string;
  key: string;
  status: string;
  color: string | null;
  _count?: { issues: number };
}

export default function ProjectsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects'),
  });

  const projects = data?.projects || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
          <FontAwesome name="plus" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.7}>
            <View style={[styles.projectColor, { backgroundColor: item.color || Colors.primary }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.projectName}>{item.name}</Text>
                <Text style={styles.projectKey}>{item.key}</Text>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.issueCount}>
                  {item._count?.issues || 0} issues
                </Text>
                <View style={[styles.statusBadge, item.status === 'ACTIVE' && styles.statusActive]}>
                  <Text style={[styles.statusText, item.status === 'ACTIVE' && styles.statusActiveText]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <FontAwesome name="folder-open-o" size={32} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptyDesc}>Create your first project to get started</Text>
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
  list: { padding: Spacing.xl, gap: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.lg,
  },
  projectColor: { width: 4, height: 40, borderRadius: 2 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  projectName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite, flex: 1 },
  projectKey: { fontSize: FontSize.xs, color: Colors.textFaint, fontWeight: '500' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  issueCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
  },
  statusActive: { backgroundColor: Colors.successBg },
  statusText: { fontSize: 10, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase' },
  statusActiveText: { color: Colors.success },
  empty: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textWhite },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
