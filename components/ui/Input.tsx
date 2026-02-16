import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'min-h-11 w-full rounded-md border bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] disabled:cursor-not-allowed disabled:opacity-50',
        hasError
          ? 'border-red-500 focus-visible:outline-red-500'
          : 'border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)]',
        className
      )}
      {...props}
    />
  );
});
