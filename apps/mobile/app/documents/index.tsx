import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, Alert, Platform, ActivityIndicator } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch, apiUpload } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, SearchBar } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Types ─── */
interface Document {
  id: string;
  title?: string;
  name?: string;
  fileName?: string;
  type: string;
  fileType?: string;
  updatedAt?: string;
  createdAt?: string;
  uploadedAt?: string;
  createdBy?: { name?: string; email?: string };
  author?: { name?: string; email?: string };
  content?: string;
  size?: number;
  fileSize?: number;
  status?: string;
}

/* ─── Filter chips ─── */
const TYPE_FILTERS = [
  { key: undefined as string | undefined, label: 'All', icon: 'th-large' },
  { key: 'DOCUMENT', label: 'Docs', icon: 'file-text-o' },
  { key: 'WIKI', label: 'Wiki', icon: 'book' },
  { key: 'TEMPLATE', label: 'Templates', icon: 'copy' },
  { key: 'SHARED', label: 'Shared', icon: 'share-alt' },
];

/* ─── Document type config ─── */
const DOC_TYPE: Record<string, { icon: string; color: string; label: string }> = {
  DOCUMENT: { icon: 'file-text-o', color: '#3B82F6', label: 'Document' },
  WIKI: { icon: 'book', color: '#8B5CF6', label: 'Wiki' },
  TEMPLATE: { icon: 'copy', color: '#F59E0B', label: 'Template' },
  SHARED: { icon: 'share-alt', color: '#22C55E', label: 'Shared' },
  invoice: { icon: 'file-text-o', color: '#3B82F6', label: 'Invoice' },
  receipt: { icon: 'file-text-o', color: '#F59E0B', label: 'Receipt' },
  contract: { icon: 'file-text-o', color: '#8B5CF6', label: 'Contract' },
  report: { icon: 'file-text-o', color: '#22C55E', label: 'Report' },
  other: { icon: 'file-o', color: Colors.textSecondary, label: 'File' },
};

/* ─── Status config ─── */
const STATUS_CFG: Record<string, { color: string; label: string }> = {
  PROCESSING: { color: '#F59E0B', label: 'Processing' },
  COMPLETED: { color: '#22C55E', label: 'Ready' },
  FAILED: { color: '#EF4444', label: 'Failed' },
};

/* ─── Relative time ─── */
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DocumentsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => apiFetch('/api/documents').catch(() => ({ documents: [] })),
  });

  const allDocs: Document[] = (data as any)?.documents || (data as any)?.articles || [];

  const filtered = useMemo(() => {
    return allDocs.filter((d) => {
      const title = d.title || d.name || d.fileName || '';
      const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || d.type === typeFilter || d.fileType === typeFilter;
      return matchSearch && matchType;
    });
  }, [allDocs, search, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    allDocs.forEach((d) => { byType[d.type] = (byType[d.type] || 0) + 1; });
    return { total: allDocs.length, byType };
  }, [allDocs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      } as any);

      await apiUpload('/api/documents/upload', formData);

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      Alert.alert('Uploaded', `${asset.name} uploaded successfully. AI processing will begin shortly.`);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Could not upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Documents" showBack />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* Search + upload button */}
            <View style={s.searchRow}>
              <View style={s.searchWrap}>
                <SearchBar value={search} onChangeText={setSearch} placeholder="Search documents..." />
              </View>
              <TouchableOpacity
                style={[s.uploadBtn, uploading && { opacity: 0.6 }]}
                onPress={pickAndUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome name="cloud-upload" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Filter chips — compact horizontal row */}
            <View style={s.filterRow}>
              {TYPE_FILTERS.map((f) => {
                const active = typeFilter === f.key;
                const count = f.key ? (stats.byType[f.key] || 0) : stats.total;
                return (
                  <TouchableOpacity
                    key={f.key ?? 'all'}
                    style={[s.filterChip, active && s.filterChipActive]}
                    onPress={() => setTypeFilter(f.key)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name={f.icon as any} size={10} color={active ? '#fff' : Colors.textSecondary} />
                    <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{f.label}</Text>
                    {count > 0 && (
                      <View style={[s.filterBadge, active && s.filterBadgeActive]}>
                        <Text style={[s.filterBadgeText, active && s.filterBadgeTextActive]}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Summary stat bar */}
            {stats.total > 0 && (
              <View style={s.statBar}>
                <Text style={s.statBarText}>
                  {typeFilter ? `${filtered.length} ${DOC_TYPE[typeFilter]?.label || ''} documents` : `${stats.total} documents`}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const docType = item.fileType || item.type || 'other';
          const docCfg = DOC_TYPE[docType] || DOC_TYPE[item.type] || DOC_TYPE.other;
          const title = item.title || item.name || item.fileName || 'Untitled';
          const author = item.createdBy?.name || item.createdBy?.email || item.author?.name || item.author?.email || '';
          const updated = timeAgo(item.updatedAt || item.uploadedAt || item.createdAt);
          const statusCfg = item.status ? STATUS_CFG[item.status] : null;

          return (
            <TouchableOpacity style={s.card} activeOpacity={0.7}>
              {/* Doc type icon */}
              <View style={[s.docIconBox, { backgroundColor: docCfg.color + '15' }]}>
                <FontAwesome name={docCfg.icon as any} size={18} color={docCfg.color} />
              </View>

              {/* Content */}
              <View style={s.cardBody}>
                <Text style={s.docTitle} numberOfLines={2}>{title}</Text>
                <View style={s.docMeta}>
                  {/* Type badge */}
                  <View style={[s.typeBadge, { backgroundColor: docCfg.color + '12', borderColor: docCfg.color + '30' }]}>
                    <Text style={[s.typeBadgeText, { color: docCfg.color }]}>{docCfg.label}</Text>
                  </View>
                  {/* Status badge if processing */}
                  {statusCfg && item.status !== 'COMPLETED' && (
                    <View style={[s.typeBadge, { backgroundColor: statusCfg.color + '12', borderColor: statusCfg.color + '30' }]}>
                      <Text style={[s.typeBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                  )}
                  {/* Author + time */}
                  {(author || updated) && (
                    <Text style={s.metaText}>
                      {author}{author && updated ? ' · ' : ''}{updated}
                    </Text>
                  )}
                </View>
              </View>

              <FontAwesome name="chevron-right" size={11} color={Colors.textFaint} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={5} /> :
          <EmptyState
            icon="file-text-o"
            title={search ? 'No matching documents' : 'No documents yet'}
            description={search ? 'Try a different search term' : 'Tap the upload button to add documents'}
          />
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingBottom: 100 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  searchWrap: { flex: 1 },
  uploadBtn: {
    width: 42, height: 42, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Filter chips — compact inline row */
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  filterBadge: {
    minWidth: 16, height: 16, paddingHorizontal: 4,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },
  filterBadgeTextActive: { color: '#fff' },

  /* Stat bar */
  statBar: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  statBarText: { fontSize: FontSize.xs, color: Colors.textFaint },

  /* Document card — Nocturne premium */
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md,
    marginHorizontal: Spacing.xl, marginBottom: Spacing.sm,
  },
  docIconBox: {
    width: 44, height: 44, borderRadius: BorderRadius.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1, gap: 6 },
  docTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textWhite, lineHeight: 20 },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  typeBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  metaText: { fontSize: FontSize.xs, color: Colors.textFaint },
});
