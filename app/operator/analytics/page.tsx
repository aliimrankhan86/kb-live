import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { AnalyticsDashboard } from '@/components/operator/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/analytics');

  return <AnalyticsDashboard operatorId={user.id} />;
}
