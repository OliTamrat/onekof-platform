'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWorkspace } from '@/contexts/workspace-context';

/**
 * Client-side component that checks if user needs onboarding
 * and redirects accordingly
 */
export function OnboardingChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { organizations, isLoadingOrganizations } = useWorkspace();

  useEffect(() => {
    // Only check when authenticated and not loading
    if (status !== 'authenticated' || isLoadingOrganizations) {
      return;
    }

    // If no organizations and not already on onboarding page, redirect
    if (organizations.length === 0 && !pathname?.startsWith('/onboarding')) {
      router.push('/onboarding');
    }

    // If has organizations but on onboarding page, redirect to dashboard
    if (organizations.length > 0 && pathname?.startsWith('/onboarding')) {
      router.push('/dashboard');
    }
  }, [status, isLoadingOrganizations, organizations.length, pathname, router]);

  return null;
}
