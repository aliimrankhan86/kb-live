import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, options, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        'min-h-11 w-full appearance-none rounded-md border border-[rgba(255,255,255,0.15)] bg-[var(--surfaceDark)] px-3 py-2 pr-10 text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yellow)] hover:border-[rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
