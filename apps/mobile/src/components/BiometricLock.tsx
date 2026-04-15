import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { getBiometricType } from '../lib/biometric';
import { useAuth } from '../contexts/auth-context';

export function BiometricLock() {
  const { isLocked, unlockWithBiometric, user } = useAuth();
  const [biometricLabel, setBiometricLabel] = useState('Unlock');
  const [error, setError] = useState('');

  useEffect(() => {
    getBiometricType().then((type) => setBiometricLabel(`Use ${type}`));
    // Auto-prompt on mount
    if (isLocked) handleUnlock();
  }, [isLocked]);

  const handleUnlock = async () => {
    setError('');
    const success = await unlockWithBiometric();
    if (!success) setError('Authentication failed. Try again.');
  };

  if (!isLocked) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <FontAwesome name="lock" size={32} color={Colors.primaryLight} />
        </View>
        <Text style={styles.title}>Onekof is Locked</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.name?.split(' ')[0]}</Text>

        <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock} activeOpacity={0.8}>
          <FontAwesome name="hand-stop-o" size={18} color="#fff" />
          <Text style={styles.unlockText}>{biometricLabel}</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: { alignItems: 'center', gap: Spacing.lg },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.textWhite },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary },
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing['3xl'], paddingVertical: Spacing.lg,
    marginTop: Spacing['2xl'],
  },
  unlockText: { fontSize: FontSize.base, fontWeight: '600', color: '#fff' },
  error: { fontSize: FontSize.sm, color: Colors.error, marginTop: Spacing.md },
});
