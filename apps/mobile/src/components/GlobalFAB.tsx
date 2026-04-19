import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/auth-context';

/**
 * Context-aware floating action button.
 * Action changes based on the current screen:
 * - Dashboard / Issues → Create Issue
 * - Projects → Create Project
 * - Documents → Upload Document (handled by screen's own button)
 * - Budget → Add Expense (handled by screen's own button)
 * - Others → Create Issue (default)
 */

interface FABAction {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  route: string;
  label: string;
}

function getFABAction(path: string): FABAction | null {
  // Screens that handle their own FAB internally — hide global one
  if (path.startsWith('(auth)')) return null;
  if (path === 'select-org' || path.startsWith('select-org/')) return null;
  if (path.startsWith('create-issue') || path.startsWith('create-project')) return null;
  if (path === 'search' || path.startsWith('search/')) return null;
  if (path === 'settings' || path.startsWith('settings/')) return null;
  if (path === 'profile' || path.startsWith('profile/')) return null;

  // Screens that already have their own FAB/action button — hide global
  if (path.startsWith('project/')) return null;  // project detail has own FAB
  if (path === '(tabs)/projects') return null;   // has own create-project button in header
  if (path === '(tabs)/issues') return null;     // has own create-issue FAB
  if (path === '(tabs)/notifications') return null;
  if (path === '(tabs)/more') return null;
  if (path.startsWith('team/')) return null;
  if (path === 'budget' || path.startsWith('budget/')) return null;
  if (path === 'documents' || path.startsWith('documents/')) return null;
  if (path === 'calendar' || path.startsWith('calendar/')) return null;
  if (path === 'members' || path.startsWith('members/')) return null;
  if (path === 'teams' || path.startsWith('teams/')) return null;
  if (path === 'goals' || path.startsWith('goals/')) return null;

  // Default: create issue (dashboard, issue detail)
  return { icon: 'plus', route: '/create-issue', label: 'Create issue' };
}

export function GlobalFAB() {
  const router = useRouter();
  const segments = useSegments();
  const { user, currentOrg, isLocked } = useAuth();

  if (!user || !currentOrg || isLocked) return null;

  const path = segments.join('/');
  const action = getFABAction(path);

  if (!action) return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push(action.route as any)}
      activeOpacity={0.85}
      accessibilityLabel={action.label}
    >
      <FontAwesome name={action.icon} size={20} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 92,
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
