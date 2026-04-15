import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';

interface BottomSheetOption {
  label: string;
  value: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  color?: string;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: BottomSheetOption[];
  selected?: string | null;
  onSelect: (value: string) => void;
}

export function BottomSheet({ visible, onClose, title, options, selected, onSelect }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, selected === item.value && styles.optionActive]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                {item.icon && (
                  <FontAwesome
                    name={item.icon}
                    size={16}
                    color={item.color || Colors.textSecondary}
                    style={styles.optionIcon}
                  />
                )}
                {item.color && !item.icon && (
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                )}
                <Text style={[styles.optionText, selected === item.value && styles.optionTextActive]}>
                  {item.label}
                </Text>
                {selected === item.value && (
                  <FontAwesome name="check" size={14} color={Colors.primaryLight} />
                )}
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textFaint,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textWhite,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  optionActive: {
    backgroundColor: Colors.primary + '10',
  },
  optionIcon: { width: 20, textAlign: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  optionText: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
});
