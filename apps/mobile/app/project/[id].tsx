import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BACKLOG: { bg: 'rgba(148,163,184,0.1)', text: '#94A3B8' },
  TODO: { bg: Colors.warningBg, text: Colors.warning },
  IN_PROGRESS: { bg: Colors.infoBg, text: Colors.info },
  IN_REVIEW: { bg: 'rgba(139,92,246,0.1)', text: Colors.violet },
  DONE: { bg: Colors.successBg, text: Colors.success },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'team'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiFetch(`/api/projects/${id}`),
    enabled: !!id,
  });

  const { data: issuesData } = useQuery({
    queryKey: ['project-issues', id],
    queryFn: () => apiFetch(`/api/issues?projectId=${id}`),
    enabled: !!id && activeTab === 'issues',
  });

  const issues = issuesData?.issues || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  // Count issues by status
  const statusCounts: Record<string, number> = {};
  if (project.issues) {
    project.issues.forEach((i: any) => {
      statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.projectDot, { backgroundColor: project.color || Colors.primary }]} />
          <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <FontAwesome name="ellipsis-h" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview', 'issues', 'team'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {activeTab === 'overview' && (
          <>
            {/* Project Info */}
            <View style={styles.infoCard}>
              <Text style={styles.fieldLabel}>Key</Text>
              <Text style={styles.fieldValue}>{project.key}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.fieldLabel}>Status</Text>
              <Text style={styles.fieldValue}>{project.status}</Text>
            </View>
            {project.description && (
              <View style={styles.infoCard}>
                <Text style={styles.fieldLabel}>Description</Text>
                <Text style={styles.descText}>{project.description}</Text>
              </View>
            )}

            {/* Stats */}
            <Text style={styles.sectionTitle}>Status Overview</Text>
            <View style={styles.statsGrid}>
              {Object.entries(STATUS_COLORS).map(([status, style]) => (
                <View key={status} style={styles.statCard}>
                  <View style={[styles.statDot, { backgroundColor: style.text }]} />
                  <Text style={styles.statLabel}>{status.replace('_', ' ')}</Text>
                  <Text style={[styles.statValue, { color: style.text }]}>
                    {statusCounts[status] || 0}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'issues' && (
          <>
            <TouchableOpacity
              style={styles.createIssueBtn}
              onPress={() => router.push('/create-issue')}
              activeOpacity={0.7}
            >
              <FontAwesome name="plus" size={14} color={Colors.primaryLight} />
              <Text style={styles.createIssueBtnText}>Create Issue</Text>
            </TouchableOpacity>

            {issues.length > 0 ? issues.map((issue: any) => {
              const statusStyle = STATUS_COLORS[issue.status] || STATUS_COLORS.BACKLOG;
              return (
                <TouchableOpacity
                  key={issue.id}
                  style={styles.issueCard}
                  onPress={() => router.push(`/issue/${issue.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                  <View style={[styles.issueBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.issueBadgeText, { color: statusStyle.text }]}>
                      {issue.status.replace('_', ' ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No issues in this project</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'team' && (
          <View style={styles.emptyState}>
            <FontAwesome name="users" size={24} color={Colors.textFaint} />
            <Text style={styles.emptyText}>Team management coming soon</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textFaint },
  tabTextActive: { color: Colors.primaryLight },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },
  infoCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
  },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textFaint, marginBottom: Spacing.xs },
  fieldValue: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  descText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite, marginTop: Spacing.lg },
  statsGrid: { gap: Spacing.sm },
  statCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },
  createIssueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary + '40', borderStyle: 'dashed',
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md,
  },
  createIssueBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.primaryLight },
  issueCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  issueTitle: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  issueBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  issueBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textFaint },
});
