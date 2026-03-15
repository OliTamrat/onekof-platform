'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Settings Page - Redirect to Dashboard Settings
 *
 * This page redirects to /dashboard/settings since the main
 * settings functionality is in the dashboard settings section.
 */
export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard settings
    router.replace('/dashboard/settings');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Redirecting to settings...</p>
      </div>
    </div>
  );
}
