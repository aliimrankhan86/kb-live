import { notFound } from 'next/navigation';
import { isRfqQuoteEnabled } from '@/lib/config';
import { RequestsListClient } from '@/components/request/RequestsListClient';

// PARKED with the RFQ quote engine (PARKED_FEATURES.md #2): quote requests only
// exist through /quote, so this list 404s when the flag is off.
export default function RequestsPage() {
  if (!isRfqQuoteEnabled()) notFound();
  return <RequestsListClient />;
}
