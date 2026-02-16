import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.06)] text-[var(--text)]',
  success: 'border-[var(--success)]/60 bg-[color:rgba(34,197,94,0.16)] text-[var(--success)]',
  warning: 'border-[var(--warning)]/60 bg-[color:rgba(245,158,11,0.16)] text-[var(--warning)]',
  danger: 'border-[var(--danger)]/60 bg-[color:rgba(239,68,68,0.16)] text-[var(--danger)]',
  info: 'border-[var(--info)]/60 bg-[color:rgba(56,189,248,0.16)] text-[var(--info)]',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full border px-2.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
