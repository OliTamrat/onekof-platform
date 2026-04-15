import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[styles.chip, !selected && styles.chipActive]}
        onPress={() => onSelect(null)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextActive]}>All</Text>
      </TouchableOpacity>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, selected === opt.value && styles.chipActive]}
          onPress={() => onSelect(selected === opt.value ? null : opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selected === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
});
