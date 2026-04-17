import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  RefreshControl, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Issue, type User, type Comment, type Activity,
  type TaskStatus, type TaskPriority, type TaskType, type UpdateIssuePayload,
} from '../../src/types';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Avatar } from '../../src/components/Avatar';
import { useAuth } from '../../src/contexts/auth-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Constants ─── */
const STATUS_OPTIONS = (['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'] as const).map((s) => ({
  value: s, label: STATUS_CONFIG[s].label, icon: STATUS_CONFIG[s].icon as any, color: STATUS_CONFIG[s].color,
}));
const PRIORITY_OPTIONS = (['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as const).map((p) => ({
  value: p, label: PRIORITY_CONFIG[p].label, icon: PRIORITY_CONFIG[p].icon as any, color: PRIORITY_CONFIG[p].color,
}));
const TYPE_OPTIONS = (['TASK', 'STORY', 'BUG', 'EPIC'] as const).map((t) => ({
  value: t, label: TYPE_CONFIG[t].label, icon: TYPE_CONFIG[t].icon as any, color: TYPE_CONFIG[t].color,
}));

/* Role badge styling for @mention picker */
const ROLE_BADGE_STYLE = {
  OWNER:      { label: 'Owner',      color: '#A78BFA', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  ADMIN:      { label: 'Admin',      color: '#FCD34D', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  MEMBER:     { label: 'Member',     color: '#5EEAD4', bg: 'rgba(28,140,125,0.12)', border: 'rgba(28,140,125,0.3)' },
  CONTRACTOR: { label: 'Contractor', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  GUEST:      { label: 'Guest',      color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.3)' },
} as const;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(d: string | null | undefined): string {
  if (!d) return '';
  const dt = new Date(d);
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}
function fmtDateTime(d: string | null | undefined): string {
  if (!d) return '';
  const dt = new Date(d);
  const h = dt.getHours();
  const m = dt.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} at ${h % 12 || 12}:${m} ${ampm}`;
}
function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(d);
}

function generateDateOptions() {
  const options: { value: string; label: string; icon: any; color: string }[] = [
    { value: '__none__', label: 'No due date', icon: 'times', color: Colors.textFaint },
  ];
  const today = new Date();
  const presets = [
    { days: 0, label: 'Today' }, { days: 1, label: 'Tomorrow' }, { days: 3, label: 'In 3 days' },
    { days: 7, label: 'Next week' }, { days: 14, label: 'In 2 weeks' }, { days: 30, label: 'In 1 month' },
  ];
  for (const p of presets) {
    const d = new Date(today);
    d.setDate(d.getDate() + p.days);
    const iso = d.toISOString().split('T')[0];
    options.push({ value: iso, label: `${p.label} (${fmtDate(iso)})`, icon: 'calendar', color: Colors.info });
  }
  return options;
}

/* ─── Collapsible Section ─── */
function Section({ title, subtitle, children, defaultOpen = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={s.section}>
      <TouchableOpacity style={s.sectionHeader} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionTitle}>{title}</Text>
          {!open && subtitle && <Text style={s.sectionSubtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        <FontAwesome name={open ? 'chevron-down' : 'chevron-right'} size={12} color={Colors.textFaint} />
      </TouchableOpacity>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

/* ─── Detail Field Row ─── */
function Field({ label, children, onPress }: { label: string; children: React.ReactNode; onPress?: () => void }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={s.fieldRow} onPress={onPress} activeOpacity={0.6}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldValue}>{children}</View>
    </Wrapper>
  );
}

/* ════════════════════════════════════════════
   ISSUE DETAIL SCREEN (Jira-style)
   ════════════════════════════════════════════ */
export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { currentOrg } = useAuth();

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // @mention state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(0);

  // Bottom sheet state
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);

  // Data
  const { data: issueData, isLoading, refetch } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => apiFetch<{ issue: Issue } | Issue>(`/api/issues/${id}`),
    enabled: !!id,
  });
  const issue: Issue | undefined = issueData
    ? ('issue' in issueData ? (issueData as any).issue : issueData as Issue)
    : undefined;

  const { data: membersData } = useQuery({
    queryKey: ['project-members', issue?.projectId],
    queryFn: () => apiFetch<{ members: Array<{ userId: string; user: User }> }>(
      `/api/projects/${issue?.projectId}/members`,
    ),
    enabled: !!issue?.projectId,
  });

  const members = membersData?.members || [];
  const dateOptions = useMemo(generateDateOptions, []);

  const assigneeOptions = useMemo(() => [
    { value: '__unassigned__', label: 'Unassigned', icon: 'user-o' as any, color: Colors.textFaint },
    ...members.map((m) => ({
      value: m.userId, label: m.user?.name || m.user?.email || 'User', icon: 'user' as any, color: Colors.primaryLight,
    })),
  ], [members]);

  // Mutations
  const showError = (msg: string) => Alert.alert('Error', msg);

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateIssuePayload) =>
      apiFetch(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
    },
    onError: (e: Error) => showError(e.message || 'Failed to update issue'),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/issues/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: () => {
      setNewComment('');
      setMentionOpen(false);
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
    onError: (e: Error) => showError(e.message || 'Failed to post comment'),
  });

  // Org members for @mentions — uses dedicated mobile endpoint with Bearer JWT auth
  const { data: orgMembersData } = useQuery({
    queryKey: ['org-members-mentions', currentOrg?.id],
    queryFn: () => apiFetch('/api/auth/mobile/members').catch(() => ({ members: [] })),
    enabled: !!currentOrg?.id,
  });

  type MentionMember = User & { role?: string };

  const mentionableUsers: MentionMember[] = useMemo(() => {
    const raw = ((orgMembersData as any)?.members || []) as any[];
    return raw
      .filter((m) => m && m.id)
      .map((m) => ({
        id: m.id,
        name: m.name ?? null,
        email: m.email ?? '',
        avatar: m.avatar ?? null,
        role: m.role,
      }));
  }, [orgMembersData]);

  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return mentionableUsers.slice(0, 6);
    const q = mentionQuery.toLowerCase();
    return mentionableUsers
      .filter((m) => (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionableUsers, mentionQuery]);

  // Detect @ in comment input and open member picker
  const handleCommentChange = useCallback((value: string) => {
    setNewComment(value);
    const lastAt = value.lastIndexOf('@');
    if (lastAt >= 0) {
      const afterAt = value.slice(lastAt + 1);
      if (!/\s/.test(afterAt) && afterAt.length <= 30) {
        setMentionStart(lastAt);
        setMentionQuery(afterAt);
        setMentionOpen(true);
        return;
      }
    }
    setMentionOpen(false);
  }, []);

  const insertMention = useCallback((member: User) => {
    const displayName = (member.name || member.email || '').replace(/\s+/g, '');
    const before = newComment.slice(0, mentionStart);
    const after = newComment.slice(mentionStart + 1 + mentionQuery.length);
    setNewComment(`${before}@${displayName} ${after}`);
    setMentionOpen(false);
    setMentionQuery('');
  }, [newComment, mentionStart, mentionQuery]);

  const subtaskMutation = useMutation({
    mutationFn: (title: string) =>
      apiFetch(`/api/issues/${id}/subtasks`, { method: 'POST', body: JSON.stringify({ title }) }),
    onSuccess: () => {
      setNewSubtask('');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
    onError: (e: Error) => showError(e.message || 'Failed to create subtask'),
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, status }: { subtaskId: string; status: string }) =>
      apiFetch(`/api/issues/${subtaskId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issue', id] }),
    onError: (e: Error) => showError(e.message || 'Failed to update subtask'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/issues/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['all-issues'] });
      router.back();
    },
    onError: (e: Error) => showError(e.message || 'Failed to delete issue'),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleDelete = () => {
    Alert.alert('Delete Issue', 'This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleCopyLink = async () => {
    const url = `https://onekof.com/dashboard/issues?issueId=${id}`;
    try { await Clipboard.setStringAsync(url); } catch {}
    Alert.alert('Copied', 'Link copied to clipboard');
    setShowMoreMenu(false);
  };

  const handleShare = async () => {
    setShowMoreMenu(false);
    try {
      await Share.share({ message: `${issue?.key || ''}: ${issue?.title}\nhttps://onekof.com/dashboard/issues?issueId=${id}` });
    } catch {}
  };

  // Loading
  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={s.center}>
        <FontAwesome name="exclamation-circle" size={32} color={Colors.textFaint} />
        <Text style={s.centerText}>Issue not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[issue.status as TaskStatus] || STATUS_CONFIG.BACKLOG;
  const typeCfg = TYPE_CONFIG[(issue.type || 'TASK') as TaskType] || TYPE_CONFIG.TASK;
  const priorityCfg = PRIORITY_CONFIG[issue.priority as TaskPriority] || PRIORITY_CONFIG.MEDIUM;
  const isOverdue = issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== 'DONE';
  const doneCount = issue.subtasks?.filter((st) => st.status === 'DONE').length || 0;
  const totalSubtasks = issue.subtasks?.length || 0;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* ════ HEADER (Jira-style) ════ */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} hitSlop={8}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={s.headerKey}>{issue.key || ''}</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn}>
            <FontAwesome name="eye" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn}>
            <FontAwesome name="paperclip" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => setShowMoreMenu(true)}>
            <FontAwesome name="ellipsis-h" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* ════ ISSUE KEY + TYPE ICON ════ */}
        <View style={s.keyRow}>
          <FontAwesome name={typeCfg.icon as any} size={14} color={typeCfg.color} />
          <Text style={s.keyText}>{issue.key || issue.project?.key || ''}</Text>
        </View>

        {/* ════ TITLE + ASSIGNEE ════ */}
        <View style={s.titleRow}>
          <Text style={s.title}>{issue.title}</Text>
          <TouchableOpacity onPress={() => setShowAssignee(true)}>
            {issue.assignee ? (
              <Avatar name={issue.assignee.name || ''} size={36} />
            ) : (
              <View style={s.unassignedAvatar}>
                <FontAwesome name="user-o" size={16} color={Colors.textFaint} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ════ STATUS PILL + ACTION ════ */}
        <View style={s.statusRow}>
          <TouchableOpacity
            style={[s.statusPill, { backgroundColor: statusCfg.bg, borderColor: statusCfg.color + '40' }]}
            onPress={() => setShowStatus(true)}
          >
            <Text style={[s.statusPillText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
            <FontAwesome name="caret-down" size={10} color={statusCfg.color} />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => setShowType(true)}>
            <FontAwesome name="bolt" size={13} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ════ DESCRIPTION (collapsible) ════ */}
        <Section
          title="Description"
          defaultOpen={!!issue.description}
          subtitle={issue.description ? issue.description.slice(0, 60) + '...' : 'No description'}
        >
          {issue.description ? (
            <Text style={s.descText}>{issue.description}</Text>
          ) : (
            <Text style={s.descEmpty}>No description provided.</Text>
          )}
        </Section>

        {/* ════ PARENT WORK ITEM (if exists) ════ */}
        {issue.parentId && (
          <Section title="Parent work item">
            <View style={s.parentRow}>
              <FontAwesome name="bolt" size={13} color={Colors.violet} />
              <Text style={s.parentText}>Parent Issue</Text>
            </View>
          </Section>
        )}

        {/* ════ DETAILS (collapsible — Jira-style) ════ */}
        <Section
          title="Details"
          subtitle="Issue Type, Assignee, Priority, Due date, Labels, Start..."
          defaultOpen={false}
        >
          <Field label="Issue Type" onPress={() => setShowType(true)}>
            <View style={s.fieldInline}>
              <FontAwesome name={typeCfg.icon as any} size={13} color={typeCfg.color} />
              <Text style={s.fieldText}>{typeCfg.label}</Text>
            </View>
          </Field>
          <Field label="Assignee" onPress={() => setShowAssignee(true)}>
            {issue.assignee ? (
              <View style={s.fieldInline}>
                <Avatar name={issue.assignee.name || ''} size={22} />
                <Text style={s.fieldText}>{issue.assignee.name}</Text>
              </View>
            ) : (
              <Text style={s.fieldDim}>None</Text>
            )}
          </Field>
          <Field label="Priority" onPress={() => setShowPriority(true)}>
            <View style={s.fieldInline}>
              <FontAwesome name={priorityCfg.icon as any} size={13} color={priorityCfg.color} />
              <Text style={s.fieldText}>{priorityCfg.label}</Text>
            </View>
          </Field>
          <Field label="Due date" onPress={() => setShowDueDate(true)}>
            <Text style={[s.fieldText, isOverdue && { color: Colors.error }]}>
              {issue.dueDate ? fmtDate(issue.dueDate) : 'None'}
            </Text>
            {isOverdue && <FontAwesome name="exclamation-triangle" size={11} color={Colors.error} style={{ marginLeft: 6 }} />}
          </Field>
          {issue.labels && issue.labels.length > 0 ? (
            <Field label="Labels">
              <View style={s.labelsWrap}>
                {issue.labels.map((l) => (
                  <View key={l} style={s.labelChip}>
                    <Text style={s.labelChipText}>{l}</Text>
                  </View>
                ))}
              </View>
            </Field>
          ) : (
            <Field label="Labels"><Text style={s.fieldDim}>None</Text></Field>
          )}
          <Field label="Start date">
            <Text style={s.fieldDim}>{issue.startDate ? fmtDate(issue.startDate) : 'None'}</Text>
          </Field>
          <Field label="Reporter">
            {issue.reporter ? (
              <View style={s.fieldInline}>
                <Avatar name={issue.reporter.name || ''} size={22} />
                <Text style={s.fieldText}>{issue.reporter.name}</Text>
              </View>
            ) : (
              <Text style={s.fieldDim}>None</Text>
            )}
          </Field>
          {issue.estimate != null && (
            <Field label="Estimate">
              <Text style={s.fieldText}>{issue.estimate}h</Text>
            </Field>
          )}
          {issue.timeSpent != null && (
            <Field label="Time Spent">
              <Text style={s.fieldText}>{issue.timeSpent}h</Text>
            </Field>
          )}
        </Section>

        {/* ════ MORE FIELDS (collapsible) ════ */}
        <Section title="More fields" subtitle="Project, Created, and Updated">
          {issue.project && (
            <Field label="Project" onPress={() => router.push(`/project/${issue.project?.id}`)}>
              <View style={s.fieldInline}>
                <View style={[s.projectDot, { backgroundColor: issue.project.color || Colors.primary }]}>
                  <Text style={s.projectDotText}>{issue.project.key?.slice(0, 2)}</Text>
                </View>
                <Text style={s.fieldText}>{issue.project.name}</Text>
              </View>
            </Field>
          )}
          <Field label="Created">
            <Text style={s.fieldText}>{fmtDateTime(issue.createdAt)}</Text>
          </Field>
          <Field label="Updated">
            <Text style={s.fieldText}>{fmtDateTime(issue.updatedAt)}</Text>
          </Field>
        </Section>

        {/* ════ SUBTASKS ════ */}
        {(totalSubtasks > 0 || true) && (
          <Section title={`Child issues${totalSubtasks > 0 ? ` (${doneCount}/${totalSubtasks})` : ''}`} defaultOpen={totalSubtasks > 0}>
            {issue.subtasks?.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={s.subtaskRow}
                onPress={() => toggleSubtaskMutation.mutate({
                  subtaskId: subtask.id,
                  status: subtask.status === 'DONE' ? 'TODO' : 'DONE',
                })}
                activeOpacity={0.6}
              >
                <FontAwesome
                  name={subtask.status === 'DONE' ? 'check-circle' : 'circle-o'}
                  size={18}
                  color={subtask.status === 'DONE' ? Colors.success : Colors.textFaint}
                />
                <Text style={[s.subtaskTitle, subtask.status === 'DONE' && s.subtaskDone]} numberOfLines={2}>
                  {subtask.title}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={s.addSubtaskRow}>
              <FontAwesome name="plus" size={12} color={Colors.textFaint} />
              <TextInput
                style={s.addSubtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Add child issue..."
                placeholderTextColor={Colors.textFaint}
                returnKeyType="done"
                onSubmitEditing={() => { if (newSubtask.trim()) subtaskMutation.mutate(newSubtask.trim()); }}
              />
              {newSubtask.trim().length > 0 && (
                <TouchableOpacity style={s.addBtn} onPress={() => subtaskMutation.mutate(newSubtask.trim())}>
                  {subtaskMutation.isPending ? (
                    <ActivityIndicator size="small" color={Colors.primaryLight} />
                  ) : (
                    <Text style={s.addBtnText}>Add</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </Section>
        )}

        {/* ════ COMMENTS (Jira-style — always visible, not tabbed) ════ */}
        <View style={s.commentsHeader}>
          <Text style={s.commentsTitle}>Comments</Text>
          <View style={s.commentsSortPill}>
            <Text style={s.commentsSortText}>Newest first</Text>
            <FontAwesome name="arrow-down" size={10} color={Colors.textSecondary} />
          </View>
        </View>

        {issue.comments && issue.comments.length > 0 ? (
          <View style={s.commentsList}>
            {[...issue.comments].reverse().map((comment: Comment) => (
              <View key={comment.id} style={s.commentCard}>
                <View style={s.commentTop}>
                  <Avatar name={comment.author?.name || ''} size={30} />
                  <View style={{ flex: 1 }}>
                    <View style={s.commentNameRow}>
                      <Text style={s.commentAuthor}>{comment.author?.name || 'User'}</Text>
                      <Text style={s.commentTime}>{timeAgo(comment.createdAt)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={s.commentMore}>
                    <FontAwesome name="ellipsis-h" size={13} color={Colors.textFaint} />
                  </TouchableOpacity>
                </View>
                <Text style={s.commentBody}>{comment.content}</Text>
                <View style={s.commentActions}>
                  <TouchableOpacity style={s.commentAction}>
                    <FontAwesome name="thumbs-o-up" size={14} color={Colors.textFaint} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.commentAction}>
                    <FontAwesome name="smile-o" size={14} color={Colors.textFaint} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.commentAction}>
                    <Text style={s.commentReply}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyComments}>
            <Text style={s.emptyCommentsText}>Leave the first comment</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ════ STICKY COMMENT INPUT + @MENTION PICKER ════ */}
      <View style={[s.commentBar, { paddingBottom: insets.bottom + 8 }]}>
        {/* @mention picker — rendered INSIDE commentBar so it moves with the keyboard */}
        {mentionOpen && filteredMembers.length > 0 && (
          <View style={s.mentionPicker}>
            <View style={s.mentionHeader}>
              <FontAwesome name="at" size={11} color={Colors.primaryLight} />
              <Text style={s.mentionHeaderText}>
                {mentionQuery ? `Matching "${mentionQuery}"` : 'Mention someone'}
              </Text>
            </View>
            <ScrollView style={s.mentionList} keyboardShouldPersistTaps="handled">
              {filteredMembers.map((m) => {
                const roleStyle = ROLE_BADGE_STYLE[m.role as keyof typeof ROLE_BADGE_STYLE] || ROLE_BADGE_STYLE.MEMBER;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={s.mentionRow}
                    activeOpacity={0.7}
                    onPress={() => insertMention(m)}
                  >
                    <Avatar name={m.name || m.email || 'U'} size={30} />
                    <View style={s.mentionText}>
                      <Text style={s.mentionName} numberOfLines={1}>{m.name || 'Unnamed'}</Text>
                      <Text style={s.mentionEmail} numberOfLines={1}>{m.email}</Text>
                    </View>
                    {m.role && (
                      <View style={[s.roleBadge, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
                        <Text style={[s.roleBadgeText, { color: roleStyle.color }]}>
                          {roleStyle.label}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View style={s.commentInputRow}>
          <TextInput
            style={s.commentInput}
            value={newComment}
            onChangeText={handleCommentChange}
            placeholder="Add a comment... Type @ to mention"
            placeholderTextColor={Colors.textFaint}
            multiline
          />
          {newComment.trim().length > 0 && (
            <TouchableOpacity
              style={s.sendBtn}
              onPress={() => newComment.trim() && commentMutation.mutate(newComment.trim())}
              disabled={commentMutation.isPending}
            >
              {commentMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <FontAwesome name="send" size={13} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ════ MORE MENU (Jira-style) ════ */}
      <BottomSheet
        visible={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        title=""
        options={[
          { value: 'copy', label: 'Copy link', icon: 'link' as any, color: Colors.textPrimary },
          { value: 'share', label: 'Share', icon: 'share-square-o' as any, color: Colors.textPrimary },
          { value: 'flag', label: 'Flag', icon: 'flag-o' as any, color: Colors.textPrimary },
          { value: 'link', label: 'Link work item', icon: 'external-link' as any, color: Colors.textPrimary },
          { value: 'parent', label: 'Assign to parent work item', icon: 'level-up' as any, color: Colors.textPrimary },
          { value: 'clone', label: 'Clone', icon: 'clone' as any, color: Colors.textPrimary },
          { value: 'child', label: 'Create child work item', icon: 'sitemap' as any, color: Colors.textPrimary },
          { value: 'delete', label: 'Delete', icon: 'trash-o' as any, color: Colors.error },
        ]}
        selected=""
        onSelect={(v) => {
          setShowMoreMenu(false);
          if (v === 'copy') handleCopyLink();
          else if (v === 'share') handleShare();
          else if (v === 'delete') handleDelete();
          else if (v === 'child') { /* focus subtask input */ }
        }}
      />

      {/* ════ BOTTOM SHEETS ════ */}
      <BottomSheet visible={showStatus} onClose={() => setShowStatus(false)} title="Status" options={STATUS_OPTIONS}
        selected={issue.status} onSelect={(v) => updateMutation.mutate({ status: v as TaskStatus })} />
      <BottomSheet visible={showPriority} onClose={() => setShowPriority(false)} title="Priority" options={PRIORITY_OPTIONS}
        selected={issue.priority} onSelect={(v) => updateMutation.mutate({ priority: v as TaskPriority })} />
      <BottomSheet visible={showType} onClose={() => setShowType(false)} title="Type" options={TYPE_OPTIONS}
        selected={issue.type || 'TASK'} onSelect={(v) => updateMutation.mutate({ type: v as TaskType })} />
      <BottomSheet visible={showAssignee} onClose={() => setShowAssignee(false)} title="Assignee" options={assigneeOptions}
        selected={issue.assigneeId || '__unassigned__'}
        onSelect={(v) => updateMutation.mutate({ assigneeId: v === '__unassigned__' ? null : v })} />
      <BottomSheet visible={showDueDate} onClose={() => setShowDueDate(false)} title="Due Date" options={dateOptions}
        selected={issue.dueDate?.split('T')[0] || '__none__'}
        onSelect={(v) => updateMutation.mutate({ dueDate: v === '__none__' ? null : v })} />
    </KeyboardAvoidingView>
  );
}

/* ════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════ */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  centerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  linkText: { fontSize: FontSize.base, color: Colors.primaryLight },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerKey: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  headerActions: { flexDirection: 'row' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 120 },

  /* Key row */
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  keyText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textFaint },

  /* Title + Assignee */
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
  title: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite, lineHeight: 28 },
  unassignedAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgElevated,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },

  /* Status row */
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.sm, borderWidth: 1,
  },
  statusPillText: { fontSize: FontSize.xs, fontWeight: '700' },
  actionBtn: {
    width: 32, height: 32, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.bgElevated, justifyContent: 'center', alignItems: 'center',
  },

  /* Collapsible Section */
  section: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textWhite },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  sectionBody: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },

  /* Detail Field */
  fieldRow: {
    paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginBottom: 4 },
  fieldValue: { flexDirection: 'row', alignItems: 'center' },
  fieldInline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fieldText: { fontSize: FontSize.base, color: Colors.textWhite },
  fieldDim: { fontSize: FontSize.base, color: Colors.textFaint },
  projectDot: {
    width: 22, height: 22, borderRadius: 6, justifyContent: 'center', alignItems: 'center',
  },
  projectDotText: { fontSize: 8, fontWeight: '700', color: '#fff' },

  /* Description */
  descText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 24 },
  descEmpty: { fontSize: FontSize.base, color: Colors.textFaint, fontStyle: 'italic' },

  /* Parent */
  parentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  parentText: { fontSize: FontSize.base, color: Colors.textPrimary },

  /* Labels */
  labelsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  labelChip: {
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  labelChipText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  /* Subtasks */
  subtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  subtaskTitle: { fontSize: FontSize.sm, color: Colors.textPrimary, flex: 1 },
  subtaskDone: { textDecorationLine: 'line-through', color: Colors.textFaint },
  addSubtaskRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md, marginTop: Spacing.xs,
  },
  addSubtaskInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, padding: 0 },
  addBtn: {
    backgroundColor: Colors.primary + '20', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primaryLight },

  /* Comments header */
  commentsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  commentsTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textWhite },
  commentsSortPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
  },
  commentsSortText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  /* Comment cards */
  commentsList: { gap: Spacing.md },
  commentCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
  },
  commentTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  commentNameRow: { flex: 1 },
  commentAuthor: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  commentTime: { fontSize: FontSize.xs, color: Colors.textFaint },
  commentMore: { padding: 4 },
  commentBody: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.md },
  commentAction: {},
  commentReply: { fontSize: FontSize.sm, color: Colors.textFaint, fontWeight: '500' },

  /* Empty comments */
  emptyComments: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyCommentsText: { fontSize: FontSize.sm, color: Colors.textFaint },

  /* Sticky comment bar — vertical stack: [picker if open] + [input row] */
  commentBar: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
  },
  commentInput: {
    flex: 1, fontSize: FontSize.base, color: Colors.textWhite,
    paddingVertical: Spacing.sm, maxHeight: 80,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },

  /* @mention picker (rendered inside commentBar, sits above the TextInput) */
  mentionPicker: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    maxHeight: 220,
  },
  mentionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.bgElevated,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mentionHeaderText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  mentionList: { maxHeight: 200 },
  mentionRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mentionText: { flex: 1 },
  mentionName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  mentionEmail: { fontSize: 11, color: Colors.textFaint },
  roleBadge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
