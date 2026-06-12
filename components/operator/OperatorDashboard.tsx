'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Repository } from '@/lib/api/repository';
import { QuoteRequest, Package } from '@/lib/types';

type DashboardStats = {
  publishedPackages: number;
  draftPackages: number;
  activeLeads: number;
  offersSent: number;
  bookingIntents: number;
};

type ActivityItem = { title: string; date: string; type: 'lead' | 'offer' | 'booking' };

const EMPTY_STATS: DashboardStats = {
  publishedPackages: 0,
  draftPackages: 0,
  activeLeads: 0,
  offersSent: 0,
  bookingIntents: 0,
};

/** Compact relative timestamp, e.g. "just now", "5m ago", "3h ago", "2d ago". */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function useDashboardData(operatorId: string) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = useCallback(async () => {
    const ctx = { userId: operatorId, role: 'operator' as const };
    setIsLoading(true);

    const allPackages = await Repository.getPackagesByOperator(operatorId);
    const allRequests = await Repository.getRequests(ctx);
    const offers = await Repository.getOffers(ctx);
    const bookings = await Repository.getBookingIntents(ctx);

    setPackages(allPackages);
    setStats({
      publishedPackages: allPackages.filter((p) => p.status === 'published').length,
      draftPackages: allPackages.filter((p) => p.status !== 'published').length,
      activeLeads: allRequests.filter((r) => r.status === 'open').length,
      offersSent: offers.length,
      bookingIntents: bookings.length,
    });

    setRequests(allRequests.filter((r) => r.status === 'open').slice(0, 3));

    const acts: ActivityItem[] = [];
    allRequests.slice(0, 4).forEach((r) =>
      acts.push({ title: `New lead: ${r.type.toUpperCase()} — ${r.season}`, date: r.createdAt, type: 'lead' })
    );
    offers.slice(0, 4).forEach((o) => acts.push({ title: 'Offer sent', date: o.createdAt, type: 'offer' }));
    bookings.slice(0, 4).forEach((b) =>
      acts.push({ title: `Booking intent ${b.referenceCode ?? ''}`, date: b.createdAt, type: 'booking' })
    );
    acts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivity(acts.slice(0, 5));

    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
  }, [operatorId]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, requests, packages, activity, isLoading, lastUpdated, refresh: load };
}

export function OperatorDashboard({ operatorId }: { operatorId: string }) {
  const { stats, requests, packages, activity, isLoading, lastUpdated, refresh } = useDashboardData(operatorId);

  return (
    <div className="space-y-8" data-testid="operator-dashboard">
      {/* Summary + manual refresh */}
      <section className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-[var(--text)]">Summary</h2>
            <p className="mt-1 text-sm text-[var(--textMuted)]" data-testid="dashboard-summary">
              {stats.publishedPackages} published package{stats.publishedPackages === 1 ? '' : 's'}
              {stats.draftPackages > 0 ? ` · ${stats.draftPackages} draft${stats.draftPackages === 1 ? '' : 's'}` : ''}
              {' · '}{stats.activeLeads} active lead{stats.activeLeads === 1 ? '' : 's'}
              {' · '}{stats.bookingIntents} booking intent{stats.bookingIntents === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-[var(--textMuted)]" data-testid="dashboard-last-updated">
                Updated {relativeTime(lastUpdated)}
              </span>
            )}
            <button
              type="button"
              onClick={refresh}
              disabled={isLoading}
              data-testid="dashboard-refresh"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--borderStrong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] disabled:opacity-50"
            >
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published Packages" value={stats.publishedPackages} href="/operator/packages" testid="stat-packages" />
        <StatCard label="Active Leads" value={stats.activeLeads} href="/operator/leads" testid="stat-leads" />
        <StatCard label="Offers Sent" value={stats.offersSent} href="/operator/leads" testid="stat-offers" />
        <StatCard label="Booking Intents" value={stats.bookingIntents} href="/operator/leads" testid="stat-bookings" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/operator/packages"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--yellow)] px-4 py-2.5 text-sm font-medium text-black transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
          data-testid="quick-create-package"
        >
          Create Package
        </Link>
        <Link
          href="/operator/leads"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--borderStrong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
          data-testid="quick-view-leads"
        >
          View Leads
        </Link>
      </div>

      {/* Recent activity */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text)]">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[var(--textMuted)]">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-3">
                <span className={`h-2 w-2 rounded-full ${item.type === 'lead' ? 'bg-blue-400' : item.type === 'offer' ? 'bg-[var(--yellow)]' : 'bg-[var(--color-success)]'}`} aria-hidden="true" />
                <span className="flex-1 text-sm text-[var(--text)]">{item.title}</span>
                <span className="text-xs text-[var(--textMuted)]">{relativeTime(item.date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Packages mini-list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Your Packages</h2>
          <Link href="/operator/packages" className="text-sm text-[var(--yellow)] hover:underline">
            Manage all →
          </Link>
        </div>
        {packages.length === 0 ? (
          <p className="text-sm text-[var(--textMuted)]">No packages yet. Create your first to start receiving leads.</p>
        ) : (
          <div className="space-y-2" data-testid="dashboard-packages-list">
            {packages.slice(0, 5).map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{pkg.title}</p>
                  <p className="text-xs text-[var(--textMuted)]">
                    {pkg.pilgrimageType.toUpperCase()} · {pkg.currency ?? 'GBP'} {pkg.pricePerPerson}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    pkg.status === 'published'
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                      : 'bg-[rgba(255,255,255,0.08)] text-[var(--textMuted)]'
                  }`}
                >
                  {pkg.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest leads preview */}
      {requests.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text)]">Latest Leads</h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{req.type.toUpperCase()} — {req.season}</p>
                  <p className="text-xs text-[var(--textMuted)]">{req.departureCity || 'Any departure'} • {req.totalNights} nights</p>
                </div>
                <Link href="/operator/leads" className="text-sm text-[var(--yellow)] hover:underline">
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completeness nudge */}
      <section className="rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
        <h2 className="text-sm font-medium text-[var(--text)]">Build trust with travellers</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">
          Complete your profile and add ATOL/ABTA numbers to increase visibility and bookings.
        </p>
        <div className="mt-3 flex gap-3">
          <Link
            href="/operator/profile"
            className="text-sm text-[var(--yellow)] hover:underline"
            data-testid="nudge-complete-profile"
          >
            Complete Profile →
          </Link>
          <Link
            href="/operator/settings/payment-details"
            className="text-sm text-[var(--yellow)] hover:underline"
            data-testid="nudge-payment-details"
          >
            Add Payment Details →
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href, testid }: { label: string; value: number; href: string; testid: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4 transition-colors hover:border-[var(--yellow)]"
      data-testid={testid}
    >
      <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--textMuted)]">{label}</p>
    </Link>
  );
}
