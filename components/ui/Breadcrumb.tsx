import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // Mobile back-affordance: nearest ancestor with an href (skipping the current page)
  const parent = [...items].reverse().find((item, idx) => idx > 0 && item.href);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {/* Mobile: compact "← parent" back link */}
      {parent && parent.href && (
        <Link
          href={parent.href}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[var(--textMuted)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2 transition-colors sm:hidden"
          data-testid="breadcrumb-back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="truncate">{parent.label}</span>
        </Link>
      )}

      {/* Desktop: full breadcrumb trail */}
      <ol className={`${parent ? 'hidden sm:flex' : 'flex'} flex-wrap items-center gap-1 text-sm text-[var(--textMuted)]`}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true" className="text-[var(--borderStrong)]">/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[var(--text)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--yellow)] focus-visible:outline-offset-2 rounded-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-[var(--text)]' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
