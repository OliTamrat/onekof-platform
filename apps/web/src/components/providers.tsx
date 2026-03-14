'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from '@/contexts/workspace-context';
import { OrganizationSettingsProvider } from '@/contexts/organization-settings-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client inside the component to avoid sharing state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
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
              <WorkspaceProvider>
                <OrganizationSettingsWrapper>
                  {children}
                </OrganizationSettingsWrapper>
              </WorkspaceProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}

// Wrapper to access workspace context
function OrganizationSettingsWrapper({ children }: { children: React.ReactNode }) {
  // We can't use useWorkspace here directly because it would create a circular dependency
  // Instead, we'll let the OrganizationSettingsProvider handle fetching when needed
  // The sidebar component will pass the settings when available
  return (
    <OrganizationSettingsProvider>
      {children}
    </OrganizationSettingsProvider>
  );
}
