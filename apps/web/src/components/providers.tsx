'use client';

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from '@/contexts/workspace-context';
import { ErrorBoundary } from '@/components/error-boundary';

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
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
