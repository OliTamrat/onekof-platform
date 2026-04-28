import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { type Project } from '../../src/types';
import { useLanguage } from '../../src/contexts/language-context';
import { SearchBar } from '../../src/components/SearchBar';
import { FAB } from '../../src/components/FAB';
import { CardSkeleton } from '../../src/components/SkeletonLoader';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects'),
  });

  const projects = data?.projects || [];
  const q = search.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!q) return projects;
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q),
    );
  }, [projects, q]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderProject = useCallback(({ item }: { item: Project }) => {
    const issueCount = item._count?.issues || item.taskStats?.total || 0;
    const progress = item.progress || (item.taskStats
      ? (item.taskStats.total > 0 ? Math.round((item.taskStats.completed / item.taskStats.total) * 100) : 0)
      : 0);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/project/${item.id}`)}
      >
        <View style={[styles.projectColor, { backgroundColor: item.color || Colors.primary }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.projectKey}>{item.key}</Text>
          </View>
          {item.description && (
            <Text style={styles.projectDesc} numberOfLines={1}>{item.description}</Text>
          )}
          <View style={styles.cardBottom}>
            <Text style={styles.issueCount}>{issueCount} issues</Text>
            <View style={[styles.statusChip, item.status === 'ACTIVE' && styles.activeChip]}>
              <Text style={[styles.statusText, item.status === 'ACTIVE' && styles.activeText]}>
                {item.status}
              </Text>
            </View>
            {progress > 0 && (
              <View style={styles.progressChip}>
                <View style={styles.miniTrack}>
                  <View style={[styles.miniFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
          </View>
        </View>
        <FontAwesome name="chevron-right" size={11} color={Colors.textFaint} />
      </TouchableOpacity>
    );
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.title}>{t('projects.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSearch(!showSearch)} accessibilityLabel="Search projects" accessibilityRole="button">
            <FontAwesome name="search" size={15} color={showSearch ? Colors.primaryLight : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/create-project' as any)}
            accessibilityLabel="Create new project"
            accessibilityRole="button"
          >
            <FontAwesome name="plus" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchRow}>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingPad}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderProject}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <FontAwesome name="folder-open-o" size={32} color={Colors.textFaint} />
              <Text style={styles.emptyTitle}>
                {q ? t('common.noResults') : t('projects.noProjects')}
              </Text>
              <Text style={styles.emptyDesc}>
                {q ? 'Try a different search' : 'Create your first project to get started'}
              </Text>
            </View>
          }
        />
      )}

      <FAB icon="plus" onPress={() => router.push('/create-project' as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  addBtn: {
    width: 36, height: 36, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  searchRow: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },

  loadingPad: { padding: Spacing.xl, gap: Spacing.md },
  list: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 100 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.lg,
  },
  projectColor: { width: 4, height: 48, borderRadius: 2 },
  cardContent: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  projectName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textWhite, flex: 1 },
  projectKey: { fontSize: FontSize.xs, color: Colors.textFaint, fontWeight: '500' },
  projectDesc: { fontSize: FontSize.xs, color: Colors.textFaint, lineHeight: 16 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 2 },
  issueCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusChip: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
  },
  activeChip: { backgroundColor: Colors.successBg },
  statusText: { fontSize: 9, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase' },
  activeText: { color: Colors.success },
  progressChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  miniTrack: { width: 32, height: 3, borderRadius: 2, backgroundColor: Colors.bgElevated },
  miniFill: { height: 3, borderRadius: 2, backgroundColor: Colors.primaryLight },
  progressText: { fontSize: 9, color: Colors.textFaint },

  empty: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textFaint },
});
