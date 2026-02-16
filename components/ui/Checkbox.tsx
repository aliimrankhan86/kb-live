import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, label, helperText, id, ...props },
  ref
) {
  const resolvedId = id ?? `checkbox-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`;

  return (
    <label htmlFor={resolvedId} className={cn('flex min-h-11 cursor-pointer items-start gap-3', className)}>
      <input
        ref={ref}
        id={resolvedId}
        type="checkbox"
        className="mt-0.5 h-5 w-5 rounded border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] text-[var(--yellow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
        {...props}
      />
      <span className="flex-1">
        {label ? <span className="block text-sm font-medium text-[var(--text)]">{label}</span> : null}
        {helperText ? <span className="block text-xs text-[var(--textMuted)]">{helperText}</span> : null}
      </span>
    </label>
  );
});
