import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'display' | 'xl' | 'lg' | 'md' | 'sm';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
  children: ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  display: 'text-4xl font-semibold tracking-tight md:text-5xl',
  xl: 'text-3xl font-semibold tracking-tight md:text-4xl',
  lg: 'text-2xl font-semibold tracking-tight md:text-3xl',
  md: 'text-xl font-semibold tracking-tight md:text-2xl',
  sm: 'text-lg font-semibold tracking-tight md:text-xl',
};

export function Heading({ as = 2, size = 'lg', className, children, ...props }: HeadingProps) {
  const Tag = `h${as}` as ElementType;

  return (
    <Tag className={cn('text-[var(--text)]', sizeClasses[size], className)} {...props}>
      {children}
    </Tag>
  );
}
