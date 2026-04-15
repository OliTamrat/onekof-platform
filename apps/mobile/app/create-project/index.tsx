import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, BottomSheet } from '../../src/components';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', icon: 'globe' as const },
  { value: 'INTERNAL', label: 'Internal', icon: 'building' as const },
  { value: 'PRIVATE', label: 'Private', icon: 'lock' as const },
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('INTERNAL');
  const [showVisibility, setShowVisibility] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name, key: key.toUpperCase(), description, visibility }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.back();
    },
  });

  const autoKey = (text: string) => {
    setName(text);
    if (!key || key === name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)) {
      setKey(text.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4));
    }
  };

  const canSubmit = name.trim().length > 1 && key.trim().length >= 2;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="New Project" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={autoKey}
            placeholder="e.g., Marketing Campaign"
            placeholderTextColor={Colors.textFaint}
            autoFocus
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Project Key</Text>
          <TextInput
            style={styles.input}
            value={key}
            onChangeText={(t) => setKey(t.toUpperCase())}
            placeholder="e.g., MKTG"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="characters"
            maxLength={6}
          />
          <Text style={styles.hint}>2-6 uppercase letters, used as issue prefix</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What is this project about?"
            placeholderTextColor={Colors.textFaint}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Visibility</Text>
          <TouchableOpacity style={styles.selectBtn} onPress={() => setShowVisibility(true)}>
            <Text style={styles.selectText}>
              {VISIBILITY_OPTIONS.find((v) => v.value === visibility)?.label || 'Select'}
            </Text>
            <Text style={styles.selectChevron}>&#9662;</Text>
          </TouchableOpacity>
        </View>

        {createMutation.isError && (
          <Text style={styles.errorText}>
            {(createMutation.error as Error)?.message || 'Failed to create project'}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={() => canSubmit && createMutation.mutate()}
          disabled={!canSubmit || createMutation.isPending}
          activeOpacity={0.8}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Project</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomSheet
        visible={showVisibility}
        onClose={() => setShowVisibility(false)}
        title="Visibility"
        options={VISIBILITY_OPTIONS}
        selected={visibility}
        onSelect={setVisibility}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: Spacing['5xl'] },
  field: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite,
  },
  textArea: { minHeight: 100 },
  hint: { fontSize: FontSize.xs, color: Colors.textFaint },
  selectBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  selectText: { fontSize: FontSize.base, color: Colors.textPrimary },
  selectChevron: { color: Colors.textFaint },
  errorText: { fontSize: FontSize.sm, color: Colors.error, textAlign: 'center' },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: FontSize.base, fontWeight: '600', color: '#fff' },
});
