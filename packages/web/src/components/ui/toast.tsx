import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Viewport>) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "data-[swipe=move]:transition-none grow-1 group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full mt-4 data-[state=closed]:slide-out-to-right-full dark:border-slate-700 last:mt-0 sm:last:mt-4",
  {
    variants: {
      variant: {
        default:
          "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700",
        warning:
          "group warning bg-yellow-700 text-white border-yellow-600 dark:border-yellow-600",
        destructive:
          "group destructive bg-red-700 text-white border-red-600 dark:border-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = ({
  className,
  variant,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
};
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Action>) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-100 group-[.destructive]:hover:border-slate-50 group-[.destructive]:hover:bg-red-100 group-[.destructive]:hover:text-red-600 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800",
      className,
    )}
    {...props}
  />
);
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Close>) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute top-2 right-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:hover:text-slate-50",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Title>) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = ({
  className,
  ref,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Description>) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 overflow-auto", className)}
    {...props}
  />
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
