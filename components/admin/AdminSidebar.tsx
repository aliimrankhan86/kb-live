'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { label: 'Bank Changes', href: '/admin/bank-changes' },
  { label: 'Complaints', href: '/admin/complaints' },
  { label: 'Reconciliation', href: '/admin/reconciliation' },
];

const navItemClasses =
  'flex min-h-11 items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D]';

interface AdminSidebarProps {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-full md:w-[260px] md:self-start md:rounded-xl md:border md:border-[rgba(255,255,255,0.1)] md:bg-[#111111] md:p-4"
      aria-label="Admin navigation"
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">PilgrimCompare</p>
        <h2 className="text-xl font-semibold text-[#FFFFFF]">Admin</h2>
      </div>

      <nav className="space-y-2" aria-label="Admin sections">
        {adminNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${navItemClasses} ${
                active
                  ? 'border-[#FFD31D] bg-[rgba(255,211,29,0.12)] text-[#FFFFFF]'
                  : 'border-[rgba(255,255,255,0.08)] bg-transparent text-[rgba(255,255,255,0.78)] hover:border-[rgba(255,255,255,0.2)] hover:text-[#FFFFFF]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
        <p className="text-sm font-medium text-[#FFFFFF]">Admin</p>
        <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">{userEmail}</p>
      </div>

      <div className="mt-4 border-t border-[rgba(255,255,255,0.1)] pt-4">
        <a
          href="/"
          className="flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-xs text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.85)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to PilgrimCompare
        </a>
      </div>
    </aside>
  );
}
