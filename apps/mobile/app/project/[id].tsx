import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal, Pressable, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type Project, type User, type TaskStatus, type TaskType, type TaskPriority,
} from '../../src/types';
import { Avatar } from '../../src/components/Avatar';
import { FAB } from '../../src/components/FAB';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* Kanban columns in horizontal order */
const BOARD_COLUMNS: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'board' | 'issues' | 'members'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiFetch<Project>(`/api/projects/${id}`),
    enabled: !!id,
  });

  const { data: issuesData } = useQuery({
    queryKey: ['project-issues', id],
    queryFn: () => apiFetch<{ issues: Issue[] }>(`/api/issues?projectId=${id}`),
    enabled: !!id,
  });

  const { data: membersData } = useQuery({
    queryKey: ['project-members', id],
    queryFn: () => apiFetch<{ members: Array<{ userId: string; user: User; role: string; addedAt?: string }> }>(
      `/api/projects/${id}/members`,
    ),
    enabled: !!id && activeTab === 'members',
  });

  const issues = issuesData?.issues || [];
  const members = membersData?.members || [];

  /* Optimistic status-change mutation (long-press Move-to menu on board) */
  const updateStatusMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: TaskStatus }) =>
      apiFetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ issueId, status }) => {
      // Optimistic update — snapshot prior state for rollback
      await queryClient.cancelQueries({ queryKey: ['project-issues', id] });
      const prev = queryClient.getQueryData<{ issues: Issue[] }>(['project-issues', id]);
      if (prev) {
        queryClient.setQueryData(['project-issues', id], {
          ...prev,
          issues: prev.issues.map((i) => (i.id === issueId ? { ...i, status } : i)),
        });
      }
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      // Offline queue capture is actually success from the user's POV — keep optimistic update
      if ((err as Error)?.message?.includes('Saved offline')) return;
      if (ctx?.prev) queryClient.setQueryData(['project-issues', id], ctx.prev);
      Alert.alert('Failed to move', 'Could not update status. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', id] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
    },
  });

  const [moveIssue, setMoveIssue] = useState<Issue | null>(null);

  const openMoveToMenu = useCallback((issue: Issue) => {
    setMoveIssue(issue);
  }, []);

  const handleMoveTo = (status: TaskStatus) => {
    if (moveIssue) {
      updateStatusMutation.mutate({ issueId: moveIssue.id, status });
      setMoveIssue(null);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <FontAwesome name="exclamation-circle" size={32} color={Colors.textFaint} />
        <Text style={styles.centerText}>Project not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Status counts
  const statusCounts: Record<string, number> = {};
  issues.forEach((i) => { statusCounts[i.status] = (statusCounts[i.status] || 0) + 1; });
  const totalIssues = issues.length;
  const doneCount = statusCounts['DONE'] || 0;
  const progressPct = totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.projectDot, { backgroundColor: project.color || Colors.primary }]} />
          <Text style={styles.headerTitle} numberOfLines={1}>{project.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabs}>
        {(['overview', 'board', 'issues', 'members'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'members' ? 'Team' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Board Tab — horizontal Kanban (outside outer ScrollView so columns scroll independently) ── */}
      {activeTab === 'board' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardScroll}
          style={{ flex: 1 }}
        >
          {BOARD_COLUMNS.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const columnIssues = issues.filter((i) => i.status === status);
            return (
              <View key={status} style={styles.boardColumn}>
                {/* Column header */}
                <View style={styles.boardColumnHeader}>
                  <View style={styles.boardColumnHeaderLeft}>
                    <View style={[styles.boardStatusDot, { backgroundColor: cfg.color }]} />
                    <Text style={styles.boardColumnTitle}>{cfg.label}</Text>
                  </View>
                  <View style={styles.boardCountPill}>
                    <Text style={styles.boardCountText}>{columnIssues.length}</Text>
                  </View>
                </View>

                {/* Column body — vertical scrollable card list */}
                <ScrollView
                  style={styles.boardColumnBody}
                  contentContainerStyle={styles.boardColumnBodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  {columnIssues.length === 0 ? (
                    <View style={styles.boardColumnEmpty}>
                      <Text style={styles.boardColumnEmptyText}>No issues</Text>
                    </View>
                  ) : (
                    columnIssues.map((issue) => {
                      const typeCfg = TYPE_CONFIG[(issue.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
                      const priorityCfg = PRIORITY_CONFIG[(issue.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
                      return (
                        <TouchableOpacity
                          key={issue.id}
                          style={styles.boardCard}
                          activeOpacity={0.7}
                          onPress={() => router.push(`/issue/${issue.id}`)}
                          onLongPress={() => openMoveToMenu(issue)}
                          delayLongPress={300}
                        >
                          <View style={styles.boardCardTop}>
                            <View style={styles.boardCardTopLeft}>
                              <FontAwesome name={typeCfg.icon as any} size={10} color={typeCfg.color} />
                              {issue.key && <Text style={styles.boardCardKey}>{issue.key}</Text>}
                            </View>
                            <FontAwesome
                              name={priorityCfg.icon as any}
                              size={10}
                              color={priorityCfg.color}
                            />
                          </View>
                          <Text style={styles.boardCardTitle} numberOfLines={3}>
                            {issue.title}
                          </Text>
                          <View style={styles.boardCardFooter}>
                            {issue.assignee ? (
                              <Avatar name={issue.assignee.name || ''} size={20} />
                            ) : (
                              <View style={styles.boardCardUnassigned}>
                                <FontAwesome name="user-o" size={9} color={Colors.textFaint} />
                              </View>
                            )}
                            {issue.dueDate && (
                              <View style={styles.boardCardDue}>
                                <FontAwesome name="clock-o" size={9} color={Colors.textFaint} />
                                <Text style={styles.boardCardDueText}>
                                  {new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── Other tabs — outer vertical ScrollView ── */}
      {activeTab !== 'board' && (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Project Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Key</Text>
                <Text style={styles.infoValue}>{project.key}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={[styles.statusBadge, project.status === 'ACTIVE' && styles.statusActive]}>
                  <Text style={[styles.statusText, project.status === 'ACTIVE' && styles.statusActiveText]}>
                    {project.status}
                  </Text>
                </View>
              </View>
              {project.description && (
                <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.descText}>{project.description}</Text>
                </View>
              )}
            </View>

            {/* Progress */}
            {totalIssues > 0 && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressSub}>{doneCount} of {totalIssues} issues done</Text>
              </View>
            )}

            {/* Status Breakdown */}
            <Text style={styles.sectionTitle}>Status Overview</Text>
            <View style={styles.statusGrid}>
              {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'] as TaskStatus[]).map((status) => {
                const cfg = STATUS_CONFIG[status];
                const count = statusCounts[status] || 0;
                return (
                  <View key={status} style={styles.statusCard}>
                    <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                    <Text style={styles.statusLabel}>{cfg.label}</Text>
                    <Text style={[styles.statusCount, { color: cfg.color }]}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Issues Tab ── */}
        {activeTab === 'issues' && (
          <>
            <TouchableOpacity
              style={styles.createIssueBtn}
              onPress={() => router.push(`/create-issue?projectId=${id}`)}
              activeOpacity={0.7}
            >
              <FontAwesome name="plus" size={14} color={Colors.primaryLight} />
              <Text style={styles.createIssueBtnText}>Create Issue</Text>
            </TouchableOpacity>

            {issues.length > 0 ? issues.map((issue) => {
              const statusCfg = STATUS_CONFIG[(issue.status || 'BACKLOG') as TaskStatus] || STATUS_CONFIG.BACKLOG;
              const typeCfg = TYPE_CONFIG[(issue.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
              const priorityCfg = PRIORITY_CONFIG[(issue.priority || 'MEDIUM') as TaskPriority] || PRIORITY_CONFIG.MEDIUM;

              return (
                <TouchableOpacity
                  key={issue.id}
                  style={styles.issueCard}
                  onPress={() => router.push(`/issue/${issue.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.issueTop}>
                    <FontAwesome name={typeCfg.icon as any} size={11} color={typeCfg.color} />
                    {issue.key && <Text style={styles.issueKey}>{issue.key}</Text>}
                  </View>
                  <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                  <View style={styles.issueBottom}>
                    <View style={[styles.chip, { backgroundColor: statusCfg.bg }]}>
                      <Text style={[styles.chipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                    <View style={[styles.chip, { backgroundColor: priorityCfg.bg }]}>
                      <Text style={[styles.chipText, { color: priorityCfg.color }]}>{priorityCfg.label}</Text>
                    </View>
                    {issue.assignee && (
                      <View style={styles.assigneeChip}>
                        <Avatar name={issue.assignee.name || ''} size={16} />
                        <Text style={styles.assigneeName} numberOfLines={1}>{issue.assignee.name}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View style={styles.emptyBlock}>
                <FontAwesome name="check-circle-o" size={28} color={Colors.textFaint} />
                <Text style={styles.emptyTitle}>No issues yet</Text>
                <Text style={styles.emptyDesc}>Create your first issue to get started</Text>
              </View>
            )}
          </>
        )}

        {/* ── Team/Members Tab ── */}
        {activeTab === 'members' && (
          <>
            {members.length > 0 ? members.map((m) => {
              const roleColor = m.role === 'ADMIN' ? Colors.warning : m.role === 'LEAD' ? Colors.primaryLight : Colors.textFaint;
              return (
                <View key={m.userId} style={styles.memberCard}>
                  <Avatar name={m.user?.name || ''} size={40} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.user?.name || 'Unknown'}</Text>
                    <Text style={styles.memberEmail}>{m.user?.email || ''}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
                    <Text style={[styles.roleText, { color: roleColor }]}>{m.role}</Text>
                  </View>
                </View>
              );
            }) : (
              <View style={styles.emptyBlock}>
                <FontAwesome name="users" size={28} color={Colors.textFaint} />
                <Text style={styles.emptyTitle}>No members</Text>
                <Text style={styles.emptyDesc}>Team members will appear here</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      )}

      {/* FAB for creating issues — visible on issues + board tabs */}
      {(activeTab === 'issues' || activeTab === 'board') && (
        <FAB icon="plus" onPress={() => router.push(`/create-issue?projectId=${id}`)} />
      )}

      {/* ═══ Move-to Bottom Sheet ═══ */}
      <Modal
        visible={!!moveIssue}
        transparent
        animationType="slide"
        onRequestClose={() => setMoveIssue(null)}
      >
        <Pressable style={styles.moveOverlay} onPress={() => setMoveIssue(null)}>
          <Pressable style={styles.moveSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.moveDragHandle} />
            <Text style={styles.moveTitle} numberOfLines={1}>
              Move {moveIssue?.key || moveIssue?.title?.slice(0, 30)}
            </Text>

            <View style={styles.moveColumns}>
              {BOARD_COLUMNS.map((status) => {
                const cfg = STATUS_CONFIG[status];
                const isCurrent = moveIssue?.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.moveOption, isCurrent && styles.moveOptionCurrent]}
                    onPress={() => !isCurrent && handleMoveTo(status)}
                    disabled={isCurrent}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.moveStatusDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.moveOptionText, isCurrent && styles.moveOptionTextCurrent]}>
                      {cfg.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.moveCurrentLabel}>Current</Text>
                    )}
                    {!isCurrent && (
                      <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.moveCancelBtn} onPress={() => setMoveIssue(null)}>
              <Text style={styles.moveCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  centerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  linkText: { fontSize: FontSize.base, color: Colors.primaryLight },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  projectDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },

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

  // Info Card
  infoCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textFaint },
  infoValue: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  descText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.xs },
  statusBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
  },
  statusActive: { backgroundColor: Colors.successBg },
  statusText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint, textTransform: 'uppercase' },
  statusActiveText: { color: Colors.success },

  // Progress
  progressCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  progressTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  progressPct: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.success },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.bgElevated, marginBottom: Spacing.sm },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: Colors.success },
  progressSub: { fontSize: FontSize.xs, color: Colors.textFaint },

  // Status Grid
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite, marginTop: Spacing.md },
  statusGrid: { gap: Spacing.sm },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  statusCount: { fontSize: FontSize.lg, fontWeight: '700' },

  // Issues
  createIssueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary + '40', borderStyle: 'dashed',
    borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, marginBottom: Spacing.md,
  },
  createIssueBtnText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.primaryLight },
  issueCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  issueTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  issueKey: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint },
  issueTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  issueBottom: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  chipText: { fontSize: 10, fontWeight: '600' },
  assigneeChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  assigneeName: { fontSize: FontSize.xs, color: Colors.textSecondary, maxWidth: 80 },

  // Members
  memberCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  memberEmail: { fontSize: FontSize.xs, color: Colors.textFaint },
  roleBadge: { paddingHorizontal: Spacing.md, paddingVertical: 3, borderRadius: BorderRadius.full },
  roleText: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase' },

  // Empty
  emptyBlock: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textFaint },

  /* ── Kanban Board ── */
  boardScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  boardColumn: {
    width: 280,
    marginRight: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  boardColumnHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  boardColumnHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  boardStatusDot: { width: 8, height: 8, borderRadius: 4 },
  boardColumnTitle: {
    fontSize: FontSize.xs, fontWeight: '700',
    color: Colors.textWhite, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  boardCountPill: {
    minWidth: 22, height: 20, paddingHorizontal: 6,
    borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  boardCountText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
  boardColumnBody: { maxHeight: 600 },
  boardColumnBodyContent: { padding: Spacing.sm, gap: Spacing.sm },
  boardColumnEmpty: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  boardColumnEmptyText: { fontSize: FontSize.xs, color: Colors.textFaint },

  boardCard: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 6,
  },
  boardCardTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  boardCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boardCardKey: {
    fontSize: 10, fontWeight: '700', color: Colors.textFaint,
    fontFamily: 'Courier',
  },
  boardCardTitle: {
    fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary,
    lineHeight: 18,
  },
  boardCardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 4,
  },
  boardCardUnassigned: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  boardCardDue: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
  },
  boardCardDueText: { fontSize: 9, color: Colors.textFaint },

  /* ═══ Move-to bottom sheet ═══ */
  moveOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  moveSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  moveDragHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.textFaint, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  moveTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textWhite, marginBottom: Spacing.lg,
  },
  moveColumns: { gap: 4, marginBottom: Spacing.lg },
  moveOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
  },
  moveOptionCurrent: { backgroundColor: 'rgba(255,255,255,0.04)' },
  moveStatusDot: { width: 12, height: 12, borderRadius: 6 },
  moveOptionText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  moveOptionTextCurrent: { color: Colors.textFaint },
  moveCurrentLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textFaint,
    backgroundColor: Colors.bgElevated, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: BorderRadius.full, overflow: 'hidden',
  },
  moveCancelBtn: {
    paddingVertical: 14, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  moveCancelText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
});
