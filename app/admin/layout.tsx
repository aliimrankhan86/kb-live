import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth/session';

const adminNavItems = [
  { label: 'Bank Changes', href: '/admin/bank-changes' },
  { label: 'Complaints', href: '/admin/complaints' },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?redirect=/admin/bank-changes');
  }

  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#FFFFFF]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-4 md:flex-row md:gap-6 md:px-6 md:py-6">
        {/* Sidebar */}
        <aside
          className="w-full md:w-[260px] md:self-start md:rounded-xl md:border md:border-[rgba(255,255,255,0.1)] md:bg-[#111111] md:p-4"
          aria-label="Admin navigation"
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">KaabaTrip</p>
            <h2 className="text-xl font-semibold text-[#FFFFFF]">Admin</h2>
          </div>

          <nav className="space-y-2" aria-label="Admin sections">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-md border border-[rgba(255,255,255,0.08)] bg-transparent px-3 py-2 text-sm font-medium text-[rgba(255,255,255,0.78)] transition-colors hover:border-[rgba(255,255,255,0.2)] hover:text-[#FFFFFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
            <p className="text-sm font-medium text-[#FFFFFF]">Admin</p>
            <p className="mt-2 text-xs text-[rgba(255,255,255,0.5)]">{user.email}</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111111] p-4 md:p-6">
          <header className="mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
            <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">Admin Portal</p>
            <h1 className="text-2xl font-semibold text-[#FFFFFF]">Dashboard</h1>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
