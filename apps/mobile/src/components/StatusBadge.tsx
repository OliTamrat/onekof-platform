import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';

export const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  BACKLOG: { bg: 'rgba(148,163,184,0.1)', text: '#94A3B8', label: 'Backlog' },
  TODO: { bg: Colors.warningBg, text: Colors.warning, label: 'To Do' },
  IN_PROGRESS: { bg: Colors.infoBg, text: Colors.info, label: 'In Progress' },
  IN_REVIEW: { bg: 'rgba(139,92,246,0.1)', text: Colors.violet, label: 'In Review' },
  DONE: { bg: Colors.successBg, text: Colors.success, label: 'Done' },
};

export const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  LOW: { bg: Colors.infoBg, text: Colors.info, label: 'Low' },
  MEDIUM: { bg: Colors.warningBg, text: Colors.warning, label: 'Medium' },
  HIGH: { bg: 'rgba(249,115,22,0.1)', text: '#F97316', label: 'High' },
  CRITICAL: { bg: Colors.errorBg, text: Colors.error, label: 'Critical' },
};

interface StatusBadgeProps {
  value: string;
  type?: 'status' | 'priority';
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export function StatusBadge({ value, type = 'status', onPress, size = 'sm' }: StatusBadgeProps) {
  const config = type === 'status' ? STATUS_CONFIG : PRIORITY_CONFIG;
  const style = config[value] || config.BACKLOG || config.MEDIUM;

  const badge = (
    <View style={[styles.badge, size === 'md' && styles.badgeMd, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, size === 'md' && styles.textMd, { color: style.text }]}>
        {style.label}
      </Text>
      {onPress && <FontAwesome name="caret-down" size={10} color={style.text} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {badge}
      </TouchableOpacity>
    );
  }

  return badge;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  textMd: {
    fontSize: FontSize.xs,
  },
});
