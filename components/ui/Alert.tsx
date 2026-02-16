import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-[var(--info)]/60 bg-[color:rgba(56,189,248,0.12)]',
  success: 'border-[var(--success)]/60 bg-[color:rgba(34,197,94,0.12)]',
  warning: 'border-[var(--warning)]/60 bg-[color:rgba(245,158,11,0.12)]',
  error: 'border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.12)]',
};

export function Alert({ variant = 'info', className, ...props }: AlertProps) {
  return (
    <div
      role="status"
      className={cn(
        'rounded-md border px-3 py-2 text-sm text-[var(--text)]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
