'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReconciliationRow } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: toDateInput(from), to: toDateInput(to) };
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function ReconciliationPage() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [rows, setRows] = useState<ReconciliationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reconciliation?from=${from}&to=${to}&format=json`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load reconciliation data');
      }
      const data = (await res.json()) as { rows: ReconciliationRow[]; count: number };
      setRows(data.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reconciliation data');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reconciliation?from=${from}&to=${to}&format=csv`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Export failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation_${from}_to_${to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  }, [from, to]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <Heading as={1} size="xl">
          Reconciliation export
        </Heading>
        <Text tone="muted" size="sm">
          Export bookings and payment evidence for monthly reconciliation. Verify the data below before downloading.
        </Text>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="recon-from" className="text-xs font-medium text-[var(--textMuted)]">
                From
              </label>
              <input
                id="recon-from"
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="recon-to" className="text-xs font-medium text-[var(--textMuted)]">
                To
              </label>
              <input
                id="recon-to"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                className="min-h-11 rounded-md border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] px-3 text-sm text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)]"
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || loading || rows.length === 0}
              className="inline-flex min-h-11 items-center rounded-md bg-[var(--yellow)] px-4 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </CardBody>
      </Card>

      {error ? (
        <div role="alert" className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-4">
          <Text tone="muted" size="sm">
            {error}
          </Text>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Text tone="muted" size="sm" aria-live="polite">
          {loading ? 'Loading…' : `${rows.length} booking${rows.length === 1 ? '' : 's'} in range`}
        </Text>
      </div>

      {!loading && rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--borderSubtle)] p-10 text-center">
          <Text tone="muted" size="sm">
            No bookings found in the selected date range.
          </Text>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--borderSubtle)]">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Reconciliation data for the selected date range</caption>
            <thead>
              <tr className="border-b border-[var(--borderSubtle)] text-xs uppercase tracking-wide text-[var(--textMuted)]">
                <th scope="col" className="px-3 py-2 font-medium">Reference</th>
                <th scope="col" className="px-3 py-2 font-medium">Status</th>
                <th scope="col" className="px-3 py-2 font-medium">Operator</th>
                <th scope="col" className="px-3 py-2 font-medium">Payment Ref</th>
                <th scope="col" className="px-3 py-2 font-medium">Payer</th>
                <th scope="col" className="px-3 py-2 font-medium">Evidence</th>
                <th scope="col" className="px-3 py-2 font-medium">Outcome</th>
                <th scope="col" className="px-3 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.referenceCode} className="border-b border-[var(--borderSubtle)] last:border-0">
                  <td className="px-3 py-2 font-medium text-[var(--text)]">{r.referenceCode}</td>
                  <td className="px-3 py-2">
                    <Badge variant="default">{r.status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-[var(--text)]">{r.operatorName}</td>
                  <td className="px-3 py-2 text-[var(--textMuted)]">{r.paymentReference ?? '—'}</td>
                  <td className="px-3 py-2 text-[var(--textMuted)]">{r.payerName ?? '—'}</td>
                  <td className="px-3 py-2 text-[var(--textMuted)]">{r.evidenceStatus ?? '—'}</td>
                  <td className="px-3 py-2 text-[var(--textMuted)]">{r.outcome ?? '—'}</td>
                  <td className="px-3 py-2 text-[var(--textMuted)]">{formatDate(r.bookingCreatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
