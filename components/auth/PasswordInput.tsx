'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  helperText?: string;
  inputClassName?: string;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  toggleTestId: string;
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {hidden ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.1 5.4A9.8 9.8 0 0 1 12 5c5 0 8.4 4.2 9.5 5.8a1.9 1.9 0 0 1 0 2.4 18.4 18.4 0 0 1-2.2 2.5" />
          <path d="M6.7 6.7a18 18 0 0 0-4.2 4.1 1.9 1.9 0 0 0 0 2.4C3.6 14.8 7 19 12 19a9.8 9.8 0 0 0 4.1-.9" />
        </>
      ) : (
        <>
          <path d="M2.5 10.8C3.6 9.2 7 5 12 5s8.4 4.2 9.5 5.8a1.9 1.9 0 0 1 0 2.4C20.4 14.8 17 19 12 19s-8.4-4.2-9.5-5.8a1.9 1.9 0 0 1 0-2.4Z" />
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </>
      )}
    </svg>
  );
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    className,
    label,
    helperText,
    inputClassName,
    id,
    showPassword,
    onToggleShowPassword,
    toggleTestId,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const helperId = helperText ? `${resolvedId}-help` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={resolvedId} className="block text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={resolvedId}
          type={showPassword ? 'text' : 'password'}
          aria-describedby={helperId}
          className={cn(
            'min-h-11 w-full rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-2 pr-12 text-sm text-[var(--text)] placeholder:text-[var(--textMuted)] hover:border-[var(--borderStrong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] disabled:cursor-not-allowed disabled:opacity-50',
            inputClassName
          )}
          {...props}
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute inset-y-0 right-0 inline-flex min-h-11 w-11 items-center justify-center rounded-r-md text-[var(--textMuted)] transition-colors hover:text-[var(--yellow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          data-testid={toggleTestId}
        >
          <EyeIcon hidden={showPassword} />
        </button>
      </div>
      {helperText ? (
        <p id={helperId} className="text-xs text-[var(--textMuted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
