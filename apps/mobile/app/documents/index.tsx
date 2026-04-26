import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Pressable, Alert, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch, apiUpload } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton, SearchBar } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLanguage } from '../../src/contexts/language-context';

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
  aiSummary?: string;
  aiConfidence?: number;
  extractedBudgetItems?: any[];
  extractedMilestones?: any[];
}

/* ─── Filter chips ─── */
// fileType values from API: invoice, receipt, contract, report, proposal, rfp, other
const TYPE_FILTERS = [
  { key: undefined as string | undefined, label: 'All', icon: 'th-large', match: undefined as string[] | undefined },
  { key: 'financial', label: 'Financial', icon: 'file-text-o', match: ['invoice', 'receipt'] },
  { key: 'legal', label: 'Legal', icon: 'book', match: ['contract', 'proposal', 'rfp'] },
  { key: 'report', label: 'Reports', icon: 'copy', match: ['report'] },
  { key: 'other', label: 'Other', icon: 'file-o', match: ['other'] },
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
const STATUS_CFG: Record<string, { color: string; statusKey: 'documents.processing' | 'documents.ready' | 'documents.failed' }> = {
  PROCESSING: { color: '#F59E0B', statusKey: 'documents.processing' },
  COMPLETED: { color: '#22C55E', statusKey: 'documents.ready' },
  FAILED: { color: '#EF4444', statusKey: 'documents.failed' },
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
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showAiUpload, setShowAiUpload] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: () => apiFetch('/api/documents').catch(() => ({ documents: [] })),
  });

  const allDocs: Document[] = (data as any)?.documents || (data as any)?.articles || [];

  const activeFilter = TYPE_FILTERS.find((f) => f.key === typeFilter);

  const filtered = useMemo(() => {
    return allDocs.filter((d) => {
      const title = d.title || d.name || d.fileName || '';
      const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
      const ft = (d.fileType || d.type || 'other').toLowerCase();
      const matchType = !activeFilter?.match || activeFilter.match.includes(ft);
      return matchSearch && matchType;
    });
  }, [allDocs, search, activeFilter]);

  // Stats per filter group
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    TYPE_FILTERS.forEach((f) => {
      if (!f.key) { counts['all'] = allDocs.length; return; }
      counts[f.key] = allDocs.filter((d) => {
        const ft = (d.fileType || d.type || 'other').toLowerCase();
        return f.match?.includes(ft);
      }).length;
    });
    return { total: allDocs.length, counts };
  }, [allDocs]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // AI stats
  const aiStats = useMemo(() => {
    const processed = allDocs.filter((d) => d.status === 'COMPLETED').length;
    const processing = allDocs.filter((d) => d.status === 'PROCESSING').length;
    const budgetItems = allDocs.reduce((sum, d) => sum + (d.extractedBudgetItems?.length || 0), 0);
    return { total: allDocs.length, processed, processing, budgetItems };
  }, [allDocs]);

  // AI receipt/invoice analyzer
  const pickAndAnalyze = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setAiAnalyzing(true);
      setShowAiUpload(false);

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      } as any);
      formData.append('documentType', 'receipt');

      const data = await apiUpload('/api/budgets/analyze-receipt', formData);
      setAiResult(data);
      setAiAnalyzing(false);
    } catch (err: any) {
      setAiAnalyzing(false);
      Alert.alert('Analysis failed', err?.message || 'Could not analyze document');
    }
  };

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
      <ScreenHeader title={t('documents.title')} showBack />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        ListHeaderComponent={
          <>
            {/* AI Stats Cards */}
            <View style={s.aiStatsRow}>
              <View style={s.aiStatCard}>
                <FontAwesome name="file-text-o" size={14} color="#3B82F6" />
                <Text style={s.aiStatValue}>{aiStats.total}</Text>
                <Text style={s.aiStatLabel}>Total</Text>
              </View>
              <View style={s.aiStatCard}>
                <FontAwesome name="check-circle" size={14} color="#22C55E" />
                <Text style={s.aiStatValue}>{aiStats.processed}</Text>
                <Text style={s.aiStatLabel}>Processed</Text>
              </View>
              <View style={s.aiStatCard}>
                <FontAwesome name="spinner" size={14} color="#F59E0B" />
                <Text style={s.aiStatValue}>{aiStats.processing}</Text>
                <Text style={s.aiStatLabel}>Processing</Text>
              </View>
              <View style={s.aiStatCard}>
                <FontAwesome name="database" size={14} color={Colors.primaryLight} />
                <Text style={s.aiStatValue}>{aiStats.budgetItems}</Text>
                <Text style={s.aiStatLabel}>Budget Items</Text>
              </View>
            </View>

            {/* AI Analyze Banner */}
            <TouchableOpacity style={s.aiBanner} activeOpacity={0.7} onPress={pickAndAnalyze} disabled={aiAnalyzing}>
              <View style={s.aiBannerIcon}>
                {aiAnalyzing ? (
                  <ActivityIndicator size="small" color={Colors.primaryLight} />
                ) : (
                  <FontAwesome name="magic" size={16} color={Colors.primaryLight} />
                )}
              </View>
              <View style={s.aiBannerText}>
                <Text style={s.aiBannerTitle}>
                  {aiAnalyzing ? 'AI Analyzing...' : 'AI Receipt Analyzer'}
                </Text>
                <Text style={s.aiBannerDesc}>Upload a receipt or invoice for instant AI extraction</Text>
              </View>
              <FontAwesome name="camera" size={14} color={Colors.textFaint} />
            </TouchableOpacity>

            {/* Search + upload button */}
            <View style={s.searchRow}>
              <View style={s.searchWrap}>
                <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
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
                const count = f.key ? (stats.counts[f.key] || 0) : stats.total;
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
                  {typeFilter ? `${filtered.length} ${activeFilter?.label || ''} documents` : `${stats.total} documents`}
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

          const confidence = item.aiConfidence;
          const budgetCount = item.extractedBudgetItems?.length || 0;

          return (
            <TouchableOpacity style={s.card} activeOpacity={0.7} onPress={() => setSelectedDoc(item)}>
              {/* Doc type icon */}
              <View style={[s.docIconBox, { backgroundColor: docCfg.color + '15' }]}>
                <FontAwesome name={docCfg.icon as any} size={18} color={docCfg.color} />
              </View>

              {/* Content */}
              <View style={s.cardBody}>
                <Text style={s.docTitle} numberOfLines={2}>{title}</Text>
                {/* AI summary */}
                {item.aiSummary && (
                  <Text style={s.aiSummaryText} numberOfLines={1}>{item.aiSummary}</Text>
                )}
                <View style={s.docMeta}>
                  {/* Type badge */}
                  <View style={[s.typeBadge, { backgroundColor: docCfg.color + '12', borderColor: docCfg.color + '30' }]}>
                    <Text style={[s.typeBadgeText, { color: docCfg.color }]}>{docCfg.label}</Text>
                  </View>
                  {/* AI confidence badge */}
                  {confidence != null && confidence > 0 && (
                    <View style={[s.typeBadge, { backgroundColor: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.3)' }]}>
                      <Text style={[s.typeBadgeText, { color: '#A78BFA' }]}>AI {confidence}%</Text>
                    </View>
                  )}
                  {/* Budget items count */}
                  {budgetCount > 0 && (
                    <View style={[s.typeBadge, { backgroundColor: Colors.successBg, borderColor: 'rgba(34,197,94,0.3)' }]}>
                      <Text style={[s.typeBadgeText, { color: Colors.success }]}>{budgetCount} items</Text>
                    </View>
                  )}
                  {/* Status badge if processing */}
                  {statusCfg && item.status !== 'COMPLETED' && (
                    <View style={[s.typeBadge, { backgroundColor: statusCfg.color + '12', borderColor: statusCfg.color + '30' }]}>
                      <Text style={[s.typeBadgeText, { color: statusCfg.color }]}>{t(statusCfg.statusKey)}</Text>
                    </View>
                  )}
                </View>
                {/* Author + time */}
                {(author || updated) && (
                  <Text style={s.metaText}>
                    {author}{author && updated ? ' · ' : ''}{updated}
                    {item.fileSize ? ` · ${(item.fileSize / 1024).toFixed(0)} KB` : ''}
                  </Text>
                )}
              </View>

              <FontAwesome name="chevron-right" size={11} color={Colors.textFaint} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          isLoading ? <ListSkeleton count={5} /> :
          <EmptyState
            icon="file-text-o"
            title={search ? t('common.noResults') : t('documents.noDocuments')}
            description={search ? 'Try a different search term' : t('documents.uploadHint')}
          />
        }
      />

      {/* ═══ Document Detail Modal ═══ */}
      <Modal visible={!!selectedDoc} transparent animationType="slide" onRequestClose={() => setSelectedDoc(null)}>
        <Pressable style={s.modalOverlay} onPress={() => setSelectedDoc(null)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandle} />
            {selectedDoc && (() => {
              const docCfg = DOC_TYPE[selectedDoc.fileType || selectedDoc.type || 'other'] || DOC_TYPE.other;
              return (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                  <View style={s.detailHeader}>
                    <View style={[s.detailIcon, { backgroundColor: docCfg.color + '15' }]}>
                      <FontAwesome name={docCfg.icon as any} size={24} color={docCfg.color} />
                    </View>
                    <Text style={s.detailTitle}>{selectedDoc.title || selectedDoc.fileName || 'Untitled'}</Text>
                    <View style={[s.typeBadge, { backgroundColor: docCfg.color + '12', borderColor: docCfg.color + '30' }]}>
                      <Text style={[s.typeBadgeText, { color: docCfg.color }]}>{docCfg.label}</Text>
                    </View>
                  </View>

                  {/* AI Summary */}
                  {selectedDoc.aiSummary && (
                    <View style={s.detailSection}>
                      <View style={s.detailSectionHeader}>
                        <FontAwesome name="magic" size={12} color={Colors.primaryLight} />
                        <Text style={s.detailSectionTitle}>AI Summary</Text>
                        {selectedDoc.aiConfidence != null && (
                          <Text style={s.confidenceText}>{selectedDoc.aiConfidence}% confidence</Text>
                        )}
                      </View>
                      <Text style={s.detailSummary}>{selectedDoc.aiSummary}</Text>
                    </View>
                  )}

                  {/* Extracted budget items */}
                  {(selectedDoc.extractedBudgetItems?.length || 0) > 0 && (
                    <View style={s.detailSection}>
                      <View style={s.detailSectionHeader}>
                        <FontAwesome name="database" size={12} color={Colors.success} />
                        <Text style={s.detailSectionTitle}>Extracted Budget Items</Text>
                      </View>
                      {selectedDoc.extractedBudgetItems?.map((item: any, i: number) => (
                        <View key={i} style={s.extractedItem}>
                          <Text style={s.extractedDesc} numberOfLines={1}>{item.description || item.lineItem || `Item ${i + 1}`}</Text>
                          <Text style={s.extractedAmount}>
                            {item.amount ? `ETB ${Number(item.amount).toLocaleString()}` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* File info */}
                  <View style={s.detailSection}>
                    <Text style={s.detailSectionTitle}>File Info</Text>
                    <View style={s.detailField}>
                      <Text style={s.detailLabel}>Status</Text>
                      <Text style={s.detailValue}>{selectedDoc.status || 'Unknown'}</Text>
                    </View>
                    {selectedDoc.fileSize && (
                      <View style={s.detailField}>
                        <Text style={s.detailLabel}>Size</Text>
                        <Text style={s.detailValue}>{(selectedDoc.fileSize / 1024).toFixed(1)} KB</Text>
                      </View>
                    )}
                    <View style={s.detailField}>
                      <Text style={s.detailLabel}>Uploaded</Text>
                      <Text style={s.detailValue}>{timeAgo(selectedDoc.uploadedAt || selectedDoc.createdAt)}</Text>
                    </View>
                  </View>
                </ScrollView>
              );
            })()}
            <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedDoc(null)}>
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ AI Analysis Results Modal ═══ */}
      <Modal visible={!!aiResult} transparent animationType="slide" onRequestClose={() => setAiResult(null)}>
        <Pressable style={s.modalOverlay} onPress={() => setAiResult(null)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.dragHandle} />
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <View style={s.detailHeader}>
                <View style={[s.detailIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                  <FontAwesome name="magic" size={24} color="#A78BFA" />
                </View>
                <Text style={s.detailTitle}>AI Analysis Results</Text>
              </View>

              {aiResult?.extractedData && (
                <>
                  {/* Vendor info */}
                  {aiResult.extractedData.vendor && (
                    <View style={s.detailSection}>
                      <Text style={s.detailSectionTitle}>Vendor</Text>
                      <Text style={s.detailValue}>{aiResult.extractedData.vendor}</Text>
                      {aiResult.extractedData.vendorAddress && (
                        <Text style={s.metaText}>{aiResult.extractedData.vendorAddress}</Text>
                      )}
                    </View>
                  )}

                  {/* Totals */}
                  <View style={s.detailSection}>
                    <Text style={s.detailSectionTitle}>Amounts</Text>
                    {aiResult.extractedData.subtotal != null && (
                      <View style={s.detailField}>
                        <Text style={s.detailLabel}>Subtotal</Text>
                        <Text style={s.detailValue}>ETB {Number(aiResult.extractedData.subtotal).toLocaleString()}</Text>
                      </View>
                    )}
                    {aiResult.extractedData.tax != null && (
                      <View style={s.detailField}>
                        <Text style={s.detailLabel}>Tax</Text>
                        <Text style={s.detailValue}>ETB {Number(aiResult.extractedData.tax).toLocaleString()}</Text>
                      </View>
                    )}
                    {aiResult.extractedData.total != null && (
                      <View style={s.detailField}>
                        <Text style={s.detailLabel}>Total</Text>
                        <Text style={[s.detailValue, { fontWeight: '700', color: Colors.primaryLight }]}>
                          ETB {Number(aiResult.extractedData.total).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Line items */}
                  {aiResult.extractedData.lineItems?.length > 0 && (
                    <View style={s.detailSection}>
                      <Text style={s.detailSectionTitle}>Line Items ({aiResult.extractedData.lineItems.length})</Text>
                      {aiResult.extractedData.lineItems.map((li: any, i: number) => (
                        <View key={i} style={s.extractedItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.extractedDesc} numberOfLines={2}>{li.description}</Text>
                            {li.quantity && <Text style={s.metaText}>{li.quantity} x ETB {li.unitPrice}</Text>}
                          </View>
                          <Text style={s.extractedAmount}>ETB {Number(li.amount || li.total || 0).toLocaleString()}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Confidence */}
                  {aiResult.extractedData.confidence != null && (
                    <View style={s.detailSection}>
                      <View style={s.detailField}>
                        <Text style={s.detailLabel}>AI Confidence</Text>
                        <Text style={[s.detailValue, { color: '#A78BFA' }]}>{aiResult.extractedData.confidence}%</Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity style={s.closeBtn} onPress={() => setAiResult(null)}>
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
