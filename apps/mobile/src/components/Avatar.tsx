import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize } from '../constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 32, color = Colors.primary }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || '?';
  const fontSize = size < 28 ? 10 : size < 40 ? 13 : 17;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize, color: color }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
