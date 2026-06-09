import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { OperatorLeadsClient } from '@/components/operator/OperatorLeadsClient';

export default async function OperatorLeadsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/leads');

  return <OperatorLeadsClient operatorId={user.id} />;
}
