import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/auth-context';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton } from '../../src/components';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  budgetAccess?: string;
}

const ROLE_CFG: Record<string, { color: string; bg: string; label: string }> = {
  OWNER:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Owner' },
  ADMIN:      { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', label: 'Admin' },
  MEMBER:     { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', label: 'Member' },
  CONTRACTOR: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  label: 'Contractor' },
  GUEST:      { color: Colors.textFaint, bg: Colors.bgElevated, label: 'Guest' },
};

export default function MembersScreen() {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['org-members'],
    queryFn: () => apiFetch<{ members: Member[] }>('/api/organization-members').catch(() => ({ members: [] })),
  });

  const members = data?.members || [];

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch('/api/invitations', {
        method: 'POST',
        body: JSON.stringify({ email, role: 'MEMBER' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      setShowInvite(false);
      setInviteEmail('');
      Alert.alert('Invited', 'Invitation email sent successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not send invitation');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid email', 'Please enter a valid email address');
      return;
    }
    inviteMutation.mutate(email);
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Members" showBack />

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* Summary + invite button */}
            <View style={s.headerRow}>
              <View>
                <Text style={s.headerCount}>{members.length}</Text>
                <Text style={s.headerLabel}>Members in {currentOrg?.name || 'organization'}</Text>
              </View>
              <TouchableOpacity style={s.inviteBtn} onPress={() => setShowInvite(true)}>
                <FontAwesome name="plus" size={10} color="#fff" />
                <Text style={s.inviteBtnText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const roleCfg = ROLE_CFG[item.role] || ROLE_CFG.MEMBER;
          return (
            <View style={s.memberCard}>
              <Avatar name={item.name || item.email} size={40} />
              <View style={s.memberBody}>
                <Text style={s.memberName} numberOfLines={1}>{item.name || 'Unnamed'}</Text>
                <Text style={s.memberEmail} numberOfLines={1}>{item.email}</Text>
              </View>
              <View style={[s.roleBadge, { backgroundColor: roleCfg.bg }]}>
                <Text style={[s.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={5} /> :
          <EmptyState icon="users" title="No members" description="Invite members to your organization" />
        }
      />

      {/* ═══ Invite Modal ═══ */}
      <Modal
        visible={showInvite}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInvite(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowInvite(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandle} />
            <Text style={s.modalTitle}>Invite Member</Text>
            <Text style={s.modalHint}>
              Enter their email address. They'll receive an invitation to join {currentOrg?.name || 'the organization'}.
            </Text>

            <TextInput
              style={s.emailInput}
              placeholder="colleague@example.com"
              placeholderTextColor={Colors.textFaint}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowInvite(false); setInviteEmail(''); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.saveBtn, inviteMutation.isPending && { opacity: 0.6 }]}
                onPress={handleInvite}
                disabled={inviteMutation.isPending}
              >
                <Text style={s.saveBtnText}>
                  {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  /* Header */
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerCount: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  headerLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  inviteBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* Member card */
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
    fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  emailInput: {
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    fontSize: FontSize.sm, color: Colors.textWhite,
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
