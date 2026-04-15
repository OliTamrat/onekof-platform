import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';

interface ErrorBoundaryViewProps {
  error: Error;
  retry?: () => void;
}

export function ErrorBoundaryView({ error, retry }: ErrorBoundaryViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <FontAwesome name="exclamation-triangle" size={28} color={Colors.error} />
      </View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message} numberOfLines={3}>{error.message}</Text>
      {retry && (
        <TouchableOpacity style={styles.retryBtn} onPress={retry} activeOpacity={0.8}>
          <FontAwesome name="refresh" size={14} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.errorBg, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  retryText: { fontSize: FontSize.base, fontWeight: '600', color: '#fff' },
});
