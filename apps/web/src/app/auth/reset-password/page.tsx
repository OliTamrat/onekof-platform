'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2, CheckCircle2, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.invalidResetLink'));
    }
  }, [token, t]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 3) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  // Password requirements
  const requirements = [
    { label: t('auth.atLeast8Chars'), met: password.length >= 8 },
    { label: t('auth.containsUppercase'), met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: t('auth.containsNumber'), met: /[0-9]/.test(password) },
    { label: t('auth.containsSpecialChar'), met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage(t('auth.passwordsDontMatch'));
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage(t('auth.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStatus('success');
      setMessage(t('auth.passwordResetRedirecting'));

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: unknown) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : t('auth.somethingWentWrongTryAgain')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get strength color
  const getStrengthColor = () => {
    if (!passwordStrength) return 'bg-white/[0.08]';
    if (passwordStrength === 'weak') return 'bg-red-500';
    if (passwordStrength === 'medium') return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  // Get strength width
  const getStrengthWidth = () => {
    if (!passwordStrength) return 'w-0';
    if (passwordStrength === 'weak') return 'w-1/3';
    if (passwordStrength === 'medium') return 'w-2/3';
    return 'w-full';
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0B3A34] via-[#0B4A3F] to-[#0B0E11] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center group">
            <img src="/logo-full.png" alt="Onekof" className="h-10" />
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif font-medium text-5xl leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-xl text-white/70 max-w-md">
              Choose a strong password to keep your account safe and secure.
            </p>
          </div>

          {/* Security features */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
              <div className="mt-0.5">
                <Lock className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="font-semibold text-white">Bank-level Security</p>
                <p className="text-sm text-white/70 mt-1">Your password is encrypted with industry-standard protocols</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="font-semibold text-white">One-time Use Link</p>
                <p className="text-sm text-white/70 mt-1">This reset link expires after use for your protection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/30">
          © 2026 Onekof. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center bg-[#0B0E11] px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/logo-full.png" alt="Onekof" className="h-8" />
          </Link>

          {/* Back to signin link */}
          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignIn')}
          </Link>

          <div className="mb-8">
            <h2 className="font-serif font-medium text-3xl text-white">
              {t('auth.resetPasswordTitle')}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {t('resetPage.newPasswordDifferent')}
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#12161B] p-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white">{t('resetPage.success')}</p>
                  <p className="text-sm text-white/70 mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && message && (
            <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#12161B] p-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white">{t('resetPage.error')}</p>
                  <p className="text-sm text-white/70 mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!token || (status === 'error' && !password) ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#12161B] p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#181D23]">
                <AlertCircle className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('resetPage.invalidResetLink')}</h3>
              <p className="text-sm text-white/70 mb-6">
                {t('resetPage.resetLinkExpiredOrInvalid')}
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                {t('resetPage.requestNewLink')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#12161B] py-3 pl-10 pr-12 text-white placeholder-white/30 focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10 transition-all"
                    placeholder={t('resetPage.enterNewPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-white/30 hover:bg-transparent hover:text-white/70"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/70">{t('auth.passwordStrength')}:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {passwordStrength === 'weak' ? t('auth.weak') :
                         passwordStrength === 'medium' ? t('priority.medium') :
                         t('auth.strong')}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                      />
                    </div>
                  </div>
                )}

                {/* Password requirements */}
                {password && (
                  <div className="mt-4 space-y-2 rounded-lg border border-white/[0.08] bg-[#181D23] p-4">
                    <p className="text-xs font-semibold text-white/70 mb-2">{t('resetPage.passwordMustContain')}</p>
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-colors ${
                          req.met ? 'bg-emerald-500' : 'bg-white/[0.08]'
                        }`}>
                          {req.met ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : (
                            <X className="h-3 w-3 text-white/30" />
                          )}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-emerald-400 font-medium' : 'text-white/70'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                  {t('auth.confirmNewPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/[0.08] bg-[#12161B] py-3 pl-10 pr-12 text-white placeholder-white/30 focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10 transition-all"
                    placeholder={t('resetPage.confirmNewPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-white/30 hover:bg-transparent hover:text-white/70"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {t('auth.passwordsDontMatch')}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t('auth.passwordsMatch')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || status === 'success' || password !== confirmPassword || !password}
                className="w-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] py-3.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('auth.resettingPassword')}
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    {t('auth.passwordReset')}
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    {t('auth.resetPassword')}
                  </>
                )}
              </Button>

              {/* Security note */}
              <div className="rounded-xl border border-white/[0.08] bg-[#12161B] p-4">
                <div className="flex gap-3">
                  <Lock className="h-5 w-5 text-[#2BB5A2] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">{t('resetPage.securePasswordReset')}</p>
                    <p className="text-xs text-white/70 mt-1">
                      {t('resetPage.passwordEncryptedOneTime')}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0B3A34] via-[#0B4A3F] to-[#0B0E11] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-full.png" alt="Onekof" className="h-10" />
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif font-medium text-5xl leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-xl text-white/70 max-w-md">
              Choose a strong password to keep your account safe and secure.
            </p>
          </div>
        </div>

        <div className="text-sm text-white/30">
          © 2026 Onekof. All rights reserved.
        </div>
      </div>

      {/* Right side - Loading state */}
      <div className="flex w-full flex-col justify-center bg-[#0B0E11] px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2BB5A2]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
