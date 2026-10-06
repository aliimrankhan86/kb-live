import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { Repository } from '@/lib/api/repository';
import { AnalyticsDashboard, type AnalyticsRangeDays } from '@/components/operator/AnalyticsDashboard';

/** First UTC day of a trailing window of `days` days (inclusive of today). */
function rangeStart(days: number): Date {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - days + 1);
  return start;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/analytics');

  const range = (await searchParams).range;
  const days: AnalyticsRangeDays = range === '7' ? 7 : range === '90' ? 90 : 30;

  // Server-side: real events from Postgres (the browser only reaches MockDB).
  const [summary, trend] = await Promise.all([
    Repository.getAnalyticsSummary(user.id, rangeStart(days), new Date()),
    Repository.getAnalyticsTrend(user.id, days),
  ]);

  return <AnalyticsDashboard days={days} summary={summary} trend={trend} />;
}
