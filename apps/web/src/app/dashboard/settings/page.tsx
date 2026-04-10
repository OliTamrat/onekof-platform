'use client';

/**
 * Settings — Profile + Notifications + Security tabs
 *
 * Previously a stub. Now a real settings hub covering:
 * - Profile: name, bio, phone, timezone, language, avatar
 * - Notifications: email preferences for mentions, assignments, etc.
 * - Security: password change (link to /dashboard/settings/security for 2FA)
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User as UserIcon,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast-provider';
import { useLanguage } from '@/contexts/language-context';

type Tab = 'profile' | 'notifications' | 'security';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  timezone: string;
  language: string;
  preferences: Record<string, any>;
}

const TIMEZONES = [
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (EAT, UTC+3)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET, UTC+2)' },
  { value: 'Europe/London', label: 'London (GMT, UTC+0)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET, UTC+1)' },
  { value: 'America/New_York', label: 'New York (EST, UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST, UTC-8)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST, UTC+4)' },
];

const LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'AM', label: 'አማርኛ (Amharic)' },
  { value: 'OM', label: 'Afaan Oromoo' },
  { value: 'TI', label: 'ትግርኛ (Tigrinya)' },
  { value: 'SO', label: 'Soomaali' },
];

// Default notification preferences — used when the user's preferences.notifications
// JSON is empty. Any key not present defaults to true (opt-out model).
const DEFAULT_NOTIF_PREFS: Record<string, boolean> = {
  emailOnMention: true,
  emailOnAssignment: true,
  emailOnStatusChange: true,
  emailOnComment: false,
  emailOnDueDate: true,
  emailWeeklySummary: true,
};

export default function SettingsPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const { data, isLoading } = useQuery<{ user: UserProfile }>({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/update');
      if (!res.ok) throw new Error('Failed to load profile');
      return res.json();
    },
  });

  const user = data?.user;

  // Profile form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Africa/Addis_Ababa');
  const [language, setLanguage] = useState('EN');
  const [avatar, setAvatar] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(DEFAULT_NOTIF_PREFS);

  // Populate form when user data loads
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setBio(user.bio || '');
    setPhone(user.phone || '');
    setTimezone(user.timezone || 'Africa/Addis_Ababa');
    setLanguage(user.language || 'EN');
    setAvatar(user.avatar || '');
    const prefs = (user.preferences?.notifications || {}) as Record<string, boolean>;
    setNotifPrefs({ ...DEFAULT_NOTIF_PREFS, ...prefs });
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
      toast.success('Profile updated');
    },
    onError: (err: Error) => {
      toast.error('Update failed', err.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to change password');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Password changed', 'Your new password is now active.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: Error) => {
      toast.error('Password change failed', err.message);
    },
  });

  const handleSaveProfile = () => {
    profileMutation.mutate({ name, bio, phone, timezone, language, avatar });
  };

  const handleSaveNotifications = () => {
    profileMutation.mutate({ preferences: { notifications: notifPrefs } });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password too short', 'Must be at least 8 characters.');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const toggleNotif = (key: string) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppLayout>
      <div className="min-h-full bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <SettingsIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('nav.settings')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Manage your profile, preferences, and security
              </p>
            </div>
          </div>
        </div>

        {/* Tabs + Content — two-column layout on desktop, stacked on mobile */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Tab nav */}
            <nav className="md:w-48 shrink-0">
              <div className="flex md:flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Security
                </button>
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto" />
                </div>
              ) : (
                <>
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                      <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                          Profile information
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          Update your personal details
                        </p>
                      </div>

                      <div className="p-6 space-y-4">
                        {/* Avatar preview */}
                        <div className="flex items-center gap-4">
                          {avatar ? (
                            <img src={avatar} alt={name} className="h-16 w-16 rounded-full ring-2 ring-primary-500/20" />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-[#16A085] flex items-center justify-center text-white text-xl font-semibold ring-2 ring-primary-500/20">
                              {(name || user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              Avatar URL
                            </label>
                            <Input
                              value={avatar}
                              onChange={(e) => setAvatar(e.target.value)}
                              placeholder="https://..."
                              className="text-sm"
                            />
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Full name
                          </label>
                          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                        </div>

                        {/* Email (read-only) */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Email
                          </label>
                          <Input value={user?.email || ''} disabled className="opacity-60" />
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Contact support to change your email address.
                          </p>
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Bio
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="A short introduction about yourself"
                            className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Phone
                          </label>
                          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251..." />
                        </div>

                        {/* Timezone + Language row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              Timezone
                            </label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                            >
                              {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              Language
                            </label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-[#1B1F23] px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                            >
                              {LANGUAGES.map((l) => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-3 flex justify-end">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={profileMutation.isPending}
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                          {profileMutation.isPending ? (
                            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving</>
                          ) : (
                            <><Save className="h-4 w-4 mr-1.5" /> Save changes</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                      <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                          Email notifications
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          Choose what we email you about
                        </p>
                      </div>

                      <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {[
                          { key: 'emailOnMention', title: 'When I am @mentioned', desc: 'Email me when someone mentions me in a comment or description.' },
                          { key: 'emailOnAssignment', title: 'When I am assigned a task', desc: 'Email me when someone assigns me to a new task.' },
                          { key: 'emailOnStatusChange', title: 'When a task I watch changes status', desc: 'Email me for tasks I am watching when they move across the board.' },
                          { key: 'emailOnComment', title: 'Any comment on tasks I watch', desc: 'Noisy — only enable if you want every comment.' },
                          { key: 'emailOnDueDate', title: 'Upcoming due dates', desc: 'Reminders for tasks due soon that are assigned to me.' },
                          { key: 'emailWeeklySummary', title: 'Weekly activity summary', desc: "A Monday morning digest of your team's activity from the past week." },
                        ].map((item) => (
                          <div key={item.key} className="flex items-start justify-between gap-4 px-6 py-4">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                              <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                            </div>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={notifPrefs[item.key] || false}
                              onClick={() => toggleNotif(item.key)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                                notifPrefs[item.key] ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                  notifPrefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-3 flex justify-end">
                        <Button
                          onClick={handleSaveNotifications}
                          disabled={profileMutation.isPending}
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                          {profileMutation.isPending ? (
                            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving</>
                          ) : (
                            <><Save className="h-4 w-4 mr-1.5" /> Save preferences</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
                        <div className="border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Change password
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            At least 8 characters; use a unique password
                          </p>
                        </div>

                        <div className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              Current password
                            </label>
                            <Input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Your current password"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              New password
                            </label>
                            <Input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 8 characters"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                              Confirm new password
                            </label>
                            <Input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-3 flex justify-end">
                          <Button
                            onClick={handleChangePassword}
                            disabled={
                              passwordMutation.isPending ||
                              !currentPassword ||
                              !newPassword ||
                              !confirmPassword
                            }
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                          >
                            {passwordMutation.isPending ? (
                              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Changing</>
                            ) : (
                              <><Check className="h-4 w-4 mr-1.5" /> Change password</>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] p-6">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Two-factor authentication
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                          Add an extra layer of security to your account with TOTP (authenticator app).
                        </p>
                        <a
                          href="/dashboard/settings/security"
                          className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600"
                        >
                          <Shield className="h-4 w-4" />
                          Manage 2FA settings
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
