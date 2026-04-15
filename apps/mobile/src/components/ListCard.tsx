import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';

interface ListCardProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  meta?: string;
}

export function ListCard({ title, subtitle, left, right, onPress, meta }: ListCardProps) {
  const content = (
    <View style={styles.card}>
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        {meta && <Text style={styles.meta} numberOfLines={1}>{meta}</Text>}
      </View>
      {right ? (
        <View style={styles.right}>{right}</View>
      ) : onPress ? (
        <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  left: {},
  body: { flex: 1 },
  title: {
    fontSize: FontSize.base,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textFaint,
    marginTop: 4,
  },
  right: {},
});
