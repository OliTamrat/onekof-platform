import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { useAuth } from '../contexts/auth-context';

export function OfflineBanner() {
  const { offlineQueueCount, syncOfflineQueue } = useAuth();

  if (offlineQueueCount === 0) return null;

  return (
    <TouchableOpacity style={styles.banner} onPress={syncOfflineQueue} activeOpacity={0.8}>
      <FontAwesome name="cloud-upload" size={14} color={Colors.warning} />
      <Text style={styles.text}>
        {offlineQueueCount} pending change{offlineQueueCount !== 1 ? 's' : ''} — tap to sync
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningBg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.warning,
  },
});
