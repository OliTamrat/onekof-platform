import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import {
  STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG,
  type Project, type User, type TaskStatus, type TaskPriority, type TaskType, type CreateIssuePayload,
} from '../../src/types';
import { BottomSheet } from '../../src/components/BottomSheet';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { successNotification, errorNotification } from '../../src/lib/haptics';

// ─── Selector Options ────────────────────────────────────────────────────────

const TYPE_OPTIONS = (['TASK', 'STORY', 'BUG', 'EPIC'] as const).map((t) => ({
  value: t,
  label: TYPE_CONFIG[t].label,
  icon: TYPE_CONFIG[t].icon as any,
  color: TYPE_CONFIG[t].color,
}));

const STATUS_OPTIONS = (['BACKLOG', 'TODO', 'IN_PROGRESS'] as const).map((s) => ({
  value: s,
  label: STATUS_CONFIG[s].label,
  icon: STATUS_CONFIG[s].icon as any,
  color: STATUS_CONFIG[s].color,
}));

const PRIORITY_OPTIONS = (['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'] as const).map((p) => ({
  value: p,
  label: PRIORITY_CONFIG[p].label,
  icon: PRIORITY_CONFIG[p].icon as any,
  color: PRIORITY_CONFIG[p].color,
}));

// ─── Date Helpers ────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function generateDateOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  // Today, Tomorrow, This week, Next week, In 2 weeks, In 1 month, In 3 months
  const presets = [
    { days: 0, label: 'Today' },
    { days: 1, label: 'Tomorrow' },
    { days: 3, label: 'In 3 days' },
    { days: 7, label: 'Next week' },
    { days: 14, label: 'In 2 weeks' },
    { days: 30, label: 'In 1 month' },
    { days: 90, label: 'In 3 months' },
  ];
  for (const p of presets) {
    const d = new Date(today);
    d.setDate(d.getDate() + p.days);
    options.push({ value: d.toISOString().split('T')[0], label: `${p.label} (${formatDate(d)})` });
  }
  return options;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateIssueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ projectId?: string }>();

  // ── Form State ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(params.projectId || '');
  const [type, setType] = useState<TaskType>('TASK');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [estimate, setEstimate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');

  // ── Sheet Visibility ──
  const [showProject, setShowProject] = useState(false);
  const [showType, setShowType] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [showAssignee, setShowAssignee] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);

  // ── Data Queries ──
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: Project[] }>('/api/projects'),
  });

  const { data: membersData } = useQuery({
    queryKey: ['project-members', selectedProject],
    queryFn: () => apiFetch<{ members: Array<{ user: User; userId: string }> }>(`/api/projects/${selectedProject}/members`),
    enabled: !!selectedProject,
  });

  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];
  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const selectedAssignee = members.find((m) => m.userId === assigneeId);

  const projectOptions = useMemo(() =>
    projects.map((p) => ({
      value: p.id,
      label: `${p.name} (${p.key})`,
      color: p.color || Colors.primary,
    })), [projects],
  );

  const assigneeOptions = useMemo(() => [
    { value: '__unassigned__', label: 'Unassigned', icon: 'user-o' as any, color: Colors.textFaint },
    ...members.map((m) => ({
      value: m.userId,
      label: m.user?.name || m.user?.email || 'Unknown',
      icon: 'user' as any,
      color: Colors.primaryLight,
    })),
  ], [members]);

  const dateOptions = useMemo(() => [
    { value: '__none__', label: 'No due date', icon: 'times' as any, color: Colors.textFaint },
    ...generateDateOptions().map((d) => ({ ...d, icon: 'calendar' as any, color: Colors.info })),
  ], []);

  // ── Create Mutation ──
  const createMutation = useMutation({
    mutationFn: (data: CreateIssuePayload) =>
      apiFetch('/api/issues', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      successNotification();
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['project-issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-issues'] });
      router.back();
    },
    onError: (error: Error) => {
      errorNotification();
      Alert.alert('Failed to create issue', error.message || 'Please try again.');
    },
  });

  // ── Handlers ──
  const handleCreate = () => {
    if (!title.trim() || !selectedProject) return;

    const payload: CreateIssuePayload = {
      projectId: selectedProject,
      title: title.trim(),
      type,
      status,
      priority,
    };
    if (description.trim()) payload.description = description.trim();
    if (assigneeId) payload.assigneeId = assigneeId;
    if (dueDate) payload.dueDate = dueDate;
    if (estimate && Number(estimate) > 0) payload.estimate = Number(estimate);
    if (labels.length > 0) payload.labels = labels;

    createMutation.mutate(payload);
  };

  const addLabel = () => {
    const val = labelInput.trim();
    if (val && !labels.includes(val)) {
      setLabels([...labels, val]);
    }
    setLabelInput('');
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const canCreate = title.trim().length > 0 && !!selectedProject;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.typeIndicator, { backgroundColor: TYPE_CONFIG[type].color }]} />
          <Text style={styles.headerTitle}>New {TYPE_CONFIG[type].label}</Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!canCreate || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ── Error ── */}
        {createMutation.isError && (
          <View style={styles.errorBox}>
            <FontAwesome name="exclamation-circle" size={14} color={Colors.error} />
            <Text style={styles.errorText}>
              {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create issue'}
            </Text>
          </View>
        )}

        {/* ── Title ── */}
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Issue title"
          placeholderTextColor={Colors.textFaint}
          autoFocus
          returnKeyType="next"
        />

        {/* ── Description ── */}
        <TextInput
          style={styles.descInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor={Colors.textFaint}
          multiline
          textAlignVertical="top"
        />

        {/* ── Details Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* Project */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowProject(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name="folder-o" size={14} color={Colors.textFaint} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Project</Text>
            </View>
            <View style={styles.fieldRight}>
              {selectedProjectData ? (
                <View style={styles.fieldValue}>
                  <View style={[styles.dot, { backgroundColor: selectedProjectData.color || Colors.primary }]} />
                  <Text style={styles.fieldValueText} numberOfLines={1}>{selectedProjectData.name}</Text>
                </View>
              ) : (
                <Text style={styles.fieldPlaceholder}>Required</Text>
              )}
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>

          {/* Type */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowType(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name={TYPE_CONFIG[type].icon as any} size={14} color={TYPE_CONFIG[type].color} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Type</Text>
            </View>
            <View style={styles.fieldRight}>
              <View style={[styles.badge, { backgroundColor: TYPE_CONFIG[type].color + '15' }]}>
                <Text style={[styles.badgeText, { color: TYPE_CONFIG[type].color }]}>{TYPE_CONFIG[type].label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>

          {/* Status */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowStatus(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name={STATUS_CONFIG[status].icon as any} size={14} color={STATUS_CONFIG[status].color} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Status</Text>
            </View>
            <View style={styles.fieldRight}>
              <View style={[styles.badge, { backgroundColor: STATUS_CONFIG[status].bg }]}>
                <Text style={[styles.badgeText, { color: STATUS_CONFIG[status].color }]}>{STATUS_CONFIG[status].label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>

          {/* Priority */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowPriority(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name={PRIORITY_CONFIG[priority].icon as any} size={14} color={PRIORITY_CONFIG[priority].color} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Priority</Text>
            </View>
            <View style={styles.fieldRight}>
              <View style={[styles.badge, { backgroundColor: PRIORITY_CONFIG[priority].bg }]}>
                <Text style={[styles.badgeText, { color: PRIORITY_CONFIG[priority].color }]}>{PRIORITY_CONFIG[priority].label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── People Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People</Text>

          {/* Assignee */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowAssignee(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name="user-o" size={14} color={Colors.textFaint} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Assignee</Text>
            </View>
            <View style={styles.fieldRight}>
              {selectedAssignee ? (
                <View style={styles.fieldValue}>
                  <Avatar name={selectedAssignee.user?.name || ''} size={20} />
                  <Text style={styles.fieldValueText} numberOfLines={1}>
                    {selectedAssignee.user?.name || selectedAssignee.user?.email}
                  </Text>
                </View>
              ) : (
                <Text style={styles.fieldPlaceholder}>Unassigned</Text>
              )}
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Schedule Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>

          {/* Due Date */}
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDueDate(true)}>
            <View style={styles.fieldLeft}>
              <FontAwesome name="calendar-o" size={14} color={Colors.textFaint} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Due Date</Text>
            </View>
            <View style={styles.fieldRight}>
              {dueDate ? (
                <Text style={styles.fieldValueText}>{formatDate(new Date(dueDate + 'T00:00:00'))}</Text>
              ) : (
                <Text style={styles.fieldPlaceholder}>None</Text>
              )}
              <FontAwesome name="chevron-right" size={10} color={Colors.textFaint} />
            </View>
          </TouchableOpacity>

          {/* Estimate */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <FontAwesome name="clock-o" size={14} color={Colors.textFaint} style={styles.fieldIcon} />
              <Text style={styles.fieldLabel}>Estimate</Text>
            </View>
            <View style={styles.fieldRight}>
              <TextInput
                style={styles.inlineInput}
                value={estimate}
                onChangeText={(t) => setEstimate(t.replace(/[^0-9.]/g, ''))}
                placeholder="hours"
                placeholderTextColor={Colors.textFaint}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* ── Labels Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Labels</Text>
          <View style={styles.labelInputRow}>
            <TextInput
              style={styles.labelTextInput}
              value={labelInput}
              onChangeText={setLabelInput}
              placeholder="Add a label..."
              placeholderTextColor={Colors.textFaint}
              returnKeyType="done"
              onSubmitEditing={addLabel}
            />
            {labelInput.trim().length > 0 && (
              <TouchableOpacity style={styles.labelAddBtn} onPress={addLabel}>
                <FontAwesome name="plus" size={12} color={Colors.primaryLight} />
              </TouchableOpacity>
            )}
          </View>
          {labels.length > 0 && (
            <View style={styles.labelsWrap}>
              {labels.map((label) => (
                <View key={label} style={styles.labelChip}>
                  <Text style={styles.labelChipText}>{label}</Text>
                  <TouchableOpacity onPress={() => removeLabel(label)} hitSlop={4}>
                    <FontAwesome name="times" size={10} color={Colors.textFaint} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <BottomSheet
        visible={showProject}
        onClose={() => setShowProject(false)}
        title="Select Project"
        options={projectOptions}
        selected={selectedProject}
        onSelect={(v) => {
          setSelectedProject(v);
          setAssigneeId(null); // reset assignee when project changes
        }}
      />
      <BottomSheet
        visible={showType}
        onClose={() => setShowType(false)}
        title="Issue Type"
        options={TYPE_OPTIONS}
        selected={type}
        onSelect={(v) => setType(v as TaskType)}
      />
      <BottomSheet
        visible={showStatus}
        onClose={() => setShowStatus(false)}
        title="Status"
        options={STATUS_OPTIONS}
        selected={status}
        onSelect={(v) => setStatus(v as TaskStatus)}
      />
      <BottomSheet
        visible={showPriority}
        onClose={() => setShowPriority(false)}
        title="Priority"
        options={PRIORITY_OPTIONS}
        selected={priority}
        onSelect={(v) => setPriority(v as TaskPriority)}
      />
      <BottomSheet
        visible={showAssignee}
        onClose={() => setShowAssignee(false)}
        title="Assignee"
        options={assigneeOptions}
        selected={assigneeId || '__unassigned__'}
        onSelect={(v) => setAssigneeId(v === '__unassigned__' ? null : v)}
      />
      <BottomSheet
        visible={showDueDate}
        onClose={() => setShowDueDate(false)}
        title="Due Date"
        options={dateOptions}
        selected={dueDate || '__none__'}
        onSelect={(v) => setDueDate(v === '__none__' ? null : v)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.bg, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeIndicator: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  createBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, minWidth: 72, alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.35 },
  createBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: '#fff' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginHorizontal: Spacing.xl, marginTop: Spacing.lg,
  },
  errorText: { fontSize: FontSize.sm, color: '#FCA5A5', flex: 1 },

  // Title & Description (hero inputs)
  titleInput: {
    fontSize: FontSize.xl, fontWeight: '600', color: Colors.textWhite,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'], paddingBottom: Spacing.sm,
    minHeight: 48,
  },
  descInput: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl,
    minHeight: 60, lineHeight: 22,
  },

  // Sections
  section: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm,
  },

  // Field Rows
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    minHeight: 48,
  },
  fieldLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  fieldIcon: { width: 18, textAlign: 'center' },
  fieldLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  fieldRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1, justifyContent: 'flex-end' },
  fieldValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fieldValueText: { fontSize: FontSize.sm, color: Colors.textPrimary, maxWidth: 160 },
  fieldPlaceholder: { fontSize: FontSize.sm, color: Colors.textFaint },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Badge
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },

  // Inline input (estimate)
  inlineInput: {
    fontSize: FontSize.sm, color: Colors.textPrimary,
    textAlign: 'right', minWidth: 60, paddingVertical: 0,
  },

  // Labels
  labelInputRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
  },
  labelTextInput: {
    flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  labelAddBtn: {
    width: 28, height: 28, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center',
  },
  labelsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
  },
  labelChip: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  labelChipText: { fontSize: FontSize.xs, color: Colors.textPrimary },
});
