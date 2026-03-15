'use client';

import { useState, useCallback } from 'react';
import { Shield, Smartphone, Key, Copy, Check, Loader2, AlertTriangle } from 'lucide-react';

interface TwoFactorSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'backup' | 'disable'>('idle');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/update');
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.twoFactorEnabled || false);
      }
    } catch {
      // Silently fail — status will show as disabled
    }
  }, []);

  // Fetch 2FA status on mount
  useState(() => {
    fetchStatus();
  });

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/two-factor/setup', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set up 2FA');
        return;
      }

      setSetupData(data);
      setStep('setup');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length < 6) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/two-factor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, action: 'enable' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid code');
        return;
      }

      setTwoFactorEnabled(true);
      setStep('backup');
      setSuccess('Two-factor authentication enabled successfully!');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/two-factor/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to disable 2FA');
        return;
      }

      setTwoFactorEnabled(false);
      setSetupData(null);
      setStep('idle');
      setDisablePassword('');
      setSuccess('Two-factor authentication has been disabled.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="h-7 w-7 text-[#1C8C7D]" />
          Security Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account security and two-factor authentication.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* 2FA Status Card */}
      <div className="bg-white dark:bg-[#22272B] rounded-xl border border-gray-200 dark:border-[#374151] shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-[#374151]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                twoFactorEnabled
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <Smartphone className={`h-6 w-6 ${
                  twoFactorEnabled
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {twoFactorEnabled
                    ? 'Your account is protected with 2FA'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              twoFactorEnabled
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="p-6">
          {step === 'idle' && !twoFactorEnabled && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use an authenticator app (like Google Authenticator, Authy, or 1Password) to generate
                one-time codes for signing in. This protects your account even if your password is compromised.
              </p>
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C8C7D] text-white rounded-lg text-sm font-medium hover:bg-[#15695E] transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                Set Up Two-Factor Authentication
              </button>
            </div>
          )}

          {step === 'idle' && twoFactorEnabled && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your account is protected with two-factor authentication. You will need your authenticator
                app or a backup code to sign in.
              </p>
              <button
                onClick={() => setStep('disable')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          )}

          {step === 'setup' && setupData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Step 1: Scan QR Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Scan this QR code with your authenticator app.
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-600 inline-block">
                  <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Or enter this code manually:
                  </p>
                  <code className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-900 dark:text-gray-200 select-all">
                    {setupData.secret}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Step 2: Enter Verification Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Enter the 6-digit code from your authenticator app.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-40 px-4 py-2.5 text-center text-lg font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length < 6}
                    className="px-4 py-2.5 bg-[#1C8C7D] text-white rounded-lg text-sm font-medium hover:bg-[#15695E] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setStep('idle'); setSetupData(null); setVerificationCode(''); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel setup
              </button>
            </div>
          )}

          {step === 'backup' && setupData && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Save Your Backup Codes
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  These codes can be used to access your account if you lose your authenticator device.
                  Each code can only be used once. Store them in a safe place.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <button
                    key={index}
                    onClick={() => copyBackupCode(code, index)}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                  >
                    <code className="text-sm font-mono text-gray-900 dark:text-gray-200">{code}</code>
                    {copiedIndex === index ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyAllCodes}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {copiedIndex === -1 ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copiedIndex === -1 ? 'Copied!' : 'Copy All Codes'}
                </button>
                <button
                  onClick={() => { setStep('idle'); setSetupData(null); setSuccess(''); }}
                  className="px-4 py-2 bg-[#1C8C7D] text-white rounded-lg text-sm font-medium hover:bg-[#15695E] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === 'disable' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Disabling two-factor authentication will make your account less secure.
                  Enter your password to confirm.
                </p>
              </div>
              <div>
                <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full max-w-sm px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDisable}
                  disabled={isLoading || !disablePassword}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Disable'}
                </button>
                <button
                  onClick={() => { setStep('idle'); setDisablePassword(''); setError(''); }}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
