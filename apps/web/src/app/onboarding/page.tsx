'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/onboarding');
    }
  }, [status, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#1B1F23]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return <OnboardingFlow />;
}
