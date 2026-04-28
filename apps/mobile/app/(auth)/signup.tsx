import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../src/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
  ];

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('https://onekof.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');

      // Sign in after signup
      const signInRes = await fetch('https://onekof.com/api/auth/mobile/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (signInRes.ok) {
        const signInData = await signInRes.json();
        const { setToken } = await import('../../src/lib/api');
        await setToken(signInData.token);
        router.replace('/select-org');
      } else {
        router.replace('/(auth)/signin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoLetter}>O</Text>
          </View>
          <Text style={styles.logoText}>Onekof</Text>
        </View>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.subtitle}>Start managing projects with your team</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Your full name" placeholderTextColor={Colors.textFaint} autoComplete="name" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="you@company.com" placeholderTextColor={Colors.textFaint}
              keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, styles.inputFlex]} value={password} onChangeText={setPassword}
                placeholder="At least 8 characters" placeholderTextColor={Colors.textFaint} secureTextEntry={!showPassword} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color={Colors.textFaint} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.checksRow}>
                {passwordChecks.map((c) => (
                  <Text key={c.label} style={[styles.checkText, c.met && styles.checkMet]}>
                    {c.met ? '\u2713' : '\u25CB'} {c.label}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, styles.inputFlex]} value={confirmPassword} onChangeText={setConfirmPassword}
                placeholder="Confirm your password" placeholderTextColor={Colors.textFaint} secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(v => !v)}>
                <FontAwesome name={showConfirmPassword ? 'eye-slash' : 'eye'} size={18} color={Colors.textFaint} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp} disabled={isLoading} activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/signin" asChild>
            <TouchableOpacity><Text style={styles.footerLink}>Sign In</Text></TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.copyright}>&copy; 2026 Onekof by DAPS Analytics</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing['3xl'], paddingVertical: Spacing['5xl'] },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing['3xl'] },
  logoIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoLetter: { fontSize: FontSize.lg, fontWeight: '900', color: '#fff' },
  logoText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textWhite },
  heading: { fontSize: FontSize['3xl'], fontWeight: '600', color: Colors.textWhite, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing['2xl'] },
  errorBox: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.xl },
  errorText: { fontSize: FontSize.sm, color: '#FCA5A5' },
  form: { gap: Spacing.lg },
  inputGroup: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md },
  inputFlex: { flex: 1, borderWidth: 0, backgroundColor: 'transparent' },
  eyeBtn: { paddingHorizontal: Spacing.lg, height: 52, justifyContent: 'center' },
  input: { height: 52, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, fontSize: FontSize.base, color: Colors.textWhite },
  checksRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.xs },
  checkText: { fontSize: FontSize.xs, color: Colors.textFaint },
  checkMet: { color: Colors.success },
  button: { height: 52, borderRadius: BorderRadius.full, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary, marginTop: Spacing.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: FontSize.base, fontWeight: '600', color: '#fff' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing['3xl'] },
  footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primaryLight },
  copyright: { fontSize: FontSize.xs, color: Colors.textFaint, textAlign: 'center', marginTop: Spacing['4xl'] },
});
