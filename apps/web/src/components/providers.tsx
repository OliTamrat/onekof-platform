'use client';

import { useState, useEffect , type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider, useWorkspace } from '@/contexts/workspace-context';
import { OrganizationSettingsProvider } from '@/contexts/organization-settings-context';
import { LanguageProvider } from '@/contexts/language-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast-provider';
import { LiveAnnouncerProvider } from '@/components/ui/live-announcer';

export function Providers({ children }: { children: ReactNode }) {
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Create a client inside the component to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes — reduces refetch storm on navigation
            gcTime: 10 * 60 * 1000, // 10 minutes — keep data around longer
            refetchOnWindowFocus: false,
            refetchOnMount: false, // use cached data on mount if fresh
            retry: 1, // avoid 3x retry loop on slow networks
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              <LiveAnnouncerProvider>
                <WorkspaceProvider>
                  <OrganizationSettingsWrapper>
                    {children}
                  </OrganizationSettingsWrapper>
                </WorkspaceProvider>
              </LiveAnnouncerProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

// Wrapper rendered inside WorkspaceProvider so real org settings load
// for the current organization (nulls fall back to provider defaults).
function OrganizationSettingsWrapper({ children }: { children: ReactNode }) {
  const { currentOrganization } = useWorkspace();
  return (
    <OrganizationSettingsProvider organizationId={currentOrganization?.id}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </OrganizationSettingsProvider>
  );
}
