'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  label: string;
  href: string;
  enabled: boolean;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/operator/dashboard', enabled: true },
  { label: 'Packages', href: '/operator/packages', enabled: true },
  { label: 'Analytics', href: '/operator/analytics', enabled: true },
  { label: 'Leads', href: '/operator/leads', enabled: false },
  { label: 'Profile', href: '/operator/profile', enabled: false },
  { label: 'Onboarding', href: '/operator/onboarding', enabled: false },
];

const navItemClasses =
  'flex min-h-11 items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D]';

export function OperatorSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mb-3 inline-flex min-h-11 items-center rounded-md border border-[rgba(255,255,255,0.15)] bg-[#111111] px-3 py-2 text-sm font-medium text-[#FFFFFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D] md:hidden"
        aria-expanded={mobileOpen}
        aria-controls="operator-sidebar-panel"
        onClick={() => setMobileOpen((prev) => !prev)}
        data-testid="operator-sidebar-toggle"
      >
        {mobileOpen ? 'Close menu' : 'Menu'}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Dismiss operator menu overlay"
        />
      ) : null}

      <aside
        id="operator-sidebar-panel"
        data-testid="operator-sidebar"
        className={`${
          mobileOpen ? 'max-md:block' : 'max-md:hidden'
        } fixed left-0 top-0 z-40 h-full w-[260px] border-r border-[rgba(255,255,255,0.1)] bg-[#111111] p-4 md:static md:block md:h-auto md:w-[260px] md:self-start md:rounded-xl md:border`}
        aria-label="Operator navigation"
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="mb-4 inline-flex min-h-11 items-center rounded-md border border-[rgba(255,255,255,0.15)] px-3 py-2 text-sm font-medium text-[#FFFFFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD31D] md:hidden"
            aria-label="Close operator menu"
          >
            Close menu
          </button>
          <p className="text-xs uppercase tracking-wide text-[rgba(255,255,255,0.64)]">KaabaTrip</p>
          <h2 className="text-xl font-semibold text-[#FFFFFF]">Operator</h2>
        </div>

        <nav className="space-y-2" aria-label="Operator sections">
          {navItems.map((item) => {
            const active = item.enabled && pathname === item.href;

            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  className={`${navItemClasses} cursor-not-allowed border-[rgba(255,255,255,0.08)] bg-transparent text-[rgba(255,255,255,0.4)]`}
                  aria-disabled="true"
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase text-[rgba(255,255,255,0.45)]">Coming soon</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
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

        <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4 text-xs text-[rgba(255,255,255,0.64)]">
          <p className="text-sm font-medium text-[#FFFFFF]">Al-Hidayah Travel</p>
          <p className="mt-1">Status: Verified</p>
        </div>
      </aside>
    </>
  );
}
