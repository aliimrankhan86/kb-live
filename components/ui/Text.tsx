import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextSize = 'xs' | 'sm' | 'md' | 'lg';
type TextTone = 'default' | 'muted' | 'accent' | 'danger';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
  tone?: TextTone;
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs leading-5',
  sm: 'text-sm leading-6',
  md: 'text-base leading-7',
  lg: 'text-lg leading-8',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-[var(--text)]',
  muted: 'text-[var(--textMuted)]',
  accent: 'text-[var(--yellow)]',
  danger: 'text-red-500',
};

export function Text({ className, size = 'md', tone = 'default', ...props }: TextProps) {
  return <p className={cn(sizeClasses[size], toneClasses[tone], className)} {...props} />;
}
