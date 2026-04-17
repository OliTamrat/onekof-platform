import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton } from '../../src/components';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  joinedAt: string;
}

interface TeamDetail {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  memberCount: number;
  projectCount: number;
  members: TeamMember[];
}

const ROLE_CFG: Record<string, { color: string; bg: string; label: string }> = {
  LEAD:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Lead' },
  MEMBER: { color: Colors.textSecondary, bg: Colors.bgElevated, label: 'Member' },
};

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['team', id],
    queryFn: () => apiFetch<{ team: TeamDetail }>(`/api/teams/${id}`),
    enabled: !!id,
  });

  const team = data?.team;
  const members = team?.members || [];

  const addMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch(`/api/teams/${id}/members`, {
        method: 'POST',
        body: JSON.stringify({ userEmail: email }),
      }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowAddModal(false);
      setAddEmail('');
      if (res?.invited) {
        Alert.alert('Invitation sent', res.message || 'An invitation email has been sent.');
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not add member');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      apiFetch(`/api/teams/${id}/members/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not remove member');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const confirmRemove = (member: TeamMember) => {
    Alert.alert(
      'Remove member',
      `Remove ${member.name} from this team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate(member.userId) },
      ],
    );
  };

  const handleAdd = () => {
    const email = addEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    addMutation.mutate(email);
  };

  return (
    <View style={s.container}>
      <ScreenHeader title={team?.name || 'Team'} showBack />

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* Team info card */}
            {team && (
              <View style={s.infoCard}>
                <View style={[s.teamIcon, { backgroundColor: (team.color || Colors.primary) + '15' }]}>
                  <FontAwesome name="users" size={22} color={team.color || Colors.primaryLight} />
                </View>
                {team.description && (
                  <Text style={s.teamDesc}>{team.description}</Text>
                )}
                <View style={s.statRow}>
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{team.memberCount}</Text>
                    <Text style={s.statLabel}>Members</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{team.projectCount}</Text>
                    <Text style={s.statLabel}>Projects</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Members header + add button */}
            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>MEMBERS</Text>
              <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
                <FontAwesome name="plus" size={10} color="#fff" />
                <Text style={s.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const roleCfg = ROLE_CFG[item.role] || ROLE_CFG.MEMBER;
          return (
            <View style={s.memberCard}>
              <Avatar name={item.name || item.email} size={38} />
              <View style={s.memberBody}>
                <Text style={s.memberName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.memberEmail} numberOfLines={1}>{item.email}</Text>
              </View>
              <View style={[s.roleBadge, { backgroundColor: roleCfg.bg }]}>
                <Text style={[s.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
              </View>
              {item.role !== 'LEAD' && (
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => confirmRemove(item)}
                  hitSlop={8}
                >
                  <FontAwesome name="times" size={14} color={Colors.textFaint} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={4} /> :
          <EmptyState icon="users" title="No members" description="Add members to this team" />
        }
      />

      {/* ═══ Add Member Modal ═══ */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowAddModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={s.dragHandle} />
              <Text style={s.modalTitle}>Add Team Member</Text>
              <Text style={s.modalHint}>
                Enter the email of an organization member. If they're not in the org yet, an invitation will be sent.
              </Text>

              <TextInput
                style={s.emailInput}
                placeholder="member@example.com"
                placeholderTextColor={Colors.textFaint}
                value={addEmail}
                onChangeText={setAddEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowAddModal(false); setAddEmail(''); }}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.saveBtn, addMutation.isPending && { opacity: 0.6 }]}
                  onPress={handleAdd}
                  disabled={addMutation.isPending}
                >
                  <Text style={s.saveBtnText}>
                    {addMutation.isPending ? 'Adding...' : 'Add Member'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  /* ── Team info card ── */
  infoCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md,
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  teamIcon: {
    width: 56, height: 56, borderRadius: BorderRadius.xl,
    justifyContent: 'center', alignItems: 'center',
  },
  teamDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite },
  statLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  /* ── Section header ── */
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textFaint,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  addBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  /* ── Member card ── */
  memberCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.md,
  },
  memberBody: { flex: 1, gap: 2 },
  memberName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite },
  memberEmail: { fontSize: FontSize.xs, color: Colors.textFaint },
  roleBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roleText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  removeBtn: {
    width: 28, height: 28, borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgElevated, justifyContent: 'center', alignItems: 'center',
  },

  /* ═══ Modal ═══ */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  dragHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.textFaint, alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  modalHint: {
    fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  emailInput: {
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row', gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
