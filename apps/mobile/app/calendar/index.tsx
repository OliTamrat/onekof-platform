import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, StatusBadge, PRIORITY_CONFIG } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Issue {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project?: { key: string };
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date().toISOString().split('T')[0];

  const selectedIssues = selectedDate ? (issuesByDate[selectedDate] || []) : [];

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
          <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <FontAwesome name="chevron-right" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
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
  monthTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textWhite },
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
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  issueDot: { width: 4, height: 4, borderRadius: 2 },
  selectedSection: { marginTop: Spacing['2xl'] },
  selectedTitle: {
    fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite, marginBottom: Spacing.lg,
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
});
