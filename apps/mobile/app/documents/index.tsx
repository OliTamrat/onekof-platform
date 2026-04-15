import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, SearchBar, FilterChips } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TYPE_FILTERS = [
  { label: 'Docs', value: 'DOCUMENT' },
  { label: 'Wiki', value: 'WIKI' },
  { label: 'Templates', value: 'TEMPLATE' },
  { label: 'Shared', value: 'SHARED' },
];

interface Document {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  createdBy?: { name: string };
  content?: string;
}

const DOC_ICONS: Record<string, { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }> = {
  DOCUMENT: { icon: 'file-text-o', color: Colors.info },
  WIKI: { icon: 'book', color: Colors.violet },
  TEMPLATE: { icon: 'copy', color: Colors.warning },
  SHARED: { icon: 'share-alt', color: Colors.success },
};

export default function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => apiFetch<{ documents: Document[] }>('/api/documents').catch(() => ({ documents: [] })),
  });

  const documents = (data?.documents || []).filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Documents" showBack />
      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search documents..." />
      </View>
      <FilterChips options={TYPE_FILTERS} selected={typeFilter} onSelect={setTypeFilter} />

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          renderItem={({ item }) => {
            const docStyle = DOC_ICONS[item.type] || DOC_ICONS.DOCUMENT;
            return (
              <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                <View style={[styles.docIcon, { backgroundColor: docStyle.color + '15' }]}>
                  <FontAwesome name={docStyle.icon} size={18} color={docStyle.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.docMeta}>
                    {item.createdBy?.name || 'Unknown'} - Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="file-text-o" title="No documents" description="Documents and wikis will appear here" />
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
  docIcon: {
    width: 44, height: 44, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  docTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  docMeta: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
});
