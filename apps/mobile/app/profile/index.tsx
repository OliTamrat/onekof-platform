import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/auth-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, Avatar } from '../../src/components';
import { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled, getBiometricType } from '../../src/lib/biometric';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  const { user, currentOrg, organizations, signOut, selectOrganization } = useAuth();
  const router = useRouter();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioLabel, setBioLabel] = useState('Biometric');

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
    isBiometricEnabled().then(setBioEnabled);
    getBiometricType().then(setBioLabel);
  }, []);

  const toggleBiometric = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBioEnabled(value);
  };

  const handleSwitchOrg = () => {
    if (organizations.length <= 1) return;
    Alert.alert(
      'Switch Organization',
      'Select an organization',
      [
        ...organizations
          .filter((o) => o.slug !== currentOrg?.slug)
          .map((org) => ({
            text: org.name,
            onPress: () => selectOrganization(org),
          })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'How can we help?',
      [
        { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@onekof.com') },
        { text: 'Visit Website', onPress: () => Linking.openURL('https://onekof.com') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Onekof',
      'Onekof Mobile v1.0.0\n\n' +
      'The complete project management platform built for Ethiopian organizations.\n\n' +
      'By DAPS Analytics\n' +
      'https://onekof.com',
      [
        { text: 'Visit Website', onPress: () => Linking.openURL('https://onekof.com') },
        { text: 'OK' },
      ],
    );
  };

  const settingsItems = [
    { label: 'Switch Organization', icon: 'building' as const, onPress: handleSwitchOrg, show: organizations.length > 1 },
    { label: 'Account Settings', icon: 'cog' as const, onPress: () => router.push('/settings' as any) },
    { label: 'Privacy & Security', icon: 'shield' as const, onPress: () => router.push('/settings' as any) },
    { label: 'Help & Support', icon: 'question-circle' as const, onPress: handleHelpSupport },
    { label: 'About Onekof', icon: 'info-circle' as const, onPress: handleAbout },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar name={user?.name || 'User'} size={72} />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.orgBadge}>
            <FontAwesome name="building-o" size={10} color={Colors.primaryLight} />
            <Text style={styles.orgBadgeText}>{currentOrg?.name}</Text>
            <Text style={styles.roleBadge}>{currentOrg?.role}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{organizations.length}</Text>
            <Text style={styles.statLabel}>Orgs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentOrg?.plan || 'Free'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Biometric */}
        {bioAvailable && (
          <View style={styles.biometricCard}>
            <View style={styles.biometricRow}>
              <FontAwesome name="lock" size={16} color={Colors.primaryLight} />
              <View style={{ flex: 1 }}>
                <Text style={styles.biometricTitle}>{bioLabel} Lock</Text>
                <Text style={styles.biometricDesc}>Require {bioLabel.toLowerCase()} to open the app</Text>
              </View>
              <Switch
                value={bioEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
                thumbColor={bioEnabled ? Colors.primaryLight : Colors.textFaint}
              />
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsCard}>
          {settingsItems.filter((i) => i.show !== false).map((item, index, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingsItem, index < arr.length - 1 && styles.settingsItemBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <FontAwesome name={item.icon} size={16} color={Colors.textSecondary} style={styles.settingsIcon} />
              <Text style={styles.settingsLabel}>{item.label}</Text>
              <FontAwesome name="chevron-right" size={12} color={Colors.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.7}>
          <FontAwesome name="sign-out" size={16} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Onekof Mobile v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
  profileCard: {
    alignItems: 'center', backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.xl,
    padding: Spacing['3xl'], marginBottom: Spacing.xl,
  },
  userName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite, marginTop: Spacing.lg },
  userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  orgBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary + '10', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.lg,
  },
  orgBadgeText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '500' },
  roleBadge: {
    fontSize: 9, fontWeight: '700', color: Colors.textWhite,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: 1,
    borderRadius: BorderRadius.full, overflow: 'hidden', textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.xl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textWhite },
  statLabel: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  settingsCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.lg,
  },
  settingsItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsIcon: { width: 20, textAlign: 'center' },
  settingsLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.lg, marginTop: Spacing['2xl'],
  },
  signOutText: { fontSize: FontSize.base, color: Colors.error, fontWeight: '500' },
  version: { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center', marginTop: Spacing['2xl'] },
  biometricCard: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginBottom: Spacing.xl,
  },
  biometricRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  biometricTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  biometricDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
