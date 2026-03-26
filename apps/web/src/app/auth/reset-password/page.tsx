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
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

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
      setMessage('Password must be at least 8 characters');
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
      setMessage('Password reset successfully! Redirecting to sign in...');

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get strength color
  const getStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-200';
    if (passwordStrength === 'weak') return 'bg-red-500';
    if (passwordStrength === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get strength width
  const getStrengthWidth = () => {
    if (!passwordStrength) return 'w-0';
    if (passwordStrength === 'weak') return 'w-1/3';
    if (passwordStrength === 'medium') return 'w-2/3';
    return 'w-full';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0070f3] via-[#0056b3] to-[#003d82] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white/20 group-hover:scale-105">
              <span className="text-2xl font-bold text-white">O</span>
            </div>
            <span className="text-2xl font-bold text-white">Onekof</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Choose a strong password to keep your account safe and secure.
            </p>
          </div>

          {/* Security features */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="mt-0.5">
                <Lock className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <p className="font-semibold text-white">Bank-level Security</p>
                <p className="text-sm text-white/80 mt-1">Your password is encrypted with industry-standard protocols</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <p className="font-semibold text-white">One-time Use Link</p>
                <p className="text-sm text-white/80 mt-1">This reset link expires after use for your protection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0070f3] to-[#0056b3]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          {/* Back to signin link */}
          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToSignIn')}
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('auth.resetPasswordTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="mb-6 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-green-900">Success!</p>
                  <p className="text-sm text-green-800 mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && message && (
            <div className="mb-6 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-800 mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!token || (status === 'error' && !password) ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
              <p className="text-sm text-gray-600 mb-6">
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0070f3] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0056b3] transition-colors"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 focus:border-[#0070f3] focus:outline-none focus:ring-4 focus:ring-[#0070f3]/10 transition-all"
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-400 hover:bg-transparent hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">{t('auth.passwordStrength')}:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength === 'weak' ? 'text-red-600' :
                        passwordStrength === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength === 'weak' ? t('auth.weak') :
                         passwordStrength === 'medium' ? t('priority.medium') :
                         t('auth.strong')}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                      />
                    </div>
                  </div>
                )}

                {/* Password requirements */}
                {password && (
                  <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full transition-colors ${
                          req.met ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {req.met ? (
                            <Check className="h-3 w-3 text-white" />
                          ) : (
                            <X className="h-3 w-3 text-gray-500" />
                          )}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('auth.confirmNewPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 focus:border-[#0070f3] focus:outline-none focus:ring-4 focus:ring-[#0070f3]/10 transition-all"
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-gray-400 hover:bg-transparent hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {t('auth.passwordsDontMatch')}
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t('auth.passwordsMatch')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || status === 'success' || password !== confirmPassword || !password}
                className="w-full rounded-lg py-3.5 text-sm font-semibold shadow-lg"
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
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <div className="flex gap-3">
                  <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900">Secure Password Reset</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your password is encrypted and this reset link will expire after one use.
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0070f3] via-[#0056b3] to-[#003d82] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">O</span>
            </div>
            <span className="text-2xl font-bold text-white">Onekof</span>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Choose a strong password to keep your account safe and secure.
            </p>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. All rights reserved.
        </div>
      </div>

      {/* Right side - Loading state */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0070f3]" />
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
