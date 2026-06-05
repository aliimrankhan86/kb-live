import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  hasError?: boolean;
  textareaClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, helperText, errorMessage, hasError = false, textareaClassName, id, ...props },
  ref
) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const hasStateError = hasError || Boolean(errorMessage);
  const helperId = helperText ? `${resolvedId}-help` : undefined;
  const errorId = hasStateError ? `${resolvedId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={resolvedId} className="block text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={resolvedId}
        aria-invalid={hasStateError || undefined}
        aria-describedby={describedBy}
        className={cn(
          'min-h-28 w-full rounded-md border bg-[var(--surfaceDark)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hasStateError
            ? 'border-[var(--danger)] focus-visible:outline-[var(--danger)]'
            : 'border-[var(--borderSubtle)] hover:border-[var(--borderStrong)] focus-visible:outline-[var(--focusRing)]',
          textareaClassName
        )}
        {...props}
      />
      {errorMessage ? (
        <p id={errorId} className="text-xs text-[var(--danger)]">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--textMuted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
