import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: Colors.info },
  { value: 'MEDIUM', label: 'Medium', color: Colors.warning },
  { value: 'HIGH', label: 'High', color: '#F97316' },
  { value: 'CRITICAL', label: 'Critical', color: Colors.error },
];

export default function CreateIssueScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [priority, setPriority] = useState('MEDIUM');
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<{ projects: any[] }>('/api/projects'),
  });

  const projects = projectsData?.projects || [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.back();
    },
  });

  const handleCreate = () => {
    if (!title.trim() || !selectedProject) return;

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: selectedProject,
      priority,
      status: 'TODO',
    });
  };

  const selectedProjectData = projects.find((p: any) => p.id === selectedProject);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Issue</Text>
        <TouchableOpacity
          style={[styles.createBtn, (!title.trim() || !selectedProject) && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || !selectedProject || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.createBtnText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error */}
        {createMutation.isError && (
          <View style={styles.errorBox}>
            <FontAwesome name="exclamation-circle" size={14} color={Colors.error} />
            <Text style={styles.errorText}>
              {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create issue'}
            </Text>
          </View>
        )}

        {/* Project Selector */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Project *</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowProjectPicker(!showProjectPicker)}
          >
            {selectedProjectData ? (
              <View style={styles.selectorContent}>
                <View style={[styles.projectDot, { backgroundColor: selectedProjectData.color || Colors.primary }]} />
                <Text style={styles.selectorText}>{selectedProjectData.name}</Text>
              </View>
            ) : (
              <Text style={styles.selectorPlaceholder}>Select project</Text>
            )}
            <FontAwesome name="caret-down" size={12} color={Colors.textFaint} />
          </TouchableOpacity>

          {showProjectPicker && (
            <View style={styles.pickerDropdown}>
              {projects.map((project: any) => (
                <TouchableOpacity
                  key={project.id}
                  style={[styles.pickerItem, selectedProject === project.id && styles.pickerItemActive]}
                  onPress={() => {
                    setSelectedProject(project.id);
                    setShowProjectPicker(false);
                  }}
                >
                  <View style={[styles.projectDot, { backgroundColor: project.color || Colors.primary }]} />
                  <Text style={styles.pickerItemText}>{project.name}</Text>
                  <Text style={styles.pickerItemKey}>{project.key}</Text>
                  {selectedProject === project.id && (
                    <FontAwesome name="check" size={12} color={Colors.primaryLight} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={Colors.textFaint}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details..."
            placeholderTextColor={Colors.textFaint}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.priorityBtn,
                  priority === opt.value && { backgroundColor: opt.color + '15', borderColor: opt.color + '40' },
                ]}
                onPress={() => setPriority(opt.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: opt.color }]} />
                <Text style={[
                  styles.priorityText,
                  priority === opt.value && { color: opt.color },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cancelBtn: { paddingVertical: Spacing.sm },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  headerTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  createBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, gap: Spacing.xl },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: BorderRadius.md, padding: Spacing.lg,
  },
  errorText: { fontSize: FontSize.sm, color: '#FCA5A5', flex: 1 },
  field: { gap: Spacing.sm },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite,
  },
  textArea: { minHeight: 100, paddingTop: Spacing.md },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  selectorContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  projectDot: { width: 8, height: 8, borderRadius: 4 },
  selectorText: { fontSize: FontSize.base, color: Colors.textWhite },
  selectorPlaceholder: { fontSize: FontSize.base, color: Colors.textFaint },
  pickerDropdown: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.xs,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pickerItemActive: { backgroundColor: Colors.primary + '10' },
  pickerItemText: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  pickerItemKey: { fontSize: FontSize.xs, color: Colors.textFaint },
  priorityRow: { flexDirection: 'row', gap: Spacing.sm },
  priorityBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textSecondary },
});
