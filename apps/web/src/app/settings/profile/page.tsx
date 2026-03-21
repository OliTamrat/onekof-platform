'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/settings/profile');
    }
  }, [status, router]);

  // Initialize form with user data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0EA5E9] border-t-transparent"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update session with new data
      await update({ name, email });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(session.user?.name || '');
    setEmail(session.user?.email || '');
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg border p-4 ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0EA5E9] text-2xl font-bold text-white">
                  {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{name || 'User'}</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 ${
                      !isEditing ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className={`w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 ${
                      !isEditing ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Action Buttons (only show when editing) */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#0EA5E9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Security</h2>
            <div className="space-y-4">
              <Link
                href="/settings/change-password"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-red-600">Danger Zone</h2>
            <div className="space-y-4">
              <div
                role="button"
                tabIndex={0}
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); signOut({ callbackUrl: '/auth/signin' }); } }}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                    <LogOut className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Sign Out</h3>
                    <p className="text-sm text-gray-600">Sign out of your account on this device</p>
                  </div>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-red-200 p-4 transition-colors hover:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
