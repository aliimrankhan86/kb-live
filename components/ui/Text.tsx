import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type TextTone = 'default' | 'muted' | 'accent' | 'danger' | 'success' | 'warning';
type TextAs = 'p' | 'span' | 'small' | 'label' | 'div';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: TextAs;
  size?: TextSize;
  tone?: TextTone;
}

const sizeClasses: Record<TextSize, string> = {
  xs: 'text-xs leading-4',
  sm: 'text-sm leading-5',
  base: 'text-base leading-6',
  lg: 'text-lg leading-7',
  xl: 'text-xl leading-8',
  '2xl': 'text-2xl leading-9',
};

const toneClasses: Record<TextTone, string> = {
  default: 'text-[var(--text)]',
  muted: 'text-[var(--textMuted)]',
  accent: 'text-[var(--yellow)]',
  danger: 'text-[var(--danger)]',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning)]',
};

export function Text({ as = 'p', className, size = 'base', tone = 'default', ...props }: TextProps) {
  const Tag = as as ElementType;
  return <Tag className={cn(sizeClasses[size], toneClasses[tone], className)} {...props} />;
}
