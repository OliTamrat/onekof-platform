import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: React.ComponentProps<typeof FontAwesome>['name'];
    onPress: () => void;
  };
}

export function ScreenHeader({ title, subtitle, showBack, rightAction }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.center}>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <FontAwesome name={rightAction.icon} size={14} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: { width: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
