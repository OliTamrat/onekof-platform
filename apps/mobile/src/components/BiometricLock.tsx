import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/theme';
import { getBiometricType, isBiometricAvailable, setBiometricEnabled } from '../lib/biometric';
import { useAuth } from '../contexts/auth-context';

export function BiometricLock() {
  const { isLocked, unlockWithBiometric, signOut, user } = useAuth();
  const [biometricLabel, setBiometricLabel] = useState('Unlock');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    (async () => {
      // If biometric hardware isn't available / not enrolled, don't block the user
      const available = await isBiometricAvailable();
      if (!available) {
        await setBiometricEnabled(false);
        setError('Biometric auth not available on this device. Please sign in again.');
        return;
      }
      const type = await getBiometricType();
      setBiometricLabel(`Use ${type}`);
      // Auto-prompt on mount
      if (isLocked) handleUnlock();
    })();
  }, [isLocked]);

  const handleUnlock = async () => {
    setError('');
    const success = await unlockWithBiometric();
    if (!success) {
      setFailedAttempts((n) => n + 1);
      setError('Authentication failed. Try again.');
    }
  };

  const handleDisableBiometric = () => {
    Alert.alert(
      'Disable biometric lock?',
      'You will be signed out and need to sign in with your password. Biometric lock will be turned off.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable & Sign Out',
          style: 'destructive',
          onPress: async () => {
            await setBiometricEnabled(false);
            await signOut();
          },
        },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You will need to sign in again with your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ],
    );
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

        {/* Escape hatches — always visible so user is never locked out */}
        <View style={styles.escapeRow}>
          <TouchableOpacity onPress={handleSignOut} style={styles.escapeBtn}>
            <Text style={styles.escapeText}>Sign out</Text>
          </TouchableOpacity>
          {failedAttempts >= 1 && (
            <>
              <Text style={styles.escapeDivider}>·</Text>
              <TouchableOpacity onPress={handleDisableBiometric} style={styles.escapeBtn}>
                <Text style={styles.escapeText}>Disable biometric</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  error: { fontSize: FontSize.sm, color: Colors.error, marginTop: Spacing.md, textAlign: 'center', paddingHorizontal: Spacing.xl },
  escapeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginTop: Spacing['3xl'],
  },
  escapeBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  escapeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  escapeDivider: { fontSize: FontSize.sm, color: Colors.textFaint },
});
