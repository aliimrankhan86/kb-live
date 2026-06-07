import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { PaymentDetailsClient } from '@/components/operator/PaymentDetailsClient';

export default async function PaymentDetailsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/settings/payment-details');

  return <PaymentDetailsClient operatorId={user.id} />;
}
