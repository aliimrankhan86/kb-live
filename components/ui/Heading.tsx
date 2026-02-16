import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | 'display';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
  children: ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  sm: 'text-lg font-semibold tracking-tight',
  base: 'text-xl font-semibold tracking-tight',
  lg: 'text-2xl font-semibold tracking-tight',
  xl: 'text-3xl font-semibold tracking-tight',
  '2xl': 'text-4xl font-semibold tracking-tight',
  '3xl': 'text-5xl font-semibold tracking-tight',
  display: 'text-5xl font-semibold tracking-tight md:text-6xl',
};

export function Heading({ as = 2, size = 'lg', className, children, ...props }: HeadingProps) {
  const Tag = `h${as}` as ElementType;

  return (
    <Tag className={cn('text-[var(--text)]', sizeClasses[size], className)} {...props}>
      {children}
    </Tag>
  );
}
