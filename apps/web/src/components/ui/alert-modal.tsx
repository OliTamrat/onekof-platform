'use client';

import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-primary-500" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#282E33] shadow-2xl">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"
          title="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6 pl-9">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pl-9">
            {cancelText && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
