import Link from 'next/link';
import { BarChart, ChartContainer } from '@/components/ui/Chart';
import { Repository } from '@/lib/api/repository';
import type { AnalyticsEventCounts, AnalyticsTrendDay } from '@/lib/types';

const RANGE_OPTIONS = [7, 30, 90] as const;

type AnalyticsRangeDays = (typeof RANGE_OPTIONS)[number];

interface AnalyticsDashboardProps {
  operatorId: string;
  days?: AnalyticsRangeDays;
}

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
      <p className="mt-2 text-3xl font-bold text-[var(--text)]">{value}</p>
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
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">Conversion Funnel</h2>
        <p className="mt-1 text-sm text-[var(--textMuted)]">Views to confirmed bookings for the selected date range.</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => {
          const previous = stages[index - 1];
          const stageDropOff = previous ? dropOff(previous.value, stage.value) : 0;
          const stageConversion = previous ? percentage(stage.value, previous.value) : 100;
          return (
            <div key={stage.label} className="rounded-md border border-[var(--borderSubtle)] bg-[rgba(255,255,255,0.03)] p-4">
              <p className="text-sm font-medium text-[var(--textMuted)]">{stage.label}</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{stage.value}</p>
              <p className="mt-2 text-xs text-[var(--textMuted)]">
                {previous ? `${stageDropOff}% drop-off · ${stageConversion}% conversion` : 'Entry point'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export async function AnalyticsDashboard({ operatorId, days = 30 }: AnalyticsDashboardProps) {
  const fromDate = getRangeStart(days);
  const [summary, trend] = await Promise.all([
    Repository.getAnalyticsSummary(operatorId, fromDate, new Date()),
    Repository.getAnalyticsTrend(operatorId, days),
  ]);

  const trendPoints = trend.map((day, index) => ({
    label: getTrendLabel(day.date, index, trend.length),
    value: getTrendValue(day),
  }));

  return (
    <div className="space-y-6" data-testid="operator-analytics-dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--textMuted)]">Performance from real platform events.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Analytics date range">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option}
              href={`/operator/analytics?range=${option}`}
              data-testid={`analytics-range-${option}`}
              className={`inline-flex min-h-11 items-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] ${
                option === days
                  ? 'border-[var(--yellow)] bg-[rgba(255,211,29,0.12)] text-[var(--text)]'
                  : 'border-[var(--borderSubtle)] text-[var(--textMuted)] hover:border-[var(--borderStrong)]'
              }`}
            >
              Last {option} days
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

      <Funnel summary={summary} />

      <ChartContainer title={`${days}-day activity trend`} subtitle="Key event volume by day" data-testid="analytics-trend">
        <BarChart points={trendPoints} />
      </ChartContainer>
    </div>
  );
}
