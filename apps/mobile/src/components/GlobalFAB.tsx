import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/auth-context';

/**
 * Global floating "+" button — quick-create issue from any authenticated screen.
 *
 * Hides on:
 *   - Auth screens (signin / signup)
 *   - Org selection
 *   - The create-issue / create-project screens themselves (circular)
 *   - Screens that already have their own FAB (to avoid overlap):
 *       (tabs)/projects — has create-project FAB
 *       (tabs)/issues   — has create-issue FAB
 *       project/[id]    — has contextual FAB on issues/board tabs
 */
export function GlobalFAB() {
  const router = useRouter();
  const segments = useSegments();
  const { user, currentOrg, isLocked } = useAuth();

  // Must be signed in + org selected + unlocked
  if (!user || !currentOrg || isLocked) return null;

  const path = segments.join('/');

  // Hide on: auth, screens with own FAB, and screens where "+" doesn't make sense
  const SKIP_PATHS = [
    '(auth)',
    'select-org',
    'create-issue',
    'create-project',
    '(tabs)/projects',   // has own create-project FAB
    '(tabs)/issues',     // has own create-issue FAB
    '(tabs)/notifications', // not relevant
    '(tabs)/more',       // menu screen
    'project/[id]',      // has contextual FAB
    'budget',            // has own add-expense button
    'goals',             // has own edit modal
    'teams',             // has own add-member
    'team',              // team detail
    'documents',         // has own upload button
    'calendar',          // has own create-event button
    'members',           // has own invite button
    'settings',          // settings page
    'profile',           // profile page
    'search',            // search page
  ];

  if (SKIP_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/create-issue')}
      activeOpacity={0.85}
      accessibilityLabel="Create new issue"
    >
      <FontAwesome name="plus" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 92, // above the bottom tab bar (~83pt on iPhone) with a little breathing room
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 100,
  },
});
