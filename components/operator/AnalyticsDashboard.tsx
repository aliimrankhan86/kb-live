'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BarChart, ChartContainer } from '@/components/ui/Chart';
import { Repository } from '@/lib/api/repository';
import type { AnalyticsEventCounts, AnalyticsTrendDay } from '@/lib/types';
import { ANALYTICS_EVENT_TYPES } from '@/lib/types';

const RANGE_OPTIONS = [7, 30, 90] as const;
type AnalyticsRangeDays = (typeof RANGE_OPTIONS)[number];

const emptyAnalyticsCounts = (): AnalyticsEventCounts =>
  Object.fromEntries(ANALYTICS_EVENT_TYPES.map((t) => [t, 0])) as AnalyticsEventCounts;

const getRangeStart = (days: number) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - days + 1);
  return start;
};

const getTrendValue = (day: AnalyticsTrendDay) =>
  day.package_view + day.quote_request + day.offer_sent + day.booking_started + day.booking_confirmed;

const getTrendLabel = (date: string, index: number, total: number) => {
  const interval = total > 60 ? 14 : total > 14 ? 7 : 1;
  const lastIntervalMark = Math.floor((total - 1) / interval) * interval;
  if (index === total - 1 && total - 1 - lastIntervalMark < Math.ceil(interval / 2)) return '';
  if (index !== 0 && index !== total - 1 && index % interval !== 0) return '';
  const [, month, day] = date.split('-');
  return `${Number(day)}/${Number(month)}`;
};

const percentage = (part: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
};

const dropOff = (current: number, next: number) => {
  if (current <= 0) return 0;
  return Math.max(0, 100 - percentage(next, current));
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5">
      <h3 className="text-sm font-medium text-[var(--textMuted)]">{label}</h3>
      <p className="mt-2 text-3xl font-bold text-[var(--text)]">{value.toLocaleString()}</p>
    </div>
  );
}

function Funnel({ summary }: { summary: AnalyticsEventCounts }) {
  const stages = [
    { label: 'Views', value: summary.package_view },
    { label: 'Quotes', value: summary.quote_request },
    { label: 'Offers', value: summary.offer_sent },
    { label: 'Bookings', value: summary.booking_confirmed },
  ];

  return (
    <section className="rounded-lg border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] p-5" data-testid="analytics-funnel">
      <h2 className="text-base font-semibold text-[var(--text)]">Conversion Funnel</h2>
      <p className="mt-0.5 text-sm text-[var(--textMuted)]">Views to confirmed bookings for the selected date range.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => {
          const previous = stages[index - 1];
          const stageDropOff = previous ? dropOff(previous.value, stage.value) : 0;
          const stageConversion = previous ? percentage(stage.value, previous.value) : 100;
          return (
            <div key={stage.label} className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-sm font-medium text-[var(--textMuted)]">{stage.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{stage.value.toLocaleString()}</p>
              <p className="mt-2 text-xs text-[var(--textMuted)]">
                {previous
                  ? `${stageDropOff}% drop-off · ${stageConversion}% conversion`
                  : 'Entry point'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--borderSubtle)] bg-[var(--surfaceDark)] text-[var(--textMuted)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[var(--text)]">No activity yet</p>
      <p className="max-w-xs text-xs text-[var(--textMuted)]">
        Events appear here once travellers view your packages and request quotes.
      </p>
    </div>
  );
}

interface AnalyticsDashboardProps {
  operatorId: string;
}

export function AnalyticsDashboard({ operatorId }: AnalyticsDashboardProps) {
  const searchParams = useSearchParams();
  const rawRange = searchParams.get('range');
  const days: AnalyticsRangeDays =
    rawRange === '7' ? 7 : rawRange === '90' ? 90 : 30;

  const [summary, setSummary] = useState<AnalyticsEventCounts>(emptyAnalyticsCounts());
  const [trend, setTrend] = useState<AnalyticsTrendDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    const fromDate = getRangeStart(days);
    const [s, t] = await Promise.all([
      Repository.getAnalyticsSummary(operatorId, fromDate, new Date()),
      Repository.getAnalyticsTrend(operatorId, days),
    ]);
    setSummary(s);
    setTrend(t);
    setLoaded(true);
  }, [operatorId, days]);

  useEffect(() => { loadData(); }, [loadData]);

  const trendPoints = trend.map((day, index) => ({
    label: getTrendLabel(day.date, index, trend.length),
    value: getTrendValue(day),
  }));

  const hasData = loaded &&
    summary.package_view + summary.quote_request + summary.offer_sent +
    summary.booking_started + summary.booking_confirmed > 0;

  return (
    <div className="space-y-6" data-testid="operator-analytics-dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--textMuted)]">Performance from real platform events.</p>
        <div className="flex flex-wrap gap-2" aria-label="Analytics date range">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option}
              href={`/operator/analytics?range=${option}`}
              data-testid={`analytics-range-${option}`}
              className={`inline-flex min-h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] ${
                option === days
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
            >
              {option}d
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Package Views" value={summary.package_view} />
        <SummaryCard label="Quote Requests" value={summary.quote_request} />
        <SummaryCard label="Offers Sent" value={summary.offer_sent} />
        <SummaryCard label="Bookings Started" value={summary.booking_started} />
        <SummaryCard label="Bookings Confirmed" value={summary.booking_confirmed} />
      </section>

      {!loaded ? (
        <div className="h-40 animate-pulse rounded-xl border border-[var(--borderSubtle)] bg-[var(--surfaceDark)]" />
      ) : hasData ? (
        <>
          <Funnel summary={summary} />
          <ChartContainer title={`${days}-day activity trend`} subtitle="Key event volume by day" data-testid="analytics-trend">
            <BarChart points={trendPoints} />
          </ChartContainer>
        </>
      ) : (
        <ChartContainer title="Activity trend" subtitle="Key event volume by day" data-testid="analytics-trend">
          <EmptyChart />
        </ChartContainer>
      )}
    </div>
  );
}
