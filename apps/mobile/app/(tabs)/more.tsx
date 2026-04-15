import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/auth-context';
import { apiFetch } from '../../src/lib/api';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { Avatar } from '../../src/components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function MoreScreen() {
  const { user, currentOrg, signOut } = useAuth();
  const router = useRouter();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<{ notifications: Array<{ read: boolean }> }>('/api/notifications').catch(() => ({ notifications: [] })),
  });

  const unreadCount = notifData?.notifications?.filter((n) => !n.read).length || 0;

  interface MenuItem {
    label: string;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
    route: string;
    badge?: number;
  }

  const menuSections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: 'Workspace',
      items: [
        { label: 'Teams', icon: 'users', route: '/teams' },
        { label: 'Budget', icon: 'money', route: '/budget' },
        { label: 'Calendar', icon: 'calendar', route: '/calendar' },
        { label: 'Documents', icon: 'file-text-o', route: '/documents' },
        { label: 'Goals', icon: 'bullseye', route: '/goals' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Profile', icon: 'user', route: '/profile' },
        { label: 'Notifications', icon: 'bell', route: '/notifications', badge: unreadCount },
        { label: 'Security', icon: 'shield', route: '/profile' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User card */}
        <TouchableOpacity style={styles.userCard} onPress={() => router.push('/profile' as any)} activeOpacity={0.7}>
          <Avatar name={user?.name || 'User'} size={48} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <View style={styles.orgBadge}>
            <Text style={styles.orgBadgeText}>{currentOrg?.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, index < section.items.length - 1 && styles.menuItemBorder]}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.route as any)}
                >
                  <FontAwesome name={item.icon} size={16} color={Colors.textSecondary} style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.badge ? (
                    <View style={styles.badgeCircle}>
                      <Text style={styles.badgeText}>{item.badge > 9 ? '9+' : item.badge}</Text>
                    </View>
                  ) : null}
                  <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.7}>
          <FontAwesome name="sign-out" size={16} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Onekof Mobile v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.textWhite },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.lg,
    marginBottom: Spacing['3xl'],
  },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  userEmail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  orgBadge: {
    backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  orgBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.primaryLight },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: '600', color: Colors.textFaint,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 20, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  badgeCircle: {
    backgroundColor: Colors.error, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6, marginRight: Spacing.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.lg, marginTop: Spacing.lg,
  },
  signOutText: { fontSize: FontSize.base, color: Colors.error, fontWeight: '500' },
  version: {
    fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center',
    marginTop: Spacing['3xl'],
  },
});
