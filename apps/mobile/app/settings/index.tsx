import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/auth-context';
import { useLanguage, LOCALE_NAMES, type Locale } from '../../src/contexts/language-context';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import { ScreenHeader, Avatar } from '../../src/components';
import { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled, getBiometricType } from '../../src/lib/biometric';
import { apiFetch } from '../../src/lib/api';
import FontAwesome from '@expo/vector-icons/FontAwesome';

/* ─── Language options ─── */
const LANGUAGES: { code: Locale; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
  { code: 'om', label: 'Oromo', native: 'Afaan Oromoo' },
  { code: 'ti', label: 'Tigrinya', native: 'ትግርኛ' },
  { code: 'so', label: 'Somali', native: 'Soomaali' },
];

export default function SettingsScreen() {
  const { user, currentOrg, signOut } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioLabel, setBioLabel] = useState('Biometric');
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Notification prefs (local state for now — Phase 2 will persist)
  const [notifAssignments, setNotifAssignments] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);
  const [notifDueDates, setNotifDueDates] = useState(true);

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
    isBiometricEnabled().then(setBioEnabled);
    getBiometricType().then(setBioLabel);
  }, []);

  const toggleBiometric = async (value: boolean) => {
    await setBiometricEnabled(value);
    setBioEnabled(value);
  };

  const confirmSignOut = () => {
    Alert.alert(t('common.signOut'), t('settings.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch('/api/auth/mobile/me', { method: 'DELETE' });
              signOut();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again or contact support@onekof.com.');
            }
          },
        },
      ]
    );
  };

  const currentLang = LANGUAGES.find((l) => l.code === locale) as typeof LANGUAGES[0];

  return (
    <View style={s.container}>
      <ScreenHeader title={t('settings.title')} showBack />

      <ScrollView contentContainerStyle={s.scroll}>
        {/* ═══ Account ═══ */}
        <Text style={s.sectionLabel}>{t('settings.account')}</Text>
        <View style={s.card}>
          <View style={s.accountRow}>
            <Avatar name={user?.name || 'U'} size={44} />
            <View style={s.accountInfo}>
              <Text style={s.accountName}>{user?.name || 'User'}</Text>
              <Text style={s.accountEmail}>{user?.email}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <FontAwesome name="building-o" size={14} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.organization')}</Text>
            <Text style={s.rowValue}>{currentOrg?.name || '-'}</Text>
          </View>
        </View>

        {/* ═══ Language ═══ */}
        <Text style={s.sectionLabel}>{t('settings.language')}</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => setShowLangPicker(!showLangPicker)}>
            <FontAwesome name="globe" size={14} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.language')}</Text>
            <Text style={s.rowValue}>{currentLang.native}</Text>
            <FontAwesome name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={10} color={Colors.textFaint} />
          </TouchableOpacity>
          {showLangPicker && (
            <View style={s.langList}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.langOption, locale === lang.code && s.langOptionActive]}
                  onPress={() => { setLocale(lang.code); setShowLangPicker(false); }}
                >
                  <Text style={[s.langText, locale === lang.code && s.langTextActive]}>
                    {lang.native}
                  </Text>
                  <Text style={s.langSub}>{lang.label}</Text>
                  {locale === lang.code && (
                    <FontAwesome name="check" size={12} color={Colors.primaryLight} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ═══ Security ═══ */}
        <Text style={s.sectionLabel}>{t('settings.security')}</Text>
        <View style={s.card}>
          {bioAvailable && (
            <View style={s.row}>
              <FontAwesome name="lock" size={14} color={Colors.textSecondary} style={s.rowIcon} />
              <Text style={s.rowLabel}>{bioLabel}</Text>
              <Switch
                value={bioEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
                thumbColor={bioEnabled ? Colors.primaryLight : Colors.textFaint}
              />
            </View>
          )}
        </View>

        {/* ═══ Notifications ═══ */}
        <Text style={s.sectionLabel}>{t('settings.notifications')}</Text>
        <View style={s.card}>
          <View style={s.row}>
            <FontAwesome name="user-plus" size={13} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.assignments')}</Text>
            <Switch
              value={notifAssignments}
              onValueChange={setNotifAssignments}
              trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
              thumbColor={notifAssignments ? Colors.primaryLight : Colors.textFaint}
            />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <FontAwesome name="comment-o" size={13} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.comments')}</Text>
            <Switch
              value={notifComments}
              onValueChange={setNotifComments}
              trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
              thumbColor={notifComments ? Colors.primaryLight : Colors.textFaint}
            />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <FontAwesome name="at" size={13} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.mentions')}</Text>
            <Switch
              value={notifMentions}
              onValueChange={setNotifMentions}
              trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
              thumbColor={notifMentions ? Colors.primaryLight : Colors.textFaint}
            />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <FontAwesome name="calendar-check-o" size={13} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>{t('settings.dueDates')}</Text>
            <Switch
              value={notifDueDates}
              onValueChange={setNotifDueDates}
              trackColor={{ false: Colors.bgElevated, true: Colors.primary + '60' }}
              thumbColor={notifDueDates ? Colors.primaryLight : Colors.textFaint}
            />
          </View>
        </View>

        {/* ═══ Legal ═══ */}
        <Text style={s.sectionLabel}>Legal</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL('https://onekof.com/privacy')}>
            <FontAwesome name="shield" size={14} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>Privacy Policy</Text>
            <FontAwesome name="external-link" size={11} color={Colors.textFaint} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={() => Linking.openURL('https://onekof.com/terms')}>
            <FontAwesome name="file-text-o" size={14} color={Colors.textSecondary} style={s.rowIcon} />
            <Text style={s.rowLabel}>Terms of Service</Text>
            <FontAwesome name="external-link" size={11} color={Colors.textFaint} />
          </TouchableOpacity>
        </View>

        {/* ═══ Sign Out ═══ */}
        <TouchableOpacity style={s.signOutBtn} onPress={confirmSignOut}>
          <FontAwesome name="sign-out" size={16} color={Colors.error} />
          <Text style={s.signOutText}>{t('common.signOut')}</Text>
        </TouchableOpacity>

        {/* ═══ Delete Account ═══ */}
        <TouchableOpacity style={s.deleteBtn} onPress={confirmDeleteAccount}>
          <FontAwesome name="trash-o" size={15} color={Colors.error} />
          <Text style={s.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={s.version}>Onekof Mobile v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },

  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.textFaint,
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: Spacing.sm, marginTop: Spacing.lg, marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.xl, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md,
  },
  rowIcon: { width: 18, textAlign: 'center' },
  rowLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textWhite },
  rowValue: { fontSize: FontSize.sm, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.lg },

  /* Account */
  accountRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  accountInfo: { flex: 1 },
  accountName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textWhite },
  accountEmail: { fontSize: FontSize.xs, color: Colors.textFaint, marginTop: 2 },

  /* Language picker */
  langList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 4 },
  langOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  langOptionActive: { backgroundColor: Colors.primary + '15' },
  langText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  langTextActive: { color: Colors.primaryLight },
  langSub: { flex: 1, fontSize: FontSize.xs, color: Colors.textFaint },

  /* Sign out */
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.lg, marginTop: Spacing['2xl'],
  },
  signOutText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md, marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.error + '40',
    borderRadius: BorderRadius.xl,
  },
  deleteBtnText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '500' },
  version: {
    fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
