import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Pressable, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, StatusBadge, PRIORITY_CONFIG } from '../../src/components';
import { toEthiopian, formatEthiopian } from '../../src/utils/ethiopian-calendar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project?: { id?: string; key: string };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [eventTitle, setEventTitle] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: () => apiFetch<{ issues: Issue[] }>('/api/issues'),
  });

  const issues = data?.issues || [];

  const issuesByDate = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    issues.forEach((issue) => {
      if (issue.dueDate) {
        const dateKey = issue.dueDate.split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(issue);
      }
    });
    return map;
  }, [issues]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ day: number; dateKey: string } | null> = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey });
    }
    return days;
  }, [year, month]);

  // Ethiopian date for the 1st and 15th of the displayed month (to show month range)
  const ethFirst = toEthiopian(year, month + 1, 1);
  const ethMid = toEthiopian(year, month + 1, 15);
  const ethLabel = ethFirst.monthName === ethMid.monthName
    ? `${ethFirst.monthName} ${ethFirst.year}`
    : `${ethFirst.monthName} – ${ethMid.monthName} ${ethMid.year}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date().toISOString().split('T')[0];

  const selectedIssues = selectedDate ? (issuesByDate[selectedDate] || []) : [];

  const createMutation = useMutation({
    mutationFn: (data: { title: string; dueDate: string }) =>
      apiFetch('/api/issues', {
        method: 'POST',
        body: JSON.stringify({ title: data.title, dueDate: data.dueDate, status: 'TODO', priority: 'MEDIUM' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setShowCreate(false);
      setEventTitle('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.message || 'Could not create event');
    },
  });

  const handleCreate = () => {
    if (!eventTitle.trim()) { Alert.alert('Missing', 'Enter a title'); return; }
    if (!selectedDate) { Alert.alert('Missing', 'Select a date on the calendar first'); return; }
    createMutation.mutate({ title: eventTitle.trim(), dueDate: new Date(selectedDate + 'T12:00:00').toISOString() });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Calendar" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
      >
        {/* Month navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <FontAwesome name="chevron-left" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
            <Text style={styles.ethMonthTitle}>{ethLabel}</Text>
          </View>
          <View style={styles.navRight}>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <FontAwesome name="chevron-right" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
              <FontAwesome name="plus" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((item, i) => {
            if (!item) return <View key={`empty-${i}`} style={styles.dayCell} />;
            const hasIssues = issuesByDate[item.dateKey]?.length > 0;
            const isToday = item.dateKey === today;
            const isSelected = item.dateKey === selectedDate;
            return (
              <TouchableOpacity
                key={item.dateKey}
                style={[
                  styles.dayCell,
                  isToday && styles.dayCellToday,
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(isSelected ? null : item.dateKey)}
              >
                <Text style={[
                  styles.dayNumber,
                  isToday && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}>
                  {item.day}
                </Text>
                <Text style={styles.ethDay}>
                  {toEthiopian(year, month + 1, item.day).day}
                </Text>
                {hasIssues && (
                  <View style={styles.dotRow}>
                    {issuesByDate[item.dateKey].slice(0, 3).map((issue, j) => (
                      <View
                        key={j}
                        style={[styles.issueDot, { backgroundColor: PRIORITY_CONFIG[issue.priority]?.text || Colors.textFaint }]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected date issues */}
        {selectedDate && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.selectedEthDate}>
              {(() => {
                const [sy, sm, sd] = selectedDate.split('-').map(Number);
                return formatEthiopian(toEthiopian(sy, sm, sd));
              })()}
            </Text>
            {selectedIssues.length > 0 ? (
              selectedIssues.map((issue) => (
                <TouchableOpacity
                  key={issue.id}
                  style={styles.issueCard}
                  onPress={() => router.push(`/issue/${issue.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.priorityBar, { backgroundColor: PRIORITY_CONFIG[issue.priority]?.text || Colors.textFaint }]} />
                  <View style={styles.issueBody}>
                    <Text style={styles.issueTitle} numberOfLines={2}>{issue.title}</Text>
                    <View style={styles.issueMeta}>
                      {issue.project && <Text style={styles.issueProject}>{issue.project.key}</Text>}
                      <StatusBadge value={issue.status} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noIssues}>No issues due on this date</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ═══ Create Event Modal ═══ */}
      <Modal
        visible={showCreate}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.dragHandle} />
              <Text style={styles.modalTitle}>New Event</Text>
              {selectedDate && (
                <Text style={styles.modalDate}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              )}
              {!selectedDate && (
                <Text style={styles.modalHint}>Select a date on the calendar first</Text>
              )}

              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Event or task title"
                placeholderTextColor={Colors.textFaint}
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (createMutation.isPending || !selectedDate) && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={createMutation.isPending || !selectedDate}
                >
                  <Text style={styles.saveBtnText}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  monthCenter: { alignItems: 'center' },
  monthTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textWhite },
  ethMonthTitle: { fontSize: FontSize.xs, color: Colors.primaryLight, marginTop: 2 },
  dayHeaders: { flexDirection: 'row', marginBottom: Spacing.sm },
  dayHeader: {
    flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontWeight: '500', color: Colors.textFaint,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center',
    justifyContent: 'center', padding: 2,
  },
  dayCellToday: {
    backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.sm,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary + '30', borderRadius: BorderRadius.sm,
  },
  dayNumber: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dayNumberToday: { color: Colors.primaryLight, fontWeight: '700' },
  dayNumberSelected: { color: Colors.textWhite, fontWeight: '700' },
  ethDay: { fontSize: 8, color: Colors.primaryLight, opacity: 0.6, marginTop: -1 },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 1 },
  issueDot: { width: 4, height: 4, borderRadius: 2 },
  selectedSection: { marginTop: Spacing['2xl'] },
  selectedTitle: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite, marginBottom: 2,
  },
  selectedEthDate: {
    fontSize: FontSize.xs, color: Colors.primaryLight, marginBottom: Spacing.lg,
  },
  issueCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.sm,
  },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  issueBody: { flex: 1, padding: Spacing.lg },
  issueTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary, marginBottom: Spacing.sm },
  issueMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  issueProject: {
    fontSize: 10, fontWeight: '600', color: Colors.textFaint,
    backgroundColor: Colors.bgElevated, paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: BorderRadius.sm, overflow: 'hidden',
  },
  noIssues: { fontSize: FontSize.sm, color: Colors.textFaint, textAlign: 'center', paddingVertical: Spacing.xl },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.lg,
  },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.textFaint, alignSelf: 'center', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite, marginBottom: Spacing.xs },
  modalDate: { fontSize: FontSize.sm, color: Colors.primaryLight, marginBottom: Spacing.lg },
  modalHint: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.textWhite, marginBottom: Spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },
});
