import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { OperatorPackagesClient } from '@/components/operator/OperatorPackagesClient';

export default async function OperatorPackagesPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/packages');

  return <OperatorPackagesClient operatorId={user.id} />;
}
