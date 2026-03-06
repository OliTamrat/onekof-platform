'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
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

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#0369A1] lg:flex lg:flex-col lg:justify-between lg:p-12">
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
            <h1 className="text-4xl font-bold leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-lg text-white/90">
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          {/* Back to signin link */}
          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          )}

          {/* Form */}
          {!token || status === 'error' ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">
                This reset link is invalid or has expired.{' '}
                <Link href="/auth/forgot-password" className="font-semibold text-[#0EA5E9] hover:text-[#0284C7]">
                  Request a new one
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || status === 'success'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0EA5E9] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Password Reset!
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#0369A1] lg:flex lg:flex-col lg:justify-between lg:p-12">
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
            <h1 className="text-4xl font-bold leading-tight text-white">
              Create a New
              <br />
              Secure Password
            </h1>
            <p className="text-lg text-white/90">
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </div>

        <div className="text-sm text-white/70">
          © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
        </div>
      </div>

      {/* Right side - Loading state */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Onekof</span>
          </Link>

          <Link
            href="/auth/signin"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Loading password reset form...
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#0EA5E9]" />
            <p className="text-sm text-gray-600">Please wait...</p>
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
