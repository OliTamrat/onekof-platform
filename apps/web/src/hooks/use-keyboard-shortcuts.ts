'use client';

import { useEffect } from 'react';

export interface KeyboardShortcut {
  /** Key to listen for (e.g. 'c', '/', 'Escape') */
  key: string;
  /** Require Ctrl/Cmd modifier */
  ctrl?: boolean;
  /** Require Shift modifier */
  shift?: boolean;
  /** Callback when shortcut fires */
  handler: (e: KeyboardEvent) => void;
  /** Disable when user is typing in an input/textarea/contenteditable */
  disableInInput?: boolean;
}

/**
 * Global keyboard shortcuts hook.
 *
 * Usage:
 *   useKeyboardShortcuts([
 *     { key: 'c', handler: () => setShowCreate(true), disableInInput: true },
 *     { key: '/', handler: () => searchRef.current?.focus(), disableInInput: true },
 *     { key: 'Escape', handler: () => setOpen(false) },
 *   ]);
 *
 * By default `disableInInput` is true — shortcuts don't fire while the user is
 * typing in form fields. Pass false to force a shortcut to work everywhere
 * (useful for Escape).
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in a form field
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const disableInInput = shortcut.disableInInput ?? true;
        if (isTyping && disableInInput) continue;

        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatches && ctrlMatches && shiftMatches) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
