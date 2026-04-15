import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const STATUS_OPTIONS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  BACKLOG: { bg: 'rgba(148,163,184,0.1)', text: '#94A3B8', label: 'Backlog' },
  TODO: { bg: Colors.warningBg, text: Colors.warning, label: 'To Do' },
  IN_PROGRESS: { bg: Colors.infoBg, text: Colors.info, label: 'In Progress' },
  IN_REVIEW: { bg: 'rgba(139,92,246,0.1)', text: Colors.violet, label: 'In Review' },
  DONE: { bg: Colors.successBg, text: Colors.success, label: 'Done' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  LOW: { bg: Colors.infoBg, text: Colors.info, label: 'Low' },
  MEDIUM: { bg: Colors.warningBg, text: Colors.warning, label: 'Medium' },
  HIGH: { bg: 'rgba(249,115,22,0.1)', text: '#F97316', label: 'High' },
  CRITICAL: { bg: Colors.errorBg, text: Colors.error, label: 'Critical' },
};

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string; avatar: string | null };
  reporter?: { id: string; name: string };
  project?: { id: string; name: string; key: string };
  labels: string[];
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string; avatar: string | null };
  }>;
  subtasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [newComment, setNewComment] = useState('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: issue, isLoading, refetch } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => apiFetch<Issue>(`/api/issues/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Issue>) =>
      apiFetch(`/api/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/issues/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });

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

  if (!issue) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Issue not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = STATUS_COLORS[issue.status] || STATUS_COLORS.BACKLOG;
  const priorityStyle = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.MEDIUM;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerProject} numberOfLines={1}>
            {issue.project?.key || 'Issue'}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <FontAwesome name="ellipsis-h" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Title */}
        <Text style={styles.issueTitle}>{issue.title}</Text>

        {/* Status + Priority row */}
        <View style={styles.badgeRow}>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: statusStyle.bg }]}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
          >
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
            <FontAwesome name="caret-down" size={10} color={statusStyle.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.badge, { backgroundColor: priorityStyle.bg }]}
            onPress={() => setShowPriorityPicker(!showPriorityPicker)}
          >
            <Text style={[styles.badgeText, { color: priorityStyle.text }]}>{priorityStyle.label}</Text>
            <FontAwesome name="caret-down" size={10} color={priorityStyle.text} />
          </TouchableOpacity>
        </View>

        {/* Status Picker */}
        {showStatusPicker && (
          <View style={styles.pickerCard}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.pickerItem, issue.status === status && styles.pickerItemActive]}
                onPress={() => {
                  updateMutation.mutate({ status });
                  setShowStatusPicker(false);
                }}
              >
                <View style={[styles.pickerDot, { backgroundColor: STATUS_COLORS[status]?.text }]} />
                <Text style={[styles.pickerText, issue.status === status && styles.pickerTextActive]}>
                  {STATUS_COLORS[status]?.label || status}
                </Text>
                {issue.status === status && <FontAwesome name="check" size={12} color={Colors.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Priority Picker */}
        {showPriorityPicker && (
          <View style={styles.pickerCard}>
            {PRIORITY_OPTIONS.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[styles.pickerItem, issue.priority === priority && styles.pickerItemActive]}
                onPress={() => {
                  updateMutation.mutate({ priority });
                  setShowPriorityPicker(false);
                }}
              >
                <View style={[styles.pickerDot, { backgroundColor: PRIORITY_COLORS[priority]?.text }]} />
                <Text style={[styles.pickerText, issue.priority === priority && styles.pickerTextActive]}>
                  {PRIORITY_COLORS[priority]?.label || priority}
                </Text>
                {issue.priority === priority && <FontAwesome name="check" size={12} color={Colors.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['details', 'comments', 'activity'] as const).map((tab) => (
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

        {/* Details Tab */}
        {activeTab === 'details' && (
          <View style={styles.detailsSection}>
            {/* Description */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Description</Text>
              <Text style={styles.fieldValue}>
                {issue.description || 'No description'}
              </Text>
            </View>

            {/* Assignee */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Assignee</Text>
              <View style={styles.fieldRight}>
                {issue.assignee ? (
                  <View style={styles.userChip}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {issue.assignee.name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <Text style={styles.userName}>{issue.assignee.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.fieldValueDim}>Unassigned</Text>
                )}
              </View>
            </View>

            {/* Reporter */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Reporter</Text>
              <View style={styles.fieldRight}>
                <Text style={styles.fieldValueText}>{issue.reporter?.name || 'Unknown'}</Text>
              </View>
            </View>

            {/* Due Date */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Due Date</Text>
              <View style={styles.fieldRight}>
                <Text style={[styles.fieldValueText, issue.dueDate && new Date(issue.dueDate) < new Date() && { color: Colors.error }]}>
                  {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
                </Text>
              </View>
            </View>

            {/* Labels */}
            {issue.labels && issue.labels.length > 0 && (
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>Labels</Text>
                <View style={styles.labelsRow}>
                  {issue.labels.map((label) => (
                    <View key={label} style={styles.labelChip}>
                      <Text style={styles.labelText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Subtasks */}
            {issue.subtasks && issue.subtasks.length > 0 && (
              <View style={styles.fieldCard}>
                <Text style={styles.fieldLabel}>
                  Subtasks ({issue.subtasks.filter(s => s.status === 'DONE').length}/{issue.subtasks.length})
                </Text>
                {issue.subtasks.map((subtask) => (
                  <View key={subtask.id} style={styles.subtaskItem}>
                    <FontAwesome
                      name={subtask.status === 'DONE' ? 'check-circle' : 'circle-o'}
                      size={16}
                      color={subtask.status === 'DONE' ? Colors.success : Colors.textFaint}
                    />
                    <Text style={[styles.subtaskText, subtask.status === 'DONE' && styles.subtaskDone]}>
                      {subtask.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Timestamps */}
            <View style={styles.timestamps}>
              <Text style={styles.timestampText}>
                Created {new Date(issue.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.timestampText}>
                Updated {new Date(issue.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <View style={styles.commentsSection}>
            {issue.comments && issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.user.name?.charAt(0) || '?'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome name="comment-o" size={24} color={Colors.textFaint} />
                <Text style={styles.emptyText}>No comments yet</Text>
              </View>
            )}
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View style={styles.emptyState}>
            <FontAwesome name="history" size={24} color={Colors.textFaint} />
            <Text style={styles.emptyText}>Activity timeline coming soon</Text>
          </View>
        )}
      </ScrollView>

      {/* Comment Input (visible on comments tab) */}
      {activeTab === 'comments' && (
        <View style={styles.commentInput}>
          <TextInput
            style={styles.commentTextInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            placeholderTextColor={Colors.textFaint}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
            onPress={() => newComment.trim() && commentMutation.mutate(newComment.trim())}
            disabled={!newComment.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome name="send" size={14} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary },
  backLink: { marginTop: Spacing.lg },
  backLinkText: { fontSize: FontSize.base, color: Colors.primaryLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerProject: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  moreBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 100 },
  issueTitle: { fontSize: FontSize['2xl'], fontWeight: '600', color: Colors.textWhite, marginBottom: Spacing.lg, lineHeight: 32 },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  badge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  pickerCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, overflow: 'hidden',
  },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerItemActive: { backgroundColor: Colors.primary + '10' },
  pickerDot: { width: 8, height: 8, borderRadius: 4 },
  pickerText: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary },
  pickerTextActive: { color: Colors.textWhite, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.xl },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textFaint },
  tabTextActive: { color: Colors.primaryLight },
  detailsSection: { gap: Spacing.md },
  fieldCard: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textFaint },
  fieldValue: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22 },
  fieldRight: { flexDirection: 'row', alignItems: 'center' },
  fieldValueText: { fontSize: FontSize.base, color: Colors.textPrimary },
  fieldValueDim: { fontSize: FontSize.base, color: Colors.textFaint },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  userAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 10, fontWeight: '700', color: Colors.primaryLight },
  userName: { fontSize: FontSize.base, color: Colors.textPrimary },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  labelChip: { backgroundColor: Colors.bgElevated, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  labelText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  subtaskText: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  subtaskDone: { textDecorationLine: 'line-through', color: Colors.textFaint },
  timestamps: { paddingTop: Spacing.lg, gap: Spacing.xs },
  timestampText: { fontSize: FontSize.xs, color: Colors.textFaint },
  commentsSection: { gap: Spacing.md },
  commentCard: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.violet + '20', justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: 10, fontWeight: '700', color: Colors.violet400 },
  commentAuthor: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  commentDate: { fontSize: FontSize.xs, color: Colors.textFaint },
  commentBody: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textFaint },
  commentInput: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  commentTextInput: {
    flex: 1, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
