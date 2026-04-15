import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../src/contexts/auth-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function MoreScreen() {
  const { user, currentOrg, signOut } = useAuth();

  const menuSections = [
    {
      title: 'Workspace',
      items: [
        { label: 'Teams', icon: 'users' as const },
        { label: 'Budget', icon: 'money' as const },
        { label: 'Calendar', icon: 'calendar' as const },
        { label: 'Documents', icon: 'file-text-o' as const },
        { label: 'Goals', icon: 'bullseye' as const },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Profile', icon: 'user' as const },
        { label: 'Notifications', icon: 'bell' as const },
        { label: 'Language', icon: 'globe' as const },
        { label: 'Security', icon: 'shield' as const },
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
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'O'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <View style={styles.orgBadge}>
            <Text style={styles.orgBadgeText}>{currentOrg?.name}</Text>
          </View>
        </View>

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
                >
                  <FontAwesome name={item.icon} size={16} color={Colors.textSecondary} style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
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
  userAvatar: {
    width: 48, height: 48, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primaryLight },
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
