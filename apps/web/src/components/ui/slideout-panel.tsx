'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideoutPanelProps {
  open: boolean;
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
  onClose,
  title,
  children,
  size = 'lg',
  showFooter = false,
  footer,
  headerActions,
  className,
}: SlideoutPanelProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50 backdrop-blur-sm">
      {/* Overlay - clicking closes panel */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-white dark:bg-[#22272B] shadow-2xl',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-4">
          <div className="flex items-center gap-3">
            {headerActions}
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-600 dark:text-[#9FADBC] transition-colors hover:bg-gray-100 dark:hover:bg-[#2C333A] hover:text-gray-900 dark:hover:text-white"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        {showFooter && footer && (
          <div className="border-t border-gray-200 dark:border-[#2C333A] bg-gray-50 dark:bg-[#1B1F23] px-6 py-4">
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
    <div className={cn('flex-1 overflow-y-auto px-8 py-6', className)}>
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
    <div className={cn('w-64 overflow-y-auto border-l border-gray-200 dark:border-[#2C333A] bg-gray-50 dark:bg-[#1B1F23] px-6 py-6', className)}>
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
