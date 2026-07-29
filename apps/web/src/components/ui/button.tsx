import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-primary-400 dark:ring-offset-[#1B1F23]',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600',
        destructive: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-[#22272B] dark:text-white dark:hover:bg-[#282E33]',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700',
        ghost: 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
        link: 'text-primary-500 underline-offset-4 hover:underline dark:text-primary-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      /**
       * `layout` exists because the base class above is right for labels and
       * wrong for anything else, and the failure is silent.
       *
       * `inline` (default) keeps `inline-flex`, `justify-center` and
       * `whitespace-nowrap` — correct for "Save", "Add member", an icon and a
       * word. Unchanged from before this variant existed.
       *
       * `block` is for a button that is really a card or an option: a
       * selectable preset, a stacked title-and-description, anything whose
       * text must wrap. It drops the three properties that break that.
       *
       * Why this matters more than it looks: `whitespace-nowrap` INHERITS.
       * A wrapping paragraph nested three levels inside a Button still
       * refuses to wrap, and the height collapse that follows reads as a
       * styling accident rather than a component contract. This exact base
       * class broke four separate screens in one day — the Customization
       * presets, its toggles and header, the AI Insights cards, and the
       * onboarding option cards.
       */
      layout: {
        inline: '',
        block: 'flex-col items-stretch justify-start whitespace-normal text-left h-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      layout: 'inline',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, layout, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, layout, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
