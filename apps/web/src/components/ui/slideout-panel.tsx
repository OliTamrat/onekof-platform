'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SlideoutPanelProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showFooter?: boolean;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export function SlideoutPanel({
  open,
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showFooter = false,
  footer,
  headerActions,
  className,
}: SlideoutPanelProps) {
  const isVisible = open ?? isOpen ?? false;
  const [isRendered, setIsRendered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Handle mount/unmount with animation
  React.useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
      return;
    }
    setIsAnimating(false);
    const timer = setTimeout(() => setIsRendered(false), 300);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isVisible && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isVisible]);

  if (!isRendered) return null;

  const sizeClasses = {
    sm: 'max-w-[calc(100%-2rem)] sm:max-w-md',
    md: 'max-w-[calc(100%-1rem)] sm:max-w-2xl',
    lg: 'max-w-full sm:max-w-4xl',
    xl: 'max-w-full sm:max-w-6xl',
    full: 'max-w-full',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Panel'}
      onKeyDown={handleKeyDown}
    >
      {/* Overlay with fade animation */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel with slide animation */}
      <div
        ref={panelRef}
        className={cn(
          'relative flex h-full w-full flex-col bg-white dark:bg-[#12161B] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isAnimating ? 'translate-x-0' : 'translate-x-full',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Teal accent top bar */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#1C8C7D] to-[#1C8C7D]/60 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {headerActions}
            {title && (
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 flex-shrink-0 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        {showFooter && footer && (
          <div className="border-t border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#0B0E11] px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Slideout Panel Content - Main scrollable area
interface SlideoutPanelContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideoutPanelContent({ children, className }: SlideoutPanelContentProps) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6', className)}>
      {children}
    </div>
  );
}

// Slideout Panel Sidebar - Optional right sidebar
interface SlideoutPanelSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideoutPanelSidebar({ children, className }: SlideoutPanelSidebarProps) {
  return (
    <div className={cn('hidden sm:block w-64 overflow-y-auto border-l border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-[#181D23] px-4 sm:px-6 py-4 sm:py-6', className)}>
      {children}
    </div>
  );
}

// Slideout Panel Section - For organizing content
interface SlideoutPanelSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function SlideoutPanelSection({ title, children, className }: SlideoutPanelSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      )}
      {children}
    </div>
  );
}
