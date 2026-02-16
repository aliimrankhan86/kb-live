import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, label, id, ...props },
  ref
) {
  const resolvedId = id ?? `switch-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'field'}`;

  return (
    <label htmlFor={resolvedId} className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-3', className)}>
      {label ? <span className="text-sm font-medium text-[var(--text)]">{label}</span> : null}
      <span className="relative inline-flex items-center">
        <input ref={ref} id={resolvedId} type="checkbox" className="peer sr-only" {...props} />
        <span className="block h-6 w-11 rounded-full bg-[var(--borderSubtle)] transition-colors peer-checked:bg-[var(--yellow)] peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-[var(--text)] transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
});
