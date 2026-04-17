import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, SearchBar } from '../../src/components';
import { Avatar } from '../../src/components/Avatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface TeamMember {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  lead?: { id: string; name: string; email?: string; avatar?: string | null };
  members?: TeamMember[];
  color?: string;
}

export default function TeamsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiFetch<{ teams: Team[] }>('/api/teams').catch(() => ({ teams: [] })),
  });

  const allTeams = data?.teams || [];
  const teams = allTeams.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totalMembers = allTeams.reduce((sum, t) => sum + (t.memberCount || t.members?.length || 0), 0);

  return (
    <View style={s.container}>
      <ScreenHeader title="Teams" showBack />

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* Search */}
            <View style={s.searchRow}>
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search teams..." />
            </View>

            {/* Summary stat row */}
            <View style={s.summaryRow}>
              <View style={s.summaryCard}>
                <View style={[s.summaryIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                  <FontAwesome name="users" size={13} color="#3B82F6" />
                </View>
                <Text style={s.summaryValue}>{allTeams.length}</Text>
                <Text style={s.summaryLabel}>Teams</Text>
              </View>
              <View style={s.summaryCard}>
                <View style={[s.summaryIcon, { backgroundColor: 'rgba(28,140,125,0.1)' }]}>
                  <FontAwesome name="user" size={13} color={Colors.primaryLight} />
                </View>
                <Text style={s.summaryValue}>{totalMembers}</Text>
                <Text style={s.summaryLabel}>Members</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const count = item.memberCount || item.members?.length || 0;
          const memberList = item.members || [];
          const displayMembers = memberList.slice(0, 4);
          const overflowCount = Math.max(0, count - displayMembers.length);

          return (
            <TouchableOpacity style={s.card} activeOpacity={0.7} onPress={() => router.push(`/team/${item.id}`)}>
              {/* Team icon */}
              <View style={[s.teamIcon, { backgroundColor: (item.color || Colors.primary) + '15' }]}>
                <FontAwesome name="users" size={18} color={item.color || Colors.primaryLight} />
              </View>

              <View style={s.cardBody}>
                {/* Name + member count */}
                <View style={s.cardTopRow}>
                  <Text style={s.teamName} numberOfLines={1}>{item.name}</Text>
                  <View style={s.memberCountBadge}>
                    <FontAwesome name="user" size={8} color={Colors.textFaint} />
                    <Text style={s.memberCountText}>{count}</Text>
                  </View>
                </View>

                {/* Description */}
                {item.description && (
                  <Text style={s.teamDesc} numberOfLines={2}>{item.description}</Text>
                )}

                {/* Lead */}
                {item.lead && (
                  <View style={s.leadRow}>
                    <View style={s.leadBadge}>
                      <FontAwesome name="star" size={8} color="#F59E0B" />
                      <Text style={s.leadLabel}>Lead</Text>
                    </View>
                    <Avatar name={item.lead.name || ''} size={18} />
                    <Text style={s.leadName} numberOfLines={1}>{item.lead.name}</Text>
                  </View>
                )}

                {/* Member avatar stack */}
                {displayMembers.length > 0 && (
                  <View style={s.avatarStack}>
                    {displayMembers.map((m, i) => (
                      <View key={m.id} style={[s.avatarWrap, { marginLeft: i > 0 ? -8 : 0, zIndex: displayMembers.length - i }]}>
                        <Avatar name={m.name || m.email || 'U'} size={26} />
                      </View>
                    ))}
                    {overflowCount > 0 && (
                      <View style={[s.avatarWrap, s.avatarOverflow, { marginLeft: -8 }]}>
                        <Text style={s.avatarOverflowText}>+{overflowCount}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <FontAwesome name="chevron-right" size={11} color={Colors.textFaint} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={4} /> :
          <EmptyState
            icon="users"
            title={search ? 'No matching teams' : 'No teams yet'}
            description={search ? 'Try a different search' : 'Teams will appear here when created'}
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingBottom: 100 },
  searchRow: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },

  /* ── Summary stats ── */
  summaryRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg,
  },
  summaryIcon: {
    width: 28, height: 28, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 1 },

  /* ── Team card — Nocturne premium ── */
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
  },
  teamIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1, gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite, flex: 1 },
  memberCountBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.full, backgroundColor: Colors.bgElevated,
  },
  memberCountText: { fontSize: 10, fontWeight: '600', color: Colors.textFaint },
  teamDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },

  /* Lead row */
  leadRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leadBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  leadLabel: { fontSize: 9, fontWeight: '700', color: '#F59E0B' },
  leadName: { fontSize: FontSize.xs, color: Colors.textSecondary, maxWidth: 100 },

  /* Avatar stack */
  avatarStack: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  avatarWrap: {
    borderWidth: 2, borderColor: Colors.bgCard, borderRadius: 15,
  },
  avatarOverflow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarOverflowText: { fontSize: 9, fontWeight: '700', color: Colors.textFaint },
});
