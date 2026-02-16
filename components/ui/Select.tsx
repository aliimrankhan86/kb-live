import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options: SelectOption[];
  selectClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, helperText, errorMessage, options, selectClassName, id, ...props },
  ref
) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const helperId = helperText ? `${resolvedId}-help` : undefined;
  const errorId = errorMessage ? `${resolvedId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  const hasError = Boolean(errorMessage);

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={resolvedId} className="block text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={resolvedId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'min-h-11 w-full appearance-none truncate rounded-md border bg-[var(--surfaceDark)] px-3 py-2 pr-10 text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-[var(--danger)] focus-visible:outline-[var(--danger)]'
              : 'border-[var(--borderSubtle)] hover:border-[var(--borderStrong)] focus-visible:outline-[var(--focusRing)]',
            selectClassName
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled} className="truncate">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--textMuted)]">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
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
