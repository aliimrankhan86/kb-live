import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { AnalyticsDashboard } from '@/components/operator/AnalyticsDashboard';

const parseRange = (range?: string) => {
  if (range === '7' || range === '30' || range === '90') return Number(range) as 7 | 30 | 90;
  return 30;
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/analytics');

  const params = searchParams ? await searchParams : {};
  return <AnalyticsDashboard operatorId={user.id} days={parseRange(params.range)} />;
}
