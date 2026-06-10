import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { PaymentDetailsClient } from '@/components/operator/PaymentDetailsClient';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default async function PaymentDetailsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?redirect=/operator/settings/payment-details');

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/operator/dashboard' },
          { label: 'Settings', href: '/operator/settings' },
          { label: 'Payment details' },
        ]}
      />
      <PaymentDetailsClient />
    </div>
  );
}
