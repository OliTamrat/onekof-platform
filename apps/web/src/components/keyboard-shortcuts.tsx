'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface Shortcut {
  keys: string[];
  descriptionKey: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Global
  { keys: ['Ctrl', 'K'], descriptionKey: 'keyboardShortcuts.openCommandPalette', category: 'keyboardShortcuts.global' },
  { keys: ['?'], descriptionKey: 'keyboardShortcuts.showShortcuts', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'H'], descriptionKey: 'keyboardShortcuts.goToHome', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'P'], descriptionKey: 'keyboardShortcuts.goToProjects', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'I'], descriptionKey: 'keyboardShortcuts.goToIssues', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'B'], descriptionKey: 'keyboardShortcuts.goToBudget', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'T'], descriptionKey: 'keyboardShortcuts.goToTeams', category: 'keyboardShortcuts.global' },
  { keys: ['G', 'O'], descriptionKey: 'keyboardShortcuts.goToGoals', category: 'keyboardShortcuts.global' },
  // Actions
  { keys: ['C'], descriptionKey: 'keyboardShortcuts.createNewIssue', category: 'keyboardShortcuts.actions' },
  { keys: ['N', 'P'], descriptionKey: 'keyboardShortcuts.newProject', category: 'keyboardShortcuts.actions' },
  { keys: ['/'], descriptionKey: 'keyboardShortcuts.focusSearch', category: 'keyboardShortcuts.actions' },
  { keys: ['Esc'], descriptionKey: 'keyboardShortcuts.closeModal', category: 'keyboardShortcuts.actions' },
];

export function KeyboardShortcutsModal() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on '?' when no input is focused
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === '?' && !isInputFocused && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const grouped = shortcuts.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-full max-w-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1D2125]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <Keyboard className="h-5 w-5 text-primary-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t('keyboardShortcuts.title')}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Shortcuts List */}
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-5 last:mb-0">
                <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t(category)}
                </h3>
                <div className="space-y-1">
                  {items.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {t(shortcut.descriptionKey)}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, ki) => (
                          <React.Fragment key={ki}>
                            {ki > 0 && (
                              <span className="text-[10px] text-slate-400">+</span>
                            )}
                            <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-slate-200 bg-slate-100 px-1.5 text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700">
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              {t('keyboardShortcuts.pressToToggle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to register keyboard shortcuts for navigation.
 * Add this to your layout to enable G+key navigation shortcuts.
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const pendingKey = React.useRef<string | null>(null);
  const pendingTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputFocused || e.metaKey || e.ctrlKey || e.altKey) return;

      // Handle two-key combos (G + key)
      if (pendingKey.current === 'g') {
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        pendingKey.current = null;

        const routes: Record<string, string> = {
          h: '/dashboard',
          p: '/dashboard/projects',
          i: '/dashboard/issues',
          b: '/dashboard/budget',
          t: '/dashboard/teams',
          o: '/dashboard/goals',
          d: '/dashboard/documents',
          a: '/dashboard/automations',
        };

        if (routes[e.key]) {
          e.preventDefault();
          router.push(routes[e.key]);
        }
        return;
      }

      // Start two-key combo
      if (e.key === 'g') {
        pendingKey.current = 'g';
        pendingTimeout.current = setTimeout(() => {
          pendingKey.current = null;
        }, 500);
        return;
      }

      // Single-key shortcuts
      if (e.key === 'c' && !isInputFocused) {
        e.preventDefault();
        router.push('/dashboard/issues?create=true');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, [router]);
}
