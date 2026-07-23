'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const childArray = React.Children.toArray(children);
  const footerChildren: React.ReactNode[] = [];
  const otherChildren: React.ReactNode[] = [];

  childArray.forEach((child) => {
    if (React.isValidElement(child) && (child.type as any)?.displayName === 'DialogFooter') {
      footerChildren.push(child);
    } else {
      otherChildren.push(child);
    }
  });

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col border shadow-2xl duration-300 overflow-hidden',
          'border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-[#282E33]',
          'inset-x-0 bottom-0 rounded-t-2xl max-h-[92vh]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:slide-in-from-bottom-full data-[state=open]:fade-in-0',
          'data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:fade-out-0',
          'sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-lg',
          'sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-[0.97]',
          'sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-[0.97]',
          className
        )}
        {...props}
      >
        {/* Mobile drag handle indicator */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Teal accent top border — desktop only */}
        <div className="hidden sm:block h-[3px] w-full bg-gradient-to-r from-[#1C8C7D] to-[#1C8C7D]/60 flex-shrink-0" />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {otherChildren}
        </div>

        {/* Footer pinned to bottom — never scrolls away */}
        {footerChildren.length > 0 && (
          <div className="flex-shrink-0 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#282E33] px-4 py-3 sm:px-6 sm:py-4">
            {footerChildren}
          </div>
        )}

        <DialogPrimitive.Close className="absolute right-3 top-3 sm:right-4 sm:top-4 h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg sm:rounded-md text-slate-400 transition-all hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1C8C7D] focus:ring-offset-2 active:scale-95 dark:text-slate-500 dark:hover:text-white dark:hover:bg-white/[0.08] dark:ring-offset-[#282E33]">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-white',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
