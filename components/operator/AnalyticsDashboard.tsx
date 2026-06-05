'use client';

import { useEffect, useState } from 'react';
import { MockDB } from '@/lib/api/mock-db';
import { Repository } from '@/lib/api/repository';

export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    requests: 0,
    offers: 0,
    bookings: 0,
  });

  useEffect(() => {
    // Mock operator login
    MockDB.setCurrentUser('operator');
    const ctx = { userId: 'op1', role: 'operator' as const }; // Explicit type match

    const allOffers = MockDB.getOffers().filter(o => o.operatorId === 'op1');
    const allBookings = MockDB.getBookingIntents().filter(b => b.operatorId === 'op1');
    
    // Total requests received = Requests where I have visibility.
    // Repository.getRequests(ctx) returns all open + responded.
    const requests = Repository.getRequests(ctx).length;

    setStats({
      requests,
      offers: allOffers.length,
      bookings: allBookings.length,
    });
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.64)]">Total Requests Visible</h3>
        <p className="mt-2 text-3xl font-bold text-[#FFFFFF]">{stats.requests}</p>
      </div>
      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.64)]">Offers Sent</h3>
        <p className="mt-2 text-3xl font-bold text-[#FFD31D]">{stats.offers}</p>
      </div>
      <div className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111111] p-6">
        <h3 className="text-sm font-medium text-[rgba(255,255,255,0.64)]">Booking Intents</h3>
        <p className="mt-2 text-3xl font-bold text-green-500">{stats.bookings}</p>
      </div>
    </div>
  );
}
