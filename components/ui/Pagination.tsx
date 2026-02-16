import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type PaginationItem = number | 'ellipsis';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  disabled?: boolean;
}

function buildPageItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PaginationItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push('ellipsis');
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push('ellipsis');

  items.push(totalPages);
  return items;
}

function PageButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-11 min-w-11 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 text-sm text-[var(--text)] transition-colors hover:border-[var(--borderStrong)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]',
        className
      )}
      {...props}
    />
  );
}

export function Pagination({ currentPage, totalPages, onPageChange, className, disabled = false }: PaginationProps) {
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const items = buildPageItems(safeCurrentPage, Math.max(totalPages, 1));

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center gap-2', className)}>
      <PageButton
        aria-label="Go to previous page"
        onClick={() => onPageChange?.(safeCurrentPage - 1)}
        disabled={disabled || safeCurrentPage <= 1}
      >
        Prev
      </PageButton>

      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="min-h-11 min-w-6 self-center text-center text-[var(--textMuted)]">
            ...
          </span>
        ) : (
          <PageButton
            key={item}
            aria-label={`Go to page ${item}`}
            aria-current={item === safeCurrentPage ? 'page' : undefined}
            className={cn(item === safeCurrentPage && 'border-[var(--yellow)] bg-[rgba(255,211,29,0.14)]')}
            onClick={() => onPageChange?.(item)}
            disabled={disabled}
          >
            {item}
          </PageButton>
        )
      )}

      <PageButton
        aria-label="Go to next page"
        onClick={() => onPageChange?.(safeCurrentPage + 1)}
        disabled={disabled || safeCurrentPage >= totalPages}
      >
        Next
      </PageButton>
    </nav>
  );
}
