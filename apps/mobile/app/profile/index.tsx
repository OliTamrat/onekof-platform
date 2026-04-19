import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Linking, Modal, Pressable } from 'react-native';
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
  const [showAbout, setShowAbout] = useState(false);

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

  const handleAbout = () => setShowAbout(true);

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

      {/* ═══ About Onekof Modal ═══ */}
      <Modal visible={showAbout} transparent animationType="fade" onRequestClose={() => setShowAbout(false)}>
        <Pressable style={styles.aboutOverlay} onPress={() => setShowAbout(false)}>
          <Pressable style={styles.aboutSheet} onPress={(e) => e.stopPropagation()}>
            {/* Logo area */}
            <View style={styles.aboutLogoBox}>
              <View style={styles.aboutLogo}>
                <Text style={styles.aboutLogoText}>O</Text>
              </View>
            </View>
            <Text style={styles.aboutAppName}>Onekof</Text>
            <Text style={styles.aboutVersion}>Mobile v1.0.0</Text>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutDesc}>
              The complete project management platform built for Ethiopian organizations.
            </Text>

            <View style={styles.aboutInfoRow}>
              <FontAwesome name="building-o" size={12} color={Colors.textSecondary} />
              <Text style={styles.aboutInfoText}>DAPS Analytics</Text>
            </View>
            <View style={styles.aboutInfoRow}>
              <FontAwesome name="globe" size={12} color={Colors.textSecondary} />
              <Text style={styles.aboutInfoText}>onekof.com</Text>
            </View>
            <View style={styles.aboutInfoRow}>
              <FontAwesome name="envelope-o" size={12} color={Colors.textSecondary} />
              <Text style={styles.aboutInfoText}>support@onekof.com</Text>
            </View>

            <View style={styles.aboutDivider} />

            <View style={styles.aboutActions}>
              <TouchableOpacity style={styles.aboutActionBtn} onPress={() => Linking.openURL('https://onekof.com')} activeOpacity={0.7}>
                <FontAwesome name="external-link" size={13} color={Colors.primaryLight} />
                <Text style={styles.aboutActionText}>Visit Website</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aboutCloseBtn} onPress={() => setShowAbout(false)} activeOpacity={0.7}>
                <Text style={styles.aboutCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  /* ═══ About Modal ═══ */
  aboutOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing['3xl'],
  },
  aboutSheet: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, padding: Spacing['2xl'],
    width: '100%', maxWidth: 340, alignItems: 'center',
  },
  aboutLogoBox: { marginBottom: Spacing.md },
  aboutLogo: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  aboutLogoText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  aboutAppName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  aboutVersion: { fontSize: FontSize.sm, color: Colors.textFaint, marginTop: 2 },
  aboutDivider: {
    width: '80%', height: 1, backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  aboutDesc: {
    fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginBottom: Spacing.lg,
  },
  aboutInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  aboutInfoText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  aboutActions: {
    flexDirection: 'row', gap: Spacing.sm, width: '100%',
  },
  aboutActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  aboutActionText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primaryLight },
  aboutCloseBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  aboutCloseBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
});
