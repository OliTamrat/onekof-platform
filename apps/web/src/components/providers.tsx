'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { WorkspaceProvider } from '@/contexts/workspace-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
