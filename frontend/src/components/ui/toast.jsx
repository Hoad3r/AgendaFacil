import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ({ className, ...props }) => (
  <ToastPrimitive.Viewport
    className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
    {...props}
  />
);

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const Toast = ({ className, variant, ...props }) => (
  <ToastPrimitive.Root className={cn(toastVariants({ variant }), className)} {...props} />
);

export const ToastAction = ({ className, ...props }) => (
  <ToastPrimitive.Action
    className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50', className)}
    {...props}
  />
);

export const ToastClose = ({ className, ...props }) => (
  <ToastPrimitive.Close
    className={cn('absolute right-1 top-1 rounded-md p-1 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100', className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
);

export const ToastTitle = ({ className, ...props }) => (
  <ToastPrimitive.Title className={cn('text-sm font-semibold [&+div]:text-xs', className)} {...props} />
);

export const ToastDescription = ({ className, ...props }) => (
  <ToastPrimitive.Description className={cn('text-sm opacity-90', className)} {...props} />
);
