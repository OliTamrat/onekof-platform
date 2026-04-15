import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, Avatar, ListSkeleton, SearchBar } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Team {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  lead?: { id: string; name: string };
  members?: Array<{ id: string; name: string }>;
}

export default function TeamsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiFetch<{ teams: Team[] }>('/api/teams').catch(() => ({ teams: [] })),
  });

  const teams = (data?.teams || []).filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Teams" showBack />
      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search teams..." />
      </View>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.teamIcon}>
                <FontAwesome name="users" size={18} color={Colors.primaryLight} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.teamName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.teamDesc} numberOfLines={1}>{item.description}</Text>
                )}
                <View style={styles.teamMeta}>
                  <FontAwesome name="user" size={10} color={Colors.textFaint} />
                  <Text style={styles.metaText}>
                    {item.memberCount || item.members?.length || 0} members
                  </Text>
                  {item.lead && (
                    <>
                      <Text style={styles.metaDot}>-</Text>
                      <Text style={styles.metaText}>Lead: {item.lead.name}</Text>
                    </>
                  )}
                </View>
              </View>
              <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="users" title="No teams" description="Teams will appear here when created" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchRow: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  list: { padding: Spacing.xl, gap: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  teamIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  teamName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  teamDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  teamMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.sm },
  metaText: { fontSize: FontSize.xs, color: Colors.textFaint },
  metaDot: { color: Colors.textFaint, fontSize: FontSize.xs },
});
