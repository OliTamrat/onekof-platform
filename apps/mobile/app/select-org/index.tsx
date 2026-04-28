import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../src/contexts/auth-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';

export default function SelectOrgScreen() {
  const { user, organizations, selectOrganization, signOut } = useAuth();

  const handleCreateWorkspace = () => {
    WebBrowser.openBrowserAsync('https://onekof.com/onboarding');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoLetter}>O</Text>
        </View>
        <Text style={styles.greeting}>
          Welcome, {user?.name?.split(' ')[0] || 'there'}
        </Text>
        <Text style={styles.subtitle}>Select your workspace</Text>
      </View>

      <FlatList
        data={organizations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orgCard}
            onPress={() => selectOrganization(item)}
            activeOpacity={0.7}
          >
            <View style={styles.orgIconContainer}>
              <Text style={styles.orgIcon}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{item.name}</Text>
              <Text style={styles.orgSlug}>{item.slug}.onekof.com</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{item.role}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="building-o" size={40} color={Colors.textFaint} style={{ marginBottom: Spacing.xl }} />
            <Text style={styles.emptyTitle}>No workspaces yet</Text>
            <Text style={styles.emptyDesc}>
              Create a workspace on the web or ask your team admin to invite you.
            </Text>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreateWorkspace} activeOpacity={0.8}>
              <FontAwesome name="plus" size={14} color="#fff" />
              <Text style={styles.createBtnText}>Create Workspace</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    marginBottom: Spacing['3xl'],
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoLetter: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: '#fff',
  },
  greeting: {
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  orgIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgIcon: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  orgSlug: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
  signOutBtn: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing['3xl'],
  },
  signOutText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
