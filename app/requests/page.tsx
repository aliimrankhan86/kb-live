'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { QuoteRequest } from '@/lib/types';

const STATUS_LABEL: Record<QuoteRequest['status'], string> = {
  open: 'Open',
  responded: 'Responded',
  closed: 'Closed',
};

const STATUS_COLOR: Record<QuoteRequest['status'], string> = {
  open: 'var(--yellow)',
  responded: 'var(--color-success)',
  closed: 'var(--textMuted)',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/quote-requests');
        if (res.status === 401) {
          router.push('/login?next=/requests');
          return;
        }
        if (!res.ok) throw new Error('Failed to load requests');
        const data = (await res.json()) as { requests: QuoteRequest[] };
        setRequests(data.requests);
      } catch {
        setError('Could not load your requests. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [router]);

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Requests</h1>
            <Link
              href="/quote"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                background: 'var(--yellow)', color: '#000', fontWeight: 700,
                padding: '0.625rem 1.25rem', borderRadius: 'var(--radiusMd)',
                textDecoration: 'none', fontSize: '0.9375rem', whiteSpace: 'nowrap',
              }}
              data-testid="new-request-btn"
            >
              + New Request
            </Link>
          </div>

          {loading && (
            <p style={{ color: 'var(--textMuted)', textAlign: 'center', padding: '3rem 0' }}>Loading…</p>
          )}

          {error && (
            <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: '3rem 0' }}>{error}</p>
          )}

          {!loading && !error && requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--textMuted)' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>No requests yet.</p>
              <Link
                href="/quote"
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'var(--yellow)', color: '#000', fontWeight: 700,
                  padding: '0.75rem 1.5rem', borderRadius: 'var(--radiusMd)',
                  textDecoration: 'none',
                }}
              >
                Get your first quote
              </Link>
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map(req => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: 'var(--surfaceDark)', border: '1px solid var(--borderSubtle)',
                    borderRadius: 'var(--radiusMd)', padding: '1.25rem',
                    transition: 'border-color 0.2s',
                  }}
                  data-testid="request-item"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
                        {req.type} · {req.totalNights} nights · {req.hotelStars}★
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--textMuted)' }}>
                        {formatDate(req.createdAt)}
                        {req.departureCity ? ` · from ${req.departureCity}` : ''}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem',
                      borderRadius: '999px', border: `1px solid ${STATUS_COLOR[req.status]}`,
                      color: STATUS_COLOR[req.status], whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {STATUS_LABEL[req.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
