'use client';

import * as React from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

const iconConfig = {
  info: { Icon: Info, bg: 'bg-[#1C8C7D]/10', text: 'text-[#1C8C7D]', border: 'border-[#1C8C7D]/20' },
  success: { Icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  warning: { Icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  error: { Icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
};

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  cancelText,
}: AlertModalProps) {
  const [isRendered, setIsRendered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
      return;
    }
    setIsAnimating(false);
    const timer = setTimeout(() => setIsRendered(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  const { Icon, bg, text, border } = iconConfig[type];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-colors duration-200',
        isAnimating ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-transparent'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full sm:max-w-md bg-white dark:bg-[#282E33] shadow-2xl transition-all duration-200 ease-out',
          // Mobile: bottom sheet with rounded top
          'rounded-t-2xl sm:rounded-xl',
          // Border
          'border border-slate-200/80 dark:border-white/[0.08]',
          // Animation
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 sm:translate-y-4 opacity-0 sm:scale-[0.97]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Teal accent — desktop */}
        <div className="hidden sm:block h-[3px] w-full bg-gradient-to-r from-[#1C8C7D] to-[#1C8C7D]/60 rounded-t-xl" />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-5 h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 active:scale-95 dark:hover:text-white dark:hover:bg-white/[0.06] transition-all"
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Icon and Title */}
          <div className="mb-4 flex items-start gap-3">
            <div className={cn('flex-shrink-0 mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center border', bg, border)}>
              <Icon className={cn('h-5 w-5', text)} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6 pl-[52px]">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pl-0 sm:pl-[52px]">
            {cancelText && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-10 rounded-lg"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto h-10 rounded-lg bg-[#1C8C7D] hover:bg-[#167A6E] text-white"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
