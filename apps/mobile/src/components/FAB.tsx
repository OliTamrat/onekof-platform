import { TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, BorderRadius } from '../constants/theme';
import { lightTap } from '../lib/haptics';

interface FABProps {
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  onPress: () => void;
}

export function FAB({ icon = 'plus', onPress }: FABProps) {
  const handlePress = () => { lightTap(); onPress(); };
  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress} activeOpacity={0.8}>
      <FontAwesome name={icon} size={20} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
