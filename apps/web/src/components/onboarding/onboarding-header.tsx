'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Building2 } from 'lucide-react';

export function OnboardingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#1B1F23]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#16A085] text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <img src="/logo-wordmark.png" alt="Onekof" className="h-7" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Setup your workspace</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
