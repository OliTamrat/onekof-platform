'use client';

import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

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
        return <Info className="h-6 w-6 text-[#0065FF]" />;
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
      <div className="relative w-full max-w-md rounded-lg border border-[#2C333A] bg-[#22272B] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#9FADBC] hover:text-white transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6 pl-9">
            <p className="text-sm text-[#9FADBC] leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pl-9">
            {cancelText && (
              <button
                onClick={onClose}
                className="rounded-md border border-[#2C333A] bg-[#282E33] px-4 py-2 text-sm font-medium text-white hover:bg-[#2C333A] transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="rounded-md bg-[#0065FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052CC] transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
