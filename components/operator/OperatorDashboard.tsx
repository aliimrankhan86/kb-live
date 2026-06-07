'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';
import { QuoteRequest, Offer } from '@/lib/types';

type DashboardStats = {
  publishedPackages: number;
  activeLeads: number;
  offersSent: number;
  bookingIntents: number;
};

function getOperatorId(): string {
  MockDB.setCurrentUser('operator');
  return MockDB.currentUser.id;
}

function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({ publishedPackages: 0, activeLeads: 0, offersSent: 0, bookingIntents: 0 });
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [activity, setActivity] = useState<{ title: string; date: string; type: 'lead' | 'offer' | 'booking' }[]>([]);

  useEffect(() => {
    const operatorId = getOperatorId();
    const ctx = { userId: operatorId, role: 'operator' as const };

    const load = async () => {
      const packages = await Repository.getPackagesByOperator(operatorId);
      const allRequests = await Repository.getRequests(ctx);
      const offers = MockDB.getOffers().filter((o: Offer) => o.operatorId === operatorId);
      const bookings = await Repository.getBookingIntents(ctx);

      setStats({
        publishedPackages: packages.filter((p) => p.status === 'published').length,
        activeLeads: allRequests.filter((r) => r.status === 'open').length,
        offersSent: offers.length,
        bookingIntents: bookings.length,
      });

      // Show last 5 open requests as activity
      setRequests(allRequests.filter((r) => r.status === 'open').slice(0, 3));

      const acts: { title: string; date: string; type: 'lead' | 'offer' | 'booking' }[] = [];
      allRequests.slice(0, 2).forEach((r) => acts.push({ title: `New lead: ${r.type.toUpperCase()} — ${r.season}`, date: r.createdAt, type: 'lead' }));
      offers.slice(0, 2).forEach((o) => acts.push({ title: 'Offer sent', date: o.createdAt, type: 'offer' }));
      bookings.slice(0, 1).forEach((b) => acts.push({ title: `Booking intent ${b.referenceCode ?? ''}`, date: b.createdAt, type: 'booking' }));
      acts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivity(acts.slice(0, 5));
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return { stats, requests, activity };
}

export function OperatorDashboard() {
  const { stats, requests, activity } = useDashboardData();

  return (
    <div className="space-y-8" data-testid="operator-dashboard">
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
                <span className={`h-2 w-2 rounded-full ${item.type === 'lead' ? 'bg-blue-400' : item.type === 'offer' ? 'bg-[var(--yellow)]' : 'bg-green-400'}`} aria-hidden="true" />
                <span className="flex-1 text-sm text-[var(--text)]">{item.title}</span>
                <span className="text-xs text-[var(--textMuted)]">{new Date(item.date).toLocaleDateString()}</span>
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