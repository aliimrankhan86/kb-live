'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

/* ─── Shared close button — used by OverlayHeader ─────────────────────── */
const CloseButton = () => (
  <DialogPrimitive.Close className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[var(--borderSubtle)] bg-transparent text-[var(--textMuted)] transition-colors hover:border-[var(--yellow)] hover:bg-[rgba(255,211,29,0.06)] hover:text-[var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focusRing)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surfaceDark)] disabled:pointer-events-none">
    <span className="sr-only">Close</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </DialogPrimitive.Close>
);

/* ─── OverlayContent ───────────────────────────────────────────────────── */
export const OverlayContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
  }
>(({ className, children, overlayClassName, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        overlayClassName
      )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Flex column so header/body/footer stack cleanly; overflow-hidden so
        // only OverlayBody scrolls, not the whole dialog.
        'fixed left-1/2 top-1/2 z-50 flex max-h-[88vh] w-[min(100%-1rem,44rem)] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] shadow-[var(--shadowSoft)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:w-[min(100%-2rem,44rem)]',
        className
      )}
      {...props}
    >
      <DialogPrimitive.Description className="sr-only">
        Dialog content
      </DialogPrimitive.Description>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
OverlayContent.displayName = DialogPrimitive.Content.displayName;

/* ─── OverlayHeader — flex row: title left, close button right ─────────── */
export const OverlayHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-shrink-0 items-start justify-between gap-3 border-b border-[var(--borderSubtle)] px-5 py-4',
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 flex-1 flex-col space-y-1">{children}</div>
    <CloseButton />
  </div>
);
OverlayHeader.displayName = 'OverlayHeader';

/* ─── OverlayBody — scrollable content area between header and footer ──── */
export const OverlayBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex-1 overflow-y-auto p-5', className)}
    {...props}
  />
);
OverlayBody.displayName = 'OverlayBody';

/* ─── OverlayFooter — sticky at bottom with top border ────────────────── */
export const OverlayFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-shrink-0 flex-col-reverse gap-2 border-t border-[var(--borderSubtle)] px-5 py-4 sm:flex-row sm:justify-end',
      className
    )}
    {...props}
  />
);
OverlayFooter.displayName = 'OverlayFooter';

/* ─── OverlayTitle ─────────────────────────────────────────────────────── */
export const OverlayTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-[var(--yellow)]',
      className
    )}
    {...props}
  />
));
OverlayTitle.displayName = DialogPrimitive.Title.displayName;

/* ─── OverlayDescription ───────────────────────────────────────────────── */
export const OverlayDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--textMuted)]', className)}
    {...props}
  />
));
OverlayDescription.displayName = DialogPrimitive.Description.displayName;
