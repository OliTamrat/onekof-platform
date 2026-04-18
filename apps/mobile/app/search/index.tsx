import { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type Project, type TaskStatus, type TaskPriority, type TaskType,
} from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import { useLanguage } from '../../src/contexts/language-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type ResultType = 'all' | 'issues' | 'projects';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ResultType>('all');

  const { data: issuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['search-issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues?limit=100'),
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['search-projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects'),
  });

  const issues = issuesData?.issues || [];
  const projects = projectsData?.projects || [];
  const isLoading = issuesLoading || projectsLoading;
  const q = query.toLowerCase().trim();

  const filteredIssues = useMemo(() => {
    if (!q) return [];
    return issues.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      (i.key && i.key.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q)),
    ).slice(0, 20);
  }, [issues, q]);

  const filteredProjects = useMemo(() => {
    if (!q) return [];
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)),
    ).slice(0, 10);
  }, [projects, q]);

  const hasResults = filteredIssues.length > 0 || filteredProjects.length > 0;
  const showIssues = filter === 'all' || filter === 'issues';
  const showProjects = filter === 'all' || filter === 'projects';

  const renderIssueCard = useCallback(({ item }: { item: Issue }) => {
    const statusCfg = STATUS_CONFIG[(item.status || 'BACKLOG') as TaskStatus] || STATUS_CONFIG.BACKLOG;
    const priorityCfg = PRIORITY_CONFIG[(item.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
    const typeCfg = TYPE_CONFIG[(item.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;

    return (
      <TouchableOpacity
        style={styles.issueCard}
        onPress={() => { Keyboard.dismiss(); router.push(`/issue/${item.id}`); }}
        activeOpacity={0.7}
      >
        <View style={styles.issueTop}>
          <FontAwesome name={typeCfg.icon as any} size={12} color={typeCfg.color} />
          {item.key && <Text style={styles.issueKey}>{item.key}</Text>}
        </View>
        <Text style={styles.issueTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.issueMeta}>
          <View style={[styles.chip, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.chipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: priorityCfg.bg }]}>
            <Text style={[styles.chipText, { color: priorityCfg.color }]}>{priorityCfg.label}</Text>
          </View>
          {item.assignee && (
            <View style={styles.assigneeChip}>
              <Avatar name={item.assignee.name || ''} size={16} />
              <Text style={styles.assigneeName} numberOfLines={1}>{item.assignee.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  const renderProjectCard = useCallback(({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => { Keyboard.dismiss(); router.push(`/project/${item.id}`); }}
      activeOpacity={0.7}
    >
      <View style={[styles.projectDot, { backgroundColor: item.color || Colors.primary }]} />
      <View style={styles.projectInfo}>
        <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.projectKey}>{item.key} {'\u00B7'} {item._count?.issues || 0} issues</Text>
      </View>
      <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
    </TouchableOpacity>
  ), [router]);

  // Build combined sections data for FlatList
  const sections = useMemo(() => {
    const data: Array<{ type: 'header'; title: string; count: number } | { type: 'issue'; item: Issue } | { type: 'project'; item: Project }> = [];

    if (showProjects && filteredProjects.length > 0) {
      data.push({ type: 'header', title: 'Projects', count: filteredProjects.length });
      filteredProjects.forEach((p) => data.push({ type: 'project', item: p }));
    }
    if (showIssues && filteredIssues.length > 0) {
      data.push({ type: 'header', title: 'Issues', count: filteredIssues.length });
      filteredIssues.forEach((i) => data.push({ type: 'issue', item: i }));
    }
    return data;
  }, [showProjects, showIssues, filteredProjects, filteredIssues]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <FontAwesome name="search" size={14} color={Colors.textFaint} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={Colors.textFaint}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <FontAwesome name="times-circle" size={16} color={Colors.textFaint} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filters}>
        {(['all', 'issues', 'projects'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {!q ? (
        <View style={styles.emptyCenter}>
          <FontAwesome name="search" size={36} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('search.title')}</Text>
          <Text style={styles.emptyDesc}>Find issues by title, key, or description</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.emptyCenter}>
          <ActivityIndicator size="large" color={Colors.primaryLight} />
        </View>
      ) : !hasResults ? (
        <View style={styles.emptyCenter}>
          <FontAwesome name="inbox" size={36} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('search.noResults')}</Text>
          <Text style={styles.emptyDesc}>{t('search.tryDifferent')}</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, index) => {
            if (item.type === 'header') return `h-${item.title}`;
            if (item.type === 'issue') return `i-${item.item.id}`;
            return `p-${item.item.id}`;
          }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <Text style={styles.sectionCount}>{item.count}</Text>
                </View>
              );
            }
            if (item.type === 'issue') return renderIssueCard({ item: item.item });
            return renderProjectCard({ item: item.item });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, height: 42,
  },
  searchInput: {
    flex: 1, fontSize: FontSize.base, color: Colors.textWhite, padding: 0,
  },

  filters: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' },
  filterText: { fontSize: FontSize.sm, color: Colors.textFaint, fontWeight: '500' },
  filterTextActive: { color: Colors.primaryLight },

  list: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase', letterSpacing: 1 },
  sectionCount: { fontSize: FontSize.xs, color: Colors.textFaint },

  issueCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm,
  },
  issueTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  issueKey: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint },
  issueTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  chipText: { fontSize: 10, fontWeight: '600' },
  assigneeChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  assigneeName: { fontSize: FontSize.xs, color: Colors.textSecondary, maxWidth: 80 },

  projectCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm,
  },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  projectInfo: { flex: 1 },
  projectName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  projectKey: { fontSize: FontSize.xs, color: Colors.textFaint },

  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textFaint },
});
