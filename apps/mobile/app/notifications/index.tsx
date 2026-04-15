import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, EmptyState, ListSkeleton } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: { issueId?: string; projectId?: string };
}

const NOTIF_ICONS: Record<string, { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }> = {
  ISSUE_ASSIGNED: { icon: 'user-plus', color: Colors.info },
  ISSUE_COMMENT: { icon: 'comment', color: Colors.violet },
  ISSUE_STATUS: { icon: 'exchange', color: Colors.warning },
  MENTION: { icon: 'at', color: Colors.primaryLight },
  PROJECT_UPDATE: { icon: 'folder-open', color: Colors.success },
  DEFAULT: { icon: 'bell', color: Colors.textSecondary },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<{ notifications: Notification[] }>('/api/notifications').catch(() => ({ notifications: [] })),
  });

  const markReadMutation = useMutation({
    mutationFn: (notifId: string) =>
      apiFetch(`/api/notifications/${notifId}/read`, { method: 'PATCH' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiFetch('/api/notifications/read-all', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = (notif: Notification) => {
    if (!notif.read) markReadMutation.mutate(notif.id);
    if (notif.data?.issueId) router.push(`/issue/${notif.data.issueId}`);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        showBack
        rightAction={unreadCount > 0 ? { icon: 'check', onPress: () => markAllReadMutation.mutate() } : undefined}
      />

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Text>
        </View>
      )}

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
          }
          renderItem={({ item }) => {
            const iconStyle = NOTIF_ICONS[item.type] || NOTIF_ICONS.DEFAULT;
            return (
              <TouchableOpacity
                style={[styles.card, !item.read && styles.cardUnread]}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.notifIcon, { backgroundColor: iconStyle.color + '15' }]}>
                  <FontAwesome name={iconStyle.icon} size={14} color={iconStyle.color} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                  <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState icon="bell-slash-o" title="No notifications" description="You're all caught up" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  unreadBanner: {
    backgroundColor: Colors.primary + '15', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  unreadText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '500' },
  list: { padding: Spacing.xl, gap: Spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md,
  },
  cardUnread: { borderColor: Colors.primary + '30', backgroundColor: Colors.primary + '05' },
  notifIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  notifTitle: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary },
  notifTitleUnread: { fontWeight: '700' },
  notifMessage: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  notifTime: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: Spacing.xs },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryLight, marginTop: 4,
  },
});
